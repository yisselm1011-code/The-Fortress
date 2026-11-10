// TEACHER-OWNED: on-screen prompts, dialogue boxes, and the rewards bar.
const UI_FONT = "16px monospace";

function drawInteractionPrompt(ctx, text) {
  const boxWidth = 420;
  const boxHeight = 36;
  const x = (canvas.width - boxWidth) / 2;
  const y = canvas.height - 56;

  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(x, y, boxWidth, boxHeight);

  ctx.fillStyle = "#ffffff";
  ctx.font = UI_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2);
}

function drawDialogueBox(ctx, speaker, text) {
  const boxWidth = canvas.width - 80;
  const boxHeight = 100;
  const x = 40;
  const y = canvas.height - boxHeight - 24;

  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(x, y, boxWidth, boxHeight);

  ctx.fillStyle = "#ffffff";
  ctx.font = UI_FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(speaker + ":", x + 16, y + 12);
  ctx.fillText(text, x + 16, y + 36);
  ctx.fillText("(Enter / E: next, Esc: close)", x + 16, y + 72);
}

function drawRewardsBar(ctx) {
  const coins = gameState.coins || 0;
  const rewards = gameState.unlockedRewards || [];
  if (coins === 0 && rewards.length === 0) {
    return;
  }

  const labels = rewards.map(function (id) {
    return getRewardLabel(id);
  });
  const parts = ["Coins: " + coins];
  if (labels.length > 0) {
    parts.push("Badges: " + labels.join(", "));
  }
  const text = parts.join("   ");
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(8, canvas.height - 32, Math.min(720, canvas.width - 16), 24);
  ctx.fillStyle = "#ffe66d";
  ctx.font = "14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 16, canvas.height - 20);
}
