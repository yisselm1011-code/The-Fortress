// TEACHER-OWNED: boot the same home/game scenes used by the Overworld.
// The generated settings choose one pack; no student-specific engine fork exists.
runPackRegistryChecks();
refreshHomeRegistry();
const exportedPack = getStudentPack(window.FVGD_STANDALONE.packId);
if (!exportedPack) {
  throw new Error("Exported pack was rejected. Check the console for its validation errors.");
}
sceneManager.register(standaloneMenu);
// Keep the existing error fallback usable without shipping a class map scene.
sceneManager.scenes.overworld = standaloneMenu;
sceneManager.register(platformerScene);
sceneManager.register(topdownScene);
sceneManager.register(arenaScene);
sceneManager.register(sportsScene);
sceneManager.register(basketballScene);
sceneManager.register(soccerScene);
sceneManager.register(footballScene);
sceneManager.register(ranchScene);
registerStudentHomeScenes();
loadLocal(1);
markHomeVisited(exportedPack.manifest.id);
sceneManager.changeSceneImmediate(standaloneHomeName());
requestAnimationFrame(gameLoop);
