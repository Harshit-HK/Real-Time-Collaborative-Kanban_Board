import axios from "axios";
import { io } from "socket.io-client";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("Kanban_token") || ""
  );

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [taskLogs, setTaskLogs] = useState([]);

  const isAuthenticated = !!token;

  useEffect(() => {
    const tokenVerification = localStorage.getItem("Kanban_token");

    if (tokenVerification) {
      axios
        .get(`${backendUrl}/api/auth/verify`, {
          headers: { token: tokenVerification },
        })
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user);
            setToken(tokenVerification);

            fetchAllTasksFromDB();
            fetchAllUsers();
          } else {
            localStorage.removeItem("Kanban_token");
          }
        })
        .catch((err) => {
          toast.error("Token invalid or expired:", err.message);
          localStorage.removeItem("Kanban_token");
          setUser(null);
          setToken(null);
        });
    }
  }, []);

  const logout = () => {
    setToken("");
    localStorage.removeItem("Kanban_token");
    setUser(null);
  };

  const fetchAllTasksFromDB = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/tasks/all`, {
        headers: { token },
      });

      if (response.data.success) {
        setTasks(response.data.tasks);
      } else {
        toast.error("Failed to fetch tasks");
      }
    } catch (error) {
      toast.error(`Error fetching tasks: ${error.message}`);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/users/all`, {
        headers: { token },
      });
      if (res.data.success) setAllUsers(res.data.users);
    } catch (err) {
      toast.error("Error fetching users:", err.message);
    }
  };

  useEffect(() => {
    const socket = io(backendUrl);

    socket.on("taskCreated", (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on("taskUpdated", (task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    });

    socket.on("taskDeleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    socket.on("taskAssigned", (updatedTask) => {
      setTasks((prev) => {
        const exists = prev.find((task) => task._id === updatedTask._id);
        if (exists) {
          return prev.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          );
        } else if (updatedTask.assignedTo?._id === user?._id) {
          toast.info(`New task assigned: "${updatedTask.title}"`);
          return [updatedTask, ...prev];
        }
        return prev;
      });
    });

    socket.on("logUpdated", ({ title, newLog }) => {
      if (selectedTask && selectedTask.title === title) {
        setTaskLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 19)]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateTask = (updatedTask) => {
    setTasks((prev) =>
      prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task._id !== taskId));
    setSelectedTask(null);
  };

  const value = {
    user,
    setUser,
    token,
    setToken,
    backendUrl,
    isAuthenticated,
    logout,

    tasks,
    taskLogs,
    setTasks,
    allUsers,
    showModal,
    setShowModal,
    selectedTask,
    setSelectedTask,
    handleUpdateTask,
    handleDeleteTask,
    fetchAllTasksFromDB,
    fetchAllUsers,
    showTaskDetails,
    setShowTaskDetails,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
