import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/auth/Login";
import { AppProvider } from "./context/AppContext";
import Profile from "./pages/profile/Profile";
import Navbar from "./components/navbar/Navbar";
import KanbanBoard from "./pages/kanban/KanbanBoard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AppProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />
        <Routes>
          <Route path="/" element={
          <ProtectedRoute>
            <KanbanBoard />
          </ProtectedRoute>
            } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
