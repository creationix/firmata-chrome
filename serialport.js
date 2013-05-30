/*global chrome*/
exports.SerialPort = SerialPort;
var EventEmitter = require('./events.js').EventEmitter;
var util = require('./util.js');

function SerialPort(port, options) {
  var self = this;
  var id;
  var bytesToRead = options.buffersize || 1;
  chrome.serial.open(port, {
    bitrate: options.baudrate || 9600
  }, onOpen);
  
  function onOpen (info) {
    id = self.id = info.connectionId
    if (id < 0) {
      self.emit("error", new Error("Cannot connect to " + port));
      return;
    }
    self.emit("open");
    startRead();
  }
  var reading = false;
  function startRead() {
    if (reading) return;
    reading = true;
    chrome.serial.read(id, bytesToRead, onRead);
  }
  function onRead(info) {
    reading = false;
    if (!info.bytesRead) {
      setTimeout(startRead, 16);
      return;
    }
    var data = new Uint8Array(info.data);
    self.emit("data", data);
    // console.log("IN", data);
    startRead();
  }
  
  this.write = function (data) {
    data = new Uint8Array(data);
    // console.log("OUT", data);
    chrome.serial.write(id, data.buffer, onWrite);
  };
  
  function onWrite() {
    // log("onWrite", arguments);
  }
}
util.inherits(SerialPort, EventEmitter);