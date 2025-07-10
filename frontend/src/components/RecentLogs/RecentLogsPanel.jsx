import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./RecentLogsPanel.module.css";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const RecentLogsPanel = ({ isMobileView, onClose, animation }) => {
  const [logs, setLogs] = useState([]);
  const { backendUrl, token } = useContext(AppContext);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/allActions`, {
        headers: { token },
      });
      if (res.data.success) {
        setLogs(res.data.allLogs || []);
      } else {
        toast.error(` Something went wrong: ${res.data.message}`);
      }
    } catch (error) {
      toast.error("Failed to fetch recent logs:", error.message);
    }
  };

useEffect(() => {
  fetchLogs();
  const socket = io(backendUrl);

  socket.on("recentLogUpdated", (newLog) => {
    setLogs((prevLogs) => {
      const exists = prevLogs.find((log) => log._id === newLog._id);
      if (exists) return prevLogs;
      return [newLog, ...prevLogs.slice(0, 19)];
    });
  });

  return () => {
    socket.disconnect();
  };
}, []);

  return (
    <div className={`${styles.panel} ${animation}`}>
      <div className={styles.panelHeader}>
        <h3 className={styles.heading}>Recent Activity Logs</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          Close
        </button>
      </div>

      <ul className={styles.logList}>
        {logs.length === 0 ? (
          <li className={styles.noLogs}>No logs available</li>
        ) : (
          logs.map((log) => (
            <li key={log._id} className={styles.logItem}>
              {/*  Action Type */}
              <p className={styles.action}>
                <strong>{log.actionType}</strong>
                {log.details && (
                  <>
                    {" "}
                    — <em>{log.details}</em>
                  </>
                )}
              </p>

              {/* User Info */}
              <p className={styles.logMeta}>
                by <strong>{log.performedBy?.name || "Unknown"}</strong>{" "}
                <span className={styles.logEmail}>
                  ({log.performedBy?.email || "No Email"})
                </span>
                {" • "}
                {new Date(log.createdAt).toLocaleString()}
              </p>

              {log.comment && <p className={styles.comment}>{log.comment}</p>}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default RecentLogsPanel;
