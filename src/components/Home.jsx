import React from "react";
import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {Typewriter} from "react-simple-typewriter";
import image from './interviewSpace-Main-removebg-preview.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faGoogle, faLinkedin} from '@fortawesome/free-brands-svg-icons';


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

      {/* <div className={styles.footer}>
        <span>Connect With Me <a href="https://www.linkedin.com/in/saksham-arya-32b0781b0/" target="_blank"><FontAwesomeIcon icon={faLinkedin} ></FontAwesomeIcon></a> <a href="mailto:sakshamarya2001@gmail.com" target="_blank"><FontAwesomeIcon icon={faGoogle}></FontAwesomeIcon></a> | </span><span>Any suggestions? <a href="https://docs.google.com/forms/d/e/1FAIpQLScPrgivaHohyU_v4os9fmPZ0hnZcFKkXekowyVACgQb_bYLTQ/viewform?usp=sf_link" target="_blank">Click here</a> </span> 
      </div> */}
    </div>
  );
}
