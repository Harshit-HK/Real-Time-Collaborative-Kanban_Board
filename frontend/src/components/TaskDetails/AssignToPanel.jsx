import React, { useState, useContext } from "react";
import styles from "./AssignToPanel.module.css";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AssignToPanel = ({ taskId, currentAssignee, onClose }) => {
  const [selectedUser, setSelectedUser] = useState(currentAssignee || "");
  const {
    allUsers,
    token,
    backendUrl,
    setTasks,
    setSelectedTask,
    setShowTaskDetails,
  } = useContext(AppContext);

  const handleAssign = async () => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/tasks/assign/${taskId}`,
        { userId: selectedUser },
        { headers: { token } }
      );
      if (res.data?.alreadyAssigned) {
        toast.info(res.data?.message);
        return;
      }

      if (res.data.success) {
        toast.success("Assigned successfully");

        // Update task in UI
        setTasks((prev) =>
          prev.map((task) => (task._id === taskId ? res.data.task : task))
        );
        setSelectedTask(res.data.task);
        onClose(); // Close the assign panel
        setShowTaskDetails(false);
      }
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  return (
    <div className={styles.assignPanel}>
      <h4>Assign Task To:</h4>
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">-- Select User --</option>
        {allUsers.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>
      <div className={styles.actions}>
        <button onClick={handleAssign} className={styles.saveBtn}>
          Save
        </button>
        <button onClick={onClose} className={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AssignToPanel;
