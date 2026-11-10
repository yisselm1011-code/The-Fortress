// TEACHER-OWNED: one animation frame — update the active scene, then draw it.
// The frame is wrapped so a bad pack can never stop the loop from rescheduling.
let lastTime = 0;
let frameErrorCount = 0;
const MAX_FRAME_ERRORS_LOGGED = 10;

function gameLoop(timestamp) {
  try {
    runFrame(timestamp);
  } catch (err) {
    frameErrorCount += 1;
    if (frameErrorCount <= MAX_FRAME_ERRORS_LOGGED) {
      console.error("Frame error (game keeps running):", err);
      if (frameErrorCount === MAX_FRAME_ERRORS_LOGGED) {
        console.error("Further frame errors will not be logged.");
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

function runFrame(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  updateDebugStats(deltaTime);
  handleDebugInput();

  updateTransition();

  if (!isTransitionBlockingInput()) {
    sceneManager.update(deltaTime);
  }

  draw();
  input.update();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sceneManager.draw(ctx);
  drawTransition(ctx);
  drawPackReport(ctx);
}
