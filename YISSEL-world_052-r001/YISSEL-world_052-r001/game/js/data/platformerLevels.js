// TEACHER-OWNED: shared demo levels only. Students put their level in their own pack.js (`level` block),
// so nobody has to edit this file and two students can never overwrite each other's work.
const platformerLevels = {};

// Mode-neutral lookup. The old function below remains available for older code.
function getStudentLevel(levelId) {
  if (!levelId) {
    return null;
  }

  if (platformerLevels[levelId]) {
    return platformerLevels[levelId];
  }

  if (typeof studentManifests !== "undefined") {
    for (let i = 0; i < studentManifests.length; i++) {
      const level = studentManifests[i].level;
      if (level && level.id === levelId) {
        return level;
      }
    }
  }

  return null;
}

function getPlatformerLevel(levelId) {
  return getStudentLevel(levelId);
}
