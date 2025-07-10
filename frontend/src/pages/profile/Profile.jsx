import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import { AppContext } from "../../context/AppContext";

const Profile = () => {
  const { isAuthenticated, user, logout } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.avatarBox}>
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt="avatar"
            className={styles.avatar}
          />
        </div>

        <h2 className={styles.greeting}>Hello, {user?.name}!</h2>

        {user?.email && (
          <p className={styles.info}>
            <strong>Email:</strong> {user.email}
          </p>
        )}

        {user?.phone && (
          <p className={styles.info}>
            <strong>Phone:</strong> {user.phone}
          </p>
        )}

        <button onClick={logout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
