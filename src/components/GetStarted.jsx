import React from "react";
import styles from "./GetStarted.module.css";
import { Link } from "react-router-dom";

export default function GetStarted() {
  return (
    <div className={styles.main}>
      <div className={styles.mainText}>
        <p className={styles.heading}>USERS CAN JOIN EITHER AS AN INTERVIEWER OR AS AN INTERVIEWEE.</p>
        <p><span className={styles.heading}>Joining as an Interviewer:</span> If someone join as an Interviewer, he/she will get a unique room ID which the interviewee has to enter in order to join the interview room.</p>
        <p><span className={styles.heading}>Joining as an Interviewee:</span> If someone join as an Interviewee, he/she will have to enter a unique room ID that has been given by an interviewer order to join the interview room.</p>

        

      </div>
      <div className={styles.buttons}>
        <Link
          to="/mainpage"
          style={{ textDecoration: "none", marginRight: "10%", width: "30%" }}
        >
          <button className={styles.interviewer}>Join as an Interviewer</button>
        </Link>

        <Link
          to="/mainpageInterviewee"
          style={{ textDecoration: "none", marginRight: "10%", width: "30%" }}
        >
          <button className={styles.interviewee}>Join as an Interviewee</button>
        </Link>
      </div>
    </div>
  );
}
