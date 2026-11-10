// TEACHER-OWNED: shared dialogue used by the overworld (signs, doors, engine fallbacks).
// Students write their own lines in the `dialogue` block of their pack.js, not in this file.
const dialogueData = {
  hubSign: {
    speaker: "Sign",
    lines: [
      "Welcome to the Class Multiverse Hub.",
      "Visit student homes to explore their worlds.",
      "More districts will open in future versions."
    ]
  },

  portalNotReady: {
    speaker: "Portal",
    lines: [
      "This portal has no platformer level assigned yet.",
      "Add a `level` block to your pack.js."
    ]
  },

  lockedHome: {
    speaker: "Notice",
    lines: [
      "This home is locked for now.",
      "A student submission will unlock it in a future version."
    ]
  },

  doorLocked: {
    speaker: "Door",
    lines: ["This door is locked.", "Complete a student platformer to earn the right key."]
  },

  doorLockedYellow: {
    speaker: "Yellow Door",
    lines: ["You need the Yellow Key.", "Beat the Sample Studio platformer to earn it."]
  },

  doorUnlocked: {
    speaker: "Door",
    lines: ["You have the key!", "This passage is open for future district expansion."]
  }
};

// Pack dialogue wins over the shared table, so student keys can never collide across the class.
function getDialogueEntry(dialogueKey, pack) {
  if (!dialogueKey) {
    return null;
  }
  if (pack && pack.dialogue && pack.dialogue[dialogueKey]) {
    return pack.dialogue[dialogueKey];
  }
  return dialogueData[dialogueKey] || null;
}
