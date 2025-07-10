// pseudo-algorithm
// 1. Get all users from DB
// 2. Initialize a userScoreMap = {}
// 3. For each user:
//     - Count how many tasks are assigned to them
//     - For each task:
//         - if task.priority === "Low" → +1
//         - if task.priority === "Medium" → +2
//         - if task.priority === "Heigh" → +4
//     - Save total score in userScoreMap
// 4. Sort users by score (ascending)
// 5. return the user with the lowest score

import TaskModel from "../../models/TaskModel.js";
import UserModel from "../../models/UserModel.js";

const validateAndPrepareSmartAssign = async () => {
  try {
    const users = await UserModel.find();
    if (users.length === 0) {
      return { success: false, message: "No users available" };
    }

    // return if any user has 0 assigned projects
    for (const user of users) {
      if (user.assignedProjects.length === 0) {
        return {
          success: true,
          userId: user._id,
        };
      }
    }
    return { success: false, users };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Function 1: Assign Low or Medium Priority Task Based on Grading System
export const assignLowOrMediumPriorityTask = async () => {
  try {
    const result = await validateAndPrepareSmartAssign();
    if (result?.success) return result;

    const { users } = result;

    const userScoreMap = await Promise.all(
      users.map(async (user) => {
        let score = 0;

        // Directly fetch tasks using the IDs from user.assignedProject
        const tasks = await TaskModel.find({
          _id: { $in: user.assignedProjects },
        });

        tasks.forEach((t) => {
          if (t.priority === "Low") score += 1;
          else if (t.priority === "Medium") score += 2;
          else if (t.priority === "High") score += 4;
        });

        return { user, score };
      })
    );

    userScoreMap.sort((a, b) => a.score - b.score);
    const selectedUser = userScoreMap[0].user;

    return {
      success: true,
      userId: selectedUser._id,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};



// Function 2: Assign High Priority Task to User with Least High Priority Tasks
export const assignHighPriorityTask = async () => {
  try {
    const result = await validateAndPrepareSmartAssign();
    if (result?.success) return result;

    const { users } = result;
    const userHighTaskMap = await Promise.all(
      users.map(async (user) => {
        const tasks = await TaskModel.find({
          _id: { $in: user.assignedProjects },
          priority: "High",
        });
        const highPriorityCount = tasks.length;

        return { user, count: highPriorityCount };
      })
    );

    userHighTaskMap.sort((a, b) => a.count - b.count);
    const selectedUser = userHighTaskMap[0].user;

    if (userHighTaskMap[1]?.count === 0) {
      // If multiple users have zero high-priority tasks,
      // we could accidentally assign the task to a user who is already overloaded with medium or low-priority tasks.
      // To avoid this, we fall back to the scoring system used for low/medium tasks
      // to ensure a fairer and more balanced assignment.
      return await assignLowOrMediumPriorityTask();
    }

    return {
      success: true,
      userId: selectedUser._id,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
