// TEACHER-OWNED: reward types students can earn from platformers (keys, skills).
const rewardRegistry = {
  yellow_key: { type: "key", color: "#f1c40f", label: "Yellow Key" },
  blue_key: { type: "key", color: "#3498db", label: "Blue Key" },
  red_key: { type: "key", color: "#e74c3c", label: "Red Key" },
  double_jump: { type: "skill", label: "Double Jump" },
  dash: { type: "skill", label: "Dash" },
  bridge_token: { type: "key", color: "#27ae60", label: "Bridge Token" }
};

function getRewardLabel(rewardId) {
  const r = rewardRegistry[rewardId];
  return r ? r.label : rewardId;
}
