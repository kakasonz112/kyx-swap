// Modal.tsx

import React, { ReactNode } from "react";
import styles from "../../../styles/Token.module.css";

interface ModalType {
  children?: ReactNode;
  isOpen: boolean;
  toggle: () => void;
}

export default function Modal(props: ModalType) {
  return (
    <>
      {props.isOpen && (
        <div className={styles.modalOverlay} onClick={props.toggle}>
          <div onClick={(e) => e.stopPropagation()} className={styles.modalBox}>
            {props.children}
          </div>
        </div>
      )}
    </>
  );
}
