// TEACHER-OWNED: offline services for an exported student game.
// Exports never load classroom sign-in, submissions, telemetry or cloud config.
const authState = { activeSlot: 1, displayName: "" };
function standaloneHomeName() {
  return "home_" + window.FVGD_STANDALONE.packId;
}

// Leaving the home opens a small menu rather than a class-wide map.
const standaloneMenu = {
  name: "standaloneMenu",
  create() { gameState.currentScene = this.name; },
  update() {
    if (!isTransitionBlockingInput() && input.isPressed("Enter")) {
      sceneManager.changeScene(standaloneHomeName());
    }
  },
  draw(ctx) {
    ctx.fillStyle = "#101827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "26px monospace";
    const pack = getStudentPack(window.FVGD_STANDALONE.packId);
    ctx.fillText(pack.manifest.name, canvas.width / 2, 260);
    ctx.font = "18px monospace";
    ctx.fillText("Press Enter to return home", canvas.width / 2, 320);
    ctx.restore();
  },
  exit() {}
};
