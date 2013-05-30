/*global chrome*/
"use strict";

// var log = require('domlog');
var firmata = require('./firmata.js');
var domBuilder = require('dombuilder');

// window.log = log;

document.body.innerText = "";

// log.setup({
//   top: "0",
//   height: "auto",
//   background: "#222"
// });

var modeNames = [
  "INPUT",
  "OUTPUT",
  "ANALOG",
  "PWM",
  "SERVO",
];

chrome.serial.getPorts(function (ports) {
  var board = window.board = new firmata.Board(ports[0], function (err) {
    if (err) throw err;
    console.log("board", board);
    var form = ["form",
      { onchange: onChange, onsubmit: onSubmit },
      board.pins.map(function (pin, i) {
        console.log(i, pin);
        if (!pin.supportedModes.length) return [];
        return [".pin",
          "Pin " + i,
          renderSelect(pin, i),
          renderValue(pin, i)
        ];
      })
    ];
    document.body.appendChild(domBuilder(form));

  });  
  
  function onChange(evt) {
    var target = evt.target.name.split("-");
    var command = target[0];
    var pin = parseInt(target[1], 10);
    var value = evt.target.checked ? 1 : 0;
    
    console.log("onChange", command, pin, value);

    if (command === "mode") {
      board.pinMode(pin, value);
      if (value === board.MODES.INPUT) {
        var input = this["value-" + pin];
        board.digitalRead(pin, function (value) {
          input.checked = value;
        });
      }
    }
    else if (command === "value") {
      board.digitalWrite(pin, value);
    }

  }
  
  function onSubmit(evt) {
    evt.preventDefault();
  }

  function renderSelect(pin, i) {
    return ["select", {name: "mode-" + i},
      pin.supportedModes.map(function (mode) {
        var opt = {value: mode};
        if (mode === pin.mode) {
          opt.selected=true;
        }
        return ["option", opt, modeNames[mode]];  
      })
    ];
  }
  
  function renderValue(pin, i) {
    var opts = {
      type: "checkbox",
      name: "value-" + i
    };
    if (pin.value) opts.checked = true;
    return ["input", opts];
  }


});

