// TEACHER-OWNED: keyboard state. isPressed() is true only on the frame a key goes down.
const input = {
  held: {},
  pressed: {},
  pointerPressed: false,

  isDown(code) {
    return !!this.held[code];
  },

  isPressed(code) {
    return !!this.pressed[code];
  },

  update() {
    this.pressed = {};
    this.pointerPressed = false;
  }
};

const INPUT_CODES = [
  "KeyW", "KeyA", "KeyS", "KeyD", "KeyR", "KeyJ", "KeyF", "KeyI", "KeyK", "KeyL", "KeyQ", "KeyH",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "Enter", "KeyE", "Escape", "Space", "Tab", "Backspace",
  "KeyY", "KeyN",
  "ShiftLeft", "ShiftRight", "F1", "F2", "F3",
  "Digit0", "Digit1", "Digit2", "Digit3", "Digit4",
  "Digit5", "Digit6", "Digit7", "Digit8", "Digit9",
  "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4",
  "Numpad5", "Numpad6", "Numpad7", "Numpad8", "Numpad9"
];

window.addEventListener("keydown", function (event) {
  if (INPUT_CODES.includes(event.code)) {
    if (!input.held[event.code]) {
      input.pressed[event.code] = true;
    }
    input.held[event.code] = true;
  }

  if (event.code === "F1" || event.code === "F2" || event.code === "F3" || event.code === "Space" ||
      (event.code === "Tab" && gameState.currentScene === "basketball")) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", function (event) {
  if (INPUT_CODES.includes(event.code)) {
    input.held[event.code] = false;
  }
});

// Convenience helpers used by player movement.
function isMoveUp() {
  return input.isDown("KeyW") || input.isDown("ArrowUp");
}

function isMoveDown() {
  return input.isDown("KeyS") || input.isDown("ArrowDown");
}

function isMoveLeft() {
  return input.isDown("KeyA") || input.isDown("ArrowLeft");
}

function isMoveRight() {
  return input.isDown("KeyD") || input.isDown("ArrowRight");
}

// A click/tap is a one-frame action, like a fresh Space press. Only basketball uses it.
canvas.addEventListener("pointerdown", function(event) {
  if(event.button===0 && gameState.currentScene==="basketball") {
    input.pointerPressed=true;event.preventDefault();
  }
});
window.addEventListener("blur",function(){input.held={};input.pressed={};input.pointerPressed=false;});
