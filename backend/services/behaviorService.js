exports.computeBehaviorRiskFromHistory=(tasks)=>{
  if(!tasks.length)return 1;
  let overDueCount=0;
  let totalDelay=0;

  tasks.forEach(t => {
    if(t.behavior?.wasOverDue)overDueCount++;
    totalDelay+=t.behavior?.completionDelayHours||0;
  });

  const overDueRatio=overDueCount/tasks.length;
  const avgDelay=totalDelay/tasks.length;

  let risk=1;
  if(overDueRatio>0.5)risk+=2;
  else if(overDueRatio>0.2)risk+=1;

  if(avgDelay>24)risk+=1;

  return Math.min(risk,5)
}