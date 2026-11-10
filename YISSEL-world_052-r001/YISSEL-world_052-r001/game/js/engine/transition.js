// TEACHER-OWNED: fade-to-black when changing scenes.
const transition = {
  active: false,
  alpha: 0,
  direction: "out",
  speed: 0.05,
  nextScene: null,
  switched: false
};

function startTransition(nextSceneName) {
  transition.active = true;
  transition.alpha = 0;
  transition.direction = "out";
  transition.nextScene = nextSceneName;
  transition.switched = false;
}

function updateTransition() {
  if (!transition.active) {
    return;
  }

  if (transition.direction === "out") {
    transition.alpha += transition.speed;
    if (transition.alpha >= 1) {
      transition.alpha = 1;
      if (!transition.switched && transition.nextScene) {
        sceneManager.changeSceneImmediate(transition.nextScene);
        transition.switched = true;
      }
      transition.direction = "in";
    }
  } else {
    transition.alpha -= transition.speed;
    if (transition.alpha <= 0) {
      transition.alpha = 0;
      transition.active = false;
      transition.nextScene = null;
      transition.switched = false;
    }
  }
}

function drawTransition(ctx) {
  if (!transition.active || transition.alpha <= 0) {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, " + transition.alpha + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function isTransitionBlockingInput() {
  return transition.active && transition.alpha > 0.4;
}
