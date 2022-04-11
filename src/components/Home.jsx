import React from "react";
import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {Typewriter} from "react-simple-typewriter";
import image from './interviewSpace-Main-removebg-preview.png';


export default function Home(props) {



  return (
    <div className={styles.main}>
      <div className={styles.leftBox}>
        <div className={styles.heading}>
          <Typewriter 
            loop
            cursor
            cursorStyle="_"
            typeSpeed={100}
            deleteSpeed={50}
            delaySpeed={1000}
            words={['Mock Interview?','Welcome to Interview Space!']}
          />

        </div>
        <div className={styles.mainText}>
          Interview Space is a mock interview platform where peers can practice questions for their technical interviews.
        </div>

        {props.loginButton? (
            <button className={styles.getStartedLoggedOut}>Log In to Get Started</button>
        ):(
          <Link to="/getstarted" style={{ textDecoration: "none" }}>
            <button className={styles.getStarted}>Get Started</button>
          </Link>
        )}

        
      </div>
      <div >
        <img className={styles.mainImage} src={image}></img>
      </div>
    </div>
  );
}
