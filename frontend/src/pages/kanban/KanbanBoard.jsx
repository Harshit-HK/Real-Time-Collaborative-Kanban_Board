import React, { useState, useMemo, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./KanbanBoard.module.css";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "../../components/Column/Column";
import { AppContext } from "../../context/AppContext";
import AddTaskModal from "../../components/AddTask/AddTaskModal";
import AddTaskButton from "../../components/AddTask/AddTaskButton";
import MyTasksPanel from "../../components/MyTasksPanel/MyTasksPanel";
import RecentLogsPanel from "../../components/RecentLogs/RecentLogsPanel";
import TaskDetailsPanel from "../../components/TaskDetails/TaskDetailsPanel";

const groupTasksByStatus = (tasks) => {
  return {
    Todo: tasks.filter((task) => task.status === "Todo"),
    "In Progress": tasks.filter((task) => task.status === "In Progress"),
    Done: tasks.filter((task) => task.status === "Done"),
  };
};

const KanbanBoard = () => {
  const [showLogs, setShowLogs] = useState(false);
  const [showMyTasks, setShowMyTasks] = useState(false);

  const {
    token,
    tasks,
    setTasks,
    showModal,
    backendUrl,
    setShowModal,
    fetchAllTasksFromDB,
    showTaskDetails,
  } = useContext(AppContext);

  useEffect(() => {
    fetchAllTasksFromDB();
  }, []);

  const grouped = useMemo(() => {
    return tasks?.length
      ? groupTasksByStatus(tasks)
      : { Todo: [], "In Progress": [], Done: [] };
  }, [tasks]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Setting new task on place.
    setTasks((prevTasks) => {
      const taskToMove = prevTasks.find((t) => t._id === draggableId);
      if (!taskToMove) return prevTasks;

      // Remove task from source column
      const updatedTasks = prevTasks.filter((t) => t._id !== draggableId);

      // Get destination column tasks
      const destinationTasks = updatedTasks.filter(
        (t) => t.status === destination.droppableId
      );

      // Insert task at new index
      destinationTasks.splice(destination.index, 0, {
        ...taskToMove,
        status: destination.droppableId,
      });

      // Get tasks from other columns
      const otherTasks = updatedTasks.filter(
        (t) => t.status !== destination.droppableId
      );

      return [...otherTasks, ...destinationTasks];
    });

    //  Send status change to backend
    const taskToMove = tasks.find((t) => t._id === draggableId);
    if (!taskToMove) return;
    const oldStatus = taskToMove.status;
    const newStatus = destination.droppableId;

    // Only hit backend if status actually changed
    if (oldStatus !== newStatus) {
      try {
        await axios.put(
          `${backendUrl}/api/tasks/move/${taskToMove._id}`,
          { newStatus },
          { headers: { token } }
        );
        toast.success(
          ` Status change successfully from "${oldStatus}" to "${newStatus}"`
        );
        toast;
      } catch (error) {
        toast.error("Backend move failed");
      }
    }
  };

  return (
    <div className={styles.boardWrapper}>
      <h2 className={styles.boardTitle}>Team Kanban Board</h2>
      <div className={styles.sidebarButtons}>
        <button
          className={styles.myTasksBtn}
          onClick={() => {setShowMyTasks(!showMyTasks)
            setShowLogs(false)
          }}
        >
          My Tasks
        </button>

        <button
          className={styles.logToggleBtn}
          onClick={() => {setShowLogs(!showLogs)
            setShowMyTasks(false)
          }}
        >
          Logs
        </button>
      </div>

      <AddTaskButton />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={styles.columnsContainer}>
          {["Todo", "In Progress", "Done"].map((status) => {
            const columnColors = {
              Todo: { headerColor: "#f57c00", bg: "#fff3e0" },
              "In Progress": { headerColor: "#1976d2", bg: "#e3f2fd" },
              Done: { headerColor: "#388e3c", bg: "#e8f5e9" },
            };

            return (
              <div
                key={status}
                style={{
                  "--column-bg": columnColors[status].bg,
                }}
              >
                <Column
                  columnId={status}
                  name={status}
                  tasks={grouped[status]}
                  headerColor={columnColors[status].headerColor}
                />
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} />}

      {showTaskDetails && <TaskDetailsPanel />}

      <RecentLogsPanel
        isMobileView={window.innerWidth < 768}
        onClose={() => setShowLogs(false)}
        animation={showLogs ? styles.slideIn : styles.slideOut}
      />

      <MyTasksPanel
        show={showMyTasks}
        onClose={() => setShowMyTasks(false)}
        animation={showMyTasks ? styles.slideIn : styles.slideOut}
      />
    </div>
  );
};

export default KanbanBoard;
