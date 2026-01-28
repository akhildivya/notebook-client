import React from 'react'
import { FaPlus, FaSearch, FaHistory, FaList, FaComments } from "react-icons/fa";
import styles from "./ActionButtons.module.css";
import { useNavigate } from "react-router-dom";

function ActionButtons({ onAdd, onSearch, onHistory, onInteractions }) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/view-all");
  };
  return (
    <>
      <div className={styles.container}>
        <button className={`${styles.btn} ${styles.addBtn}`} onClick={onAdd}>
          <FaPlus />
          <span>Add</span>
        </button>

        <button className={`${styles.btn} ${styles.searchBtn}`} onClick={onSearch}>
          <FaSearch />
          <span>Search</span>
        </button>

        <button className={`${styles.btn} ${styles.viewAllBtn}`} onClick={handleViewAll}>
          <FaList />
          <span>View All</span>
        </button>

        <button className={`${styles.btn} ${styles.historyBtn}`} onClick={onHistory}>
          <FaHistory />
          <span>History</span>
        </button>
        <button
          className={`${styles.btn} ${styles.interactionsBtn}`}
          onClick={() => navigate("/interactions")}
        >

          <FaComments />
          <span>Interactions</span>
        </button>
      </div></>
  )
}

export default ActionButtons