// TEACHER-OWNED: F1 overlay, F2 collision boxes, F3 student pack report.
const debugStats = {
  frameCount: 0,
  elapsed: 0,
  fps: 0
};

function updateDebugStats(deltaTime) {
  debugStats.frameCount += 1;
  debugStats.elapsed += deltaTime;
  if (debugStats.elapsed >= 500) {
    debugStats.fps = Math.round((debugStats.frameCount * 1000) / debugStats.elapsed);
    debugStats.frameCount = 0;
    debugStats.elapsed = 0;
  }
}

function handleDebugInput() {
  if (input.isPressed("F1")) {
    gameState.settings.debugMode = !gameState.settings.debugMode;
  }
  if (input.isPressed("F2")) {
    gameState.settings.showCollision = !gameState.settings.showCollision;
  }
  if (input.isPressed("F3")) {
    gameState.settings.showPackReport = !gameState.settings.showPackReport;
  }
}

// Students run from the browser only, so pack problems have to be visible in the game itself.
function buildPackReportLines() {
  const summary = getPackReportSummary();
  const lines = [
    "STUDENT PACK REPORT  (F3 to close)",
    summary.loaded + " loaded   " + summary.rejected + " rejected   " + summary.warned + " with warnings",
    ""
  ];

  if (summary.rejected === 0 && summary.warned === 0) {
    lines.push("All packs loaded cleanly.");
    return lines;
  }

  for (let i = 0; i < studentPackReports.length; i++) {
    const report = studentPackReports[i];
    if (report.status !== "rejected") {
      continue;
    }
    lines.push("REJECTED  " + report.id);
    for (let e = 0; e < report.errors.length; e++) {
      lines.push("   " + report.errors[e]);
    }
  }

  for (let i = 0; i < studentPackReports.length; i++) {
    const report = studentPackReports[i];
    if (report.status === "rejected" || report.warnings.length === 0) {
      continue;
    }
    lines.push("WARNING   " + report.id);
    for (let w = 0; w < report.warnings.length; w++) {
      lines.push("   " + report.warnings[w]);
    }
  }

  return lines;
}

function drawPackReport(ctx) {
  if (!gameState.settings.showPackReport) {
    return;
  }

  const lines = buildPackReportLines();
  const maxLines = 30;
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    shown.push("... " + (lines.length - maxLines) + " more lines, press F12 for the console");
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "13px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  for (let i = 0; i < shown.length; i++) {
    const line = shown[i];
    if (line.indexOf("REJECTED") === 0) {
      ctx.fillStyle = "#ff6b6b";
    } else if (line.indexOf("WARNING") === 0) {
      ctx.fillStyle = "#f1c40f";
    } else if (i === 0) {
      ctx.fillStyle = "#00ff88";
    } else {
      ctx.fillStyle = "#dddddd";
    }
    ctx.fillText(line.slice(0, 104), 16, 16 + i * 16);
  }
}

function drawDebugOverlay(ctx, info) {
  if (!gameState.settings.debugMode) {
    return;
  }

  const lines = [
    "FPS: " + debugStats.fps,
    "Scene: " + (info.sceneName || "unknown"),
    "Player: " + Math.round(info.playerX || 0) + ", " + Math.round(info.playerY || 0),
    "Camera: " + Math.round(info.cameraX || 0) + ", " + Math.round(info.cameraY || 0),
    "Collision count: " + (info.collisionCount || 0),
    "Homes registered: " + (info.homeCount || 0),
    "Homes visited: " + gameState.visitedHomes.length,
    "Badges: " + gameState.unlockedRewards.length,
    "Coins: " + (gameState.coins || 0),
    "Debug overlay: " + (gameState.settings.debugMode ? "ON" : "OFF"),
    "Collision boxes: " + (gameState.settings.showCollision ? "ON" : "OFF")
  ];

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(8, 8, 280, lines.length * 18 + 12);

  ctx.fillStyle = "#00ff88";
  ctx.font = "14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 16, 16 + i * 18);
  }
}
