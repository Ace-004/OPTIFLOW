const computeDeadlinePressure = (deadline) => {
  if (!deadline) return 0;
  const now = new Date();
  const hoursLeft = (new Date(deadline) - now) / 3600000;
  if (hoursLeft <= 0) return 3;
  if (hoursLeft <= 24) return 2;
  if (hoursLeft <= 72) return 1;
  return 0;
};

const computeAgeBoost = (createdAt) => {
  const now = new Date();
  const days = (now - new Date(createdAt)) / 86400000;
  if (days > 7) return 2;
  if (days > 3) return 1;
  return 0;
};

// const computeBehaviorRisk=(rescheduleCount)=>{
//   if(rescheduleCount>=3)return 2;
//   if(rescheduleCount>=1)return 1;
//   return 0;
// }

exports.reprioritizeTask = (task, behaviorRisk = 1) => {
  const base = task.priority?.score || 1;
  const deadlinePressure = computeDeadlinePressure(task.deadline);
  const ageBoost = computeAgeBoost(task.createdAt);
  const dynamic = base + deadlinePressure + ageBoost + behaviorRisk;
  return Math.round(dynamic);
};
