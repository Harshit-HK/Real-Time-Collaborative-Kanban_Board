import React, { useContext } from "react";
import styles from "./TaskCard.module.css";
import { Draggable } from "@hello-pangea/dnd";
import { AppContext } from "../../context/AppContext";

const TaskCard = ({ task, index }) => {
  const { _id, title, description, priority, assignedTo } = task;
  const {setSelectedTask, setShowTaskDetails } = useContext(AppContext);

  return (
    <Draggable draggableId={_id} index={index}>
      {(provided) => (
        <div
          className={styles.cardWrapper}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => {
            setSelectedTask(task);
            setShowTaskDetails(true)
          }}
        >
          <div className={styles.cardHeader}>
            <span
              className={`${styles.priority} ${styles[priority.toLowerCase()]}`}
            >
              {priority}
            </span>
          </div>

          <h4 className={styles.title}>{title}</h4>
          {description && <p className={styles.description}>{description}</p>}
          <div className={styles.footer}>
            <span className={styles.assignedTo}>👤 {assignedTo?.name}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
