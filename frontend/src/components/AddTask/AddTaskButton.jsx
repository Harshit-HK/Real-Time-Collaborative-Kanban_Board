import React, { useContext } from "react";
import styles from "./AddTaskButton.module.css";
import { AppContext } from "../../context/AppContext";

const AddTaskButton = () => {

    const { setShowModal } = useContext(AppContext);
  return (
    <button className={styles.floatingBtn} onClick={() => setShowModal(true)}>
    +
    </button>
  );
};

export default AddTaskButton;
