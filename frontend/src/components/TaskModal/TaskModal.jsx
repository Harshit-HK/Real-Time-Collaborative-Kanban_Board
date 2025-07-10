import React, { useEffect, useState } from "react";
import styles from "./TaskModal.module.css";
import { dummyUsers } from "../../utils/dummyUsers";

const TaskModal = ({ task, onClose, onSubmit, onDelete }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);
  const [users, setUsers] = useState([]);

  
  useEffect(() => {
    setUsers(dummyUsers); // simulate fetch
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...task,
      title,
      description,
      priority,
      status,
      assignedTo,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(task._id);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Edit Task</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">-- Assign to --</option>
            {users.map((user) => (
              <option key={user._id} value={user.name}>
                {user.name} {`(${user._id})`}
              </option>
            ))}
          </select>

          <div className={styles.buttons}>
            <button type="submit">Save</button>
            <button type="button" onClick={handleDelete}>
              Delete
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
