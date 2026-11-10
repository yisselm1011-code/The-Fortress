// TEACHER-OWNED: only one scene is active at a time (title, overworld, home, platformer).
// A scene that throws is quarantined instead of freezing the game for everyone else.
const sceneErrorInfo = {
  sceneName: "",
  message: ""
};

function describeSceneError(err) {
  if (!err) {
    return "Unknown error";
  }
  return err.message ? err.message : String(err);
}

const sceneErrorScene = {
  name: "__sceneError",

  create() {},

  update() {
    if (input.isPressed("Enter") || input.isPressed("Escape")) {
      sceneManager.changeSceneImmediate(sceneManager.fallbackSceneName());
    }
  },

  draw(ctx) {
    ctx.fillStyle = "#0d0d1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#e74c3c";
    ctx.font = "24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("This world is under construction", canvas.width / 2, 200);

    ctx.fillStyle = "#ffffff";
    ctx.font = "15px monospace";
    ctx.fillText(sceneErrorInfo.sceneName, canvas.width / 2, 250);
    ctx.fillText(sceneErrorInfo.message.slice(0, 70), canvas.width / 2, 290);
    ctx.fillText("Press F3 for the pack report, F12 for the console.", canvas.width / 2, 350);
    ctx.fillText("Press Enter to go back.", canvas.width / 2, 390);
  },

  exit() {}
};

const sceneManager = {
  scenes: {},
  currentScene: null,
  brokenScenes: {},

  register(scene) {
    this.scenes[scene.name] = scene;
  },

  changeScene(sceneName) {
    if (transition.active) {
      return;
    }
    startTransition(sceneName);
  },

  fallbackSceneName() {
    if (!this.brokenScenes.overworld && this.scenes.overworld) {
      return "overworld";
    }
    return "title";
  },

  quarantine(sceneName, err) {
    const message = describeSceneError(err);
    console.error("Scene '" + sceneName + "' was disabled after an error:", err);
    this.brokenScenes[sceneName] = message;
    this.showSceneError(sceneName, message);
  },

  showSceneError(sceneName, message) {
    sceneErrorInfo.sceneName = sceneName;
    sceneErrorInfo.message = message;
    this.currentScene = sceneErrorScene;
    gameState.currentScene = sceneErrorScene.name;
  },

  changeSceneImmediate(sceneName) {
    const nextScene = this.scenes[sceneName];
    if (!nextScene) {
      console.warn("Scene not found:", sceneName);
      return;
    }

    if (this.brokenScenes[sceneName]) {
      this.showSceneError(sceneName, this.brokenScenes[sceneName]);
      return;
    }

    if (this.currentScene && this.currentScene.exit) {
      try {
        this.currentScene.exit();
      } catch (err) {
        console.warn("Scene '" + this.currentScene.name + "' failed to exit cleanly:", err);
      }
    }

    this.currentScene = nextScene;
    gameState.currentScene = sceneName;

    if (nextScene.create) {
      try {
        nextScene.create();
      } catch (err) {
        this.quarantine(sceneName, err);
      }
    }
  },

  update(deltaTime) {
    if (!this.currentScene || !this.currentScene.update) {
      return;
    }
    try {
      this.currentScene.update(deltaTime);
    } catch (err) {
      this.handleActiveSceneError(err);
    }
  },

  draw(ctx) {
    if (!this.currentScene || !this.currentScene.draw) {
      return;
    }
    try {
      this.currentScene.draw(ctx);
    } catch (err) {
      this.handleActiveSceneError(err);
    }
  },

  handleActiveSceneError(err) {
    if (this.currentScene === sceneErrorScene) {
      console.error("Error screen failed:", err);
      return;
    }
    this.quarantine(this.currentScene.name, err);
  }
};
