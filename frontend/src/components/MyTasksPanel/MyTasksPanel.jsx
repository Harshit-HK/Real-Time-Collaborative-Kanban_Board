import React, { useEffect, useState, useContext } from "react";
import styles from "./MyTasksPanel.module.css";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const MyTasksPanel = ({ onClose, show, animation }) => {
  const { backendUrl, token, setSelectedTask, setShowTaskDetails } =
    useContext(AppContext);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/tasks/my`, {
          headers: { token },
        });
        if (res.data.success) {
          setMyTasks(res.data.tasks);
        } else {
          toast.error("Failed to load tasks");
        }
      } catch (err) {
        toast.error("Error loading tasks");
      }
    };

    fetchMyTasks();
    
    // Adding socket listener
    const socket = io(backendUrl);

    socket.on("taskAssignedToYou", (newTask) => {
      setMyTasks((prev) => {
        const exists = prev.find((task) => task._id === newTask._id);
        if (!exists) {
          toast.info(` New Task Assigned: "${newTask.title}"`);
          return [newTask, ...prev];
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleClickTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
    onClose();
  };

  return (
    <div className={`${styles.panel} ${animation}`}>
      <div className={styles.panelHeader}>
        <h3 className={styles.heading}>My Tasks</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖ Close
        </button>
      </div>
      {myTasks.length === 0 ? (
        <p className={styles.noTasks}>No tasks assigned to you.</p>
      ) : (
        <ul className={styles.taskList}>
          {myTasks.map((task) => (
            <li
              key={task._id}
              className={styles.taskItem}
              onClick={() => handleClickTask(task)}
            >
              <p className={styles.taskTitle}>{task.title}</p>
              <p className={styles.taskStatus}>
                Status: <strong>{task.status}</strong>
              </p>
              <p className={styles.taskPriority}>Priority: {task.priority}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyTasksPanel;
