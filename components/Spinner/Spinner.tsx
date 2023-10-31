import React, { useEffect } from "react";
import styles from "./Spinner.module.css";

export default function LoadingSpinner() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.loadingSpinner}>
      </div>
    </div>
  );
}