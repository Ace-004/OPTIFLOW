require("dotenv").config();
const { analyzeTaskAI } = require("./services/taskService");

(async () => {
  try {
    const res = await analyzeTaskAI("I need to redesign the homepage by tomorrow to include new dashboard metrics");
    console.log("Result:", res);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
})();
