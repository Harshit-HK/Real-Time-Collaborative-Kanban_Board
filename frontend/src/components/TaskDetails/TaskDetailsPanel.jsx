
import React, { useContext, useEffect, useState } from "react";
import styles from "./TaskDetailsPanel.module.css";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import AssignToPanel from "./AssignToPanel";
import { toast } from "react-toastify";

const TaskDetailPanel = () => {
  const {
    selectedTask,
    backendUrl,
    token,
    setShowModal,
    setShowTaskDetails,
    setSelectedTask,
    setTasks,
  } = useContext(AppContext);

  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!selectedTask) return;

    const fetchLogs = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/tasks/logs/${selectedTask.title}`,
          {
            headers: { token },
          }
        );
        if (res.data.success) {
          setLogs(res.data.logs);
        } else {
          toast.error("backend error");
        }
      } catch (err) {
        toast.error(`Failed to fetch logs: ${err.message}`);
      }
    };

    fetchLogs();
  }, [selectedTask]);

  const handleDelete = async () => {
    if (!selectedTask?._id) return;

    const confirm = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirm) return;

    try {
      const res = await axios.delete(
        `${backendUrl}/api/tasks/delete/${selectedTask._id}`,
        {
          headers: { token },
        }
      );

      if (res.data.success) {
        setShowTaskDetails(false); // Close the panel
        setTasks((prev) => prev.filter((t) => t._id !== selectedTask._id)); // Remove from UI
        setSelectedTask(null);
        toast.info(res.data.message);
      }
    } catch (error) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const handleSmartAssign = async () => {
    if (!selectedTask?._id) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/smart/${selectedTask._id}`,
        {},
        { headers: { token } }
      );

      if (res.data?.alreadyAssigned) {
        toast.info(res.data?.message);
        return;
      }
      if (res.data.success) {
        toast.success(res.data.message);
        const updated = res.data.updatedTask || res.data.task;
        setSelectedTask(updated);
        setTasks((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t))
        );
      } else {
        toast.error("Smart assignment failed.");
      }
    } catch (error) {
      toast.error(`Smart assignment failed: ${error.message}`);
    }
  };

  if (!selectedTask) return null;

  return (
    <div className={styles.panelOverlay}>
      <div className={styles.panelBox}>
        {/* Close Button */}
        <button
          className={styles.closeBtn}
          onClick={() => {
            setShowTaskDetails(false);
            setSelectedTask(null);
          }}
        >
          ✕
        </button>

        {/* TASK DETAILS SECTION */}
        <section className={styles.taskSection}>
          <h2 className={styles.sectionTitle}>📝 Task Details</h2>

          <div className={styles.detailItem}>
            <strong>Title:</strong> {selectedTask.title}
          </div>
          <div className={styles.detailItem}>
            <strong>Description:</strong> {selectedTask.description}
          </div>
          <div className={styles.detailItem}>
            <strong>Status:</strong> {selectedTask.status}
          </div>
          <div className={styles.detailItem}>
            <strong>Priority:</strong> {selectedTask.priority}
          </div>
          <div className={styles.detailItem}>
            <strong>Assigned To:</strong>{" "}
            {selectedTask.assignedTo?.name || "Not assigned"}
          </div>
          <div className={styles.detailItem}>
            <strong>Created At:</strong>{" "}
            {new Date(selectedTask.createdAt).toLocaleString()}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.editBtn}
              onClick={() => {
                setShowTaskDetails(false);
                setShowModal(true);
              }}
            >
              ✏️ Edit Task
            </button>
            <button
              className={styles.editBtn}
              onClick={() => setShowAssignPanel(!showAssignPanel)}
            >
              👤 Assign To
            </button>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              🗑️ Delete Task
            </button>

            <button className={styles.smartBtn} onClick={handleSmartAssign}>
              ⚡ Smart Assign
            </button>
          </div>
        </section>

        {showAssignPanel && (
          <AssignToPanel
            taskId={selectedTask._id}
            currentAssignee={selectedTask.assignedTo?._id || ""}
            onClose={() => setShowAssignPanel(false)}
          />
        )}

        {/* Divider */}
        <hr className={styles.divider} />

        {/* LOGS SECTION */}
        <section className={styles.logSection}>
          <h3 className={styles.sectionTitle}>📜 Action Logs</h3>
          {logs.length === 0 ? (
            <p className={styles.noLogs}>No logs available.</p>
          ) : (
            <div className={styles.logList}>
              {logs.map((log, index) => (
                <div key={index} className={styles.logItem}>
                  <p className={styles.logAction}>
                    <strong>{log.actionType}</strong> — <em>{log.details}</em>
                  </p>
                  <p className={styles.logMeta}>
                    by <strong>{log.performedBy?.name || "Unknown"}</strong>{" "}
                    <span className={styles.logEmail}>
                      ({log.performedBy?.email || "No Email"})
                    </span>
                    {" • "}
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  <p>{log.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
