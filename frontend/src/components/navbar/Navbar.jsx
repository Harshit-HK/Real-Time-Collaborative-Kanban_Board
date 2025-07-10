import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import styles from "./Navbar.module.css";
import { AppContext } from "../../context/AppContext";

const Navbar = () => {
  const { isAuthenticated, user } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        Kanban Pro
      </div>

      {isAuthenticated && (
        <div className={styles.userSection}>
          <span className={styles.username}>Hello, {user?.name}</span>
          <FaUserCircle
            className={styles.userIcon}
            onClick={() => navigate("/profile")}
            title="Go to Profile"
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
