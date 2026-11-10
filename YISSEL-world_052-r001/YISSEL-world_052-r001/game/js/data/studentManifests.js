// TEACHER-OWNED: student packs call registerStudentPack() from js/students/<id>/pack.js
// A pack with errors is quarantined instead of loaded, so one broken world cannot take down the class.
const studentManifests = [];
const studentPackReports = [];

function fillManifestDefaults(manifest) {
  if (!manifest.name) {
    manifest.name = manifest.id;
  }
  if (!manifest.author) {
    manifest.author = "Unknown";
  }
  if (!manifest.iconColor) {
    manifest.iconColor = "blue";
  }
  if (!(manifest.width > 0)) {
    manifest.width = 32;
  }
  if (!(manifest.height > 0)) {
    manifest.height = 32;
  }
  manifest.locked = !!manifest.locked;
}

// Pack-local levels get an id derived from the pack so two students can never collide.
function fillLevelDefaults(pack) {
  const manifest = pack.manifest;

  if (pack.level) {
    if (!pack.level.id) {
      pack.level.id = manifest.id + "_level";
    }
    if (!pack.level.mode) {
      pack.level.mode = "platformer";
    }
    if (!Array.isArray(pack.level.hazards)) {
      pack.level.hazards = [];
    }
    // New packs use levelId; older packs may keep platformerLevelId.
    // Preserve the old alias for Overworld registries and external classroom tools.
    manifest.levelId = manifest.levelId || manifest.platformerLevelId || pack.level.id;
    manifest.platformerLevelId = manifest.levelId;
  }

  if (manifest.platformerLevelId && !manifest.rewardId) {
    manifest.rewardId = "key_" + manifest.id;
  }
  if (pack.level && !pack.level.rewardId) {
    pack.level.rewardId = manifest.rewardId;
  }
}

function logPackReport(report) {
  if (report.status === "rejected") {
    console.error(
      "Student pack '" + report.id + "' was NOT loaded:\n  - " + report.errors.join("\n  - ")
    );
    return;
  }
  if (report.warnings.length > 0) {
    console.warn(
      "Student pack '" + report.id + "' loaded with warnings:\n  - " + report.warnings.join("\n  - ")
    );
  }
}

function registerStudentPack(pack) {
  let report;

  try {
    report = validatePack(pack);
  } catch (err) {
    report = {
      id: pack && pack.manifest ? pack.manifest.id : "(unknown)",
      status: "rejected",
      errors: ["pack could not be read: " + err.message],
      warnings: []
    };
  }

  if (report.status !== "rejected") {
    const duplicate = studentManifests.some(function (existing) {
      return existing.manifest.id === pack.manifest.id;
    });
    if (duplicate) {
      report.status = "rejected";
      report.errors.push("manifest.id '" + pack.manifest.id + "' is already registered by another pack");
    }
  }

  if (report.status === "rejected") {
    studentPackReports.push(report);
    logPackReport(report);
    return false;
  }

  try {
    fillManifestDefaults(pack.manifest);
    fillLevelDefaults(pack);
  } catch (err) {
    report.status = "rejected";
    report.errors.push("pack defaults could not be applied: " + err.message);
    studentPackReports.push(report);
    logPackReport(report);
    return false;
  }

  studentManifests.push(pack);
  studentPackReports.push(report);
  logPackReport(report);
  return true;
}

function getStudentPack(packId) {
  for (let i = 0; i < studentManifests.length; i++) {
    if (studentManifests[i].manifest.id === packId) {
      return studentManifests[i];
    }
  }
  return null;
}

// Cross-pack problems (duplicate ids, overlapping icons) are folded into the reports at boot.
function runPackRegistryChecks() {
  const problems = validatePackRegistry(studentManifests);

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];
    let report = null;
    for (let r = 0; r < studentPackReports.length; r++) {
      if (studentPackReports[r].id === problem.id) {
        report = studentPackReports[r];
        break;
      }
    }
    if (report) {
      report.warnings.push(problem.message);
    }
    console.warn("Pack registry: " + problem.id + " — " + problem.message);
  }

  return problems;
}

function getPackReportSummary() {
  let rejected = 0;
  let warned = 0;

  for (let i = 0; i < studentPackReports.length; i++) {
    if (studentPackReports[i].status === "rejected") {
      rejected += 1;
    } else if (studentPackReports[i].warnings.length > 0) {
      warned += 1;
    }
  }

  return {
    total: studentPackReports.length,
    loaded: studentManifests.length,
    rejected: rejected,
    warned: warned
  };
}
