const express = require("express");
const Task = require("../models/task");
const taskController = require("../controllers/taskController");
const router = express.Router();

router.post("/task", taskController.createTask);
router.get("/task", taskController.getTask);
router.get("/insights", taskController.getInsights);
router.patch("/task/:id", taskController.updateTask);
router.patch("/task/:id/complete", taskController.finishTask);
router.delete("/task/:id", taskController.deleteTask);

module.exports = router;
