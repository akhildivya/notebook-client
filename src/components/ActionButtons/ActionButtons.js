import React from 'react'
import { FaPlus, FaSearch, FaHistory, FaList } from "react-icons/fa";
import styles from "./ActionButtons.module.css";

function ActionButtons({ onAdd, onSearch, onHistory, onViewAll }) {
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

        <button className={`${styles.btn} ${styles.viewAllBtn}`} onClick={onViewAll}>
          <FaList />
          <span>View All</span>
        </button>

        <button className={`${styles.btn} ${styles.historyBtn}`} onClick={onHistory}>
          <FaHistory />
          <span>History</span>
        </button>
      </div></>
  )
}

export default ActionButtons