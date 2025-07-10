import React, { useContext } from "react";
import styles from "./Column.module.css";
import TaskCard from "../TaskCard/TaskCard";
import { Droppable } from "@hello-pangea/dnd";

const Column = ({ columnId, name, tasks, headerColor }) => {
  const isMobile = window.innerWidth < 768;
  return (
    <div className={styles.columnWrapper}>
      <div
        className={styles.columnHeader}
        style={{ backgroundColor: headerColor, borderColor: headerColor }}
      >
        <h3>{name}</h3>
        <span className={styles.count}>{tasks.length}</span>
      </div>

      <Droppable
        droppableId={columnId}
        direction={isMobile ? "horizontal" : "vertical"}
      >
        {(provided) => (
          <div
            className={styles.taskList}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
