
const estimateUrgency = (description, deadline) => {
  const urgentWords = [
    "today",
    "tomorrow",
    "asap",
    "deadline",
    "urgency",
    "fast",
  ];
  let urgency = 1;
  if (deadline) {
    const hoursleft = (new Date(deadline) - new Date()) / 3600000;
    if (hoursleft < 24) {
      urgency += 3;
    } else if (hoursleft < 72) {
      urgency += 2;
    }
  }
  urgentWords.forEach((word) => {
    if (description.toLowerCase().includes(word)) urgency += 1;
  });
  return Math.min(urgency,5);
};

const estimateComplexity=(description,deadline)=>{
  let complexity=1;
  const complexWords=["design","integrate","implement","architecture","api","database"];

  complexWords.forEach(word=>{
    if(description.toLowerCase().includes(word)){
      complexity+=1;
    }
  })
  return Math.min(complexity,5);
};

const computeComplexityLevel=(c)=>{
  return Math.round(
    c.cognitive*0.3+
    c.technical*0.3+
    c.dependencies*0.2+
    c.effort*0.2
  )
}

const computePriority = (urgency,complexity)=>{
  return Math.round((urgency*0.6+complexity*0.4)*2);
};

const computePriorityAdvance=({
  urgency,
  importance,
  effort,
  behaviorRisk = 1
})=>{
  return Math.round(
    urgency * 0.4 +
    importance * 0.3 +
    behaviorRisk * 0.2 +
    (6 - effort) * 0.1   // easier tasks boosted
  );
}

module.exports={
  estimateComplexity,
  estimateUrgency,
  computePriority,
  computePriorityAdvance,
  computeComplexityLevel
}