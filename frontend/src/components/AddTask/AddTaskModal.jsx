import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import styles from "./AddTaskModal.module.css";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const AddTaskModal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [status, setStatus] = useState("Todo");
  const [assignedTo, setAssignedTo] = useState("");
  const [comment, setComment] = useState("");

  const {
    selectedTask,
    setSelectedTask,
    setShowModal,
    token,
    backendUrl,
    fetchAllUsers,
  } = useContext(AppContext);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    // If editing
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description);
      setPriority(selectedTask.priority);
      setStatus(selectedTask.status);
      setAssignedTo(selectedTask.assignedTo);
      setComment("");
    } else {
      // Reset fields for adding
      setTitle("");
      setDescription("");
      setPriority("Low");
      setStatus("Todo");
      setAssignedTo("");
    }
  }, [selectedTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      description,
      priority,
      status,
      assignedTo,
      comment,
    };

    try {
      let res;
      if (selectedTask) {
        // Edit Task — call PUT API
        res = await axios.put(
          `${backendUrl}/api/tasks/update/${selectedTask._id}`,
          payload,
          { headers: { token },  validateStatus: () => true  }
        );
      } else {
        // Create Task — call POST API
        res = await axios.post(
          `${backendUrl}/api/tasks/create`,
          payload,
          {
            headers: { token },
            validateStatus: () => true 
          }
        );
      }
        if (!res.data.success) {
          return toast.info(res.data.message)
        }

      setSelectedTask(null);
      setShowModal(false);
    } catch (error) {
      toast.error(`Error creating/updating task: ${error}`);
    }
  };

  const handleCancel = () => {
    setSelectedTask(null);
    setShowModal(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{selectedTask ? "Edit Task" : "Add New Task"}</h2>
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
            required
          />
          {selectedTask && (
            <textarea
              placeholder="Comment (what did you change?)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          )}
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

          <div className={styles.buttons}>
            <button type="submit">
              {selectedTask ? "Save Changes" : "Add Task"}
            </button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
