import React from "react";
import styles from "./Header.module.css";
import Button from "@mui/material/Button";
import logo from "./InterviewSpace-Logo.png";
import { Link } from "react-router-dom";
import { GoogleLogout, GoogleLogin } from "react-google-login";

export default function Header(props) {

  const clientId = "264308279201-5i0s2bgttq0t6sm9e0neri0a8kd1s8rv.apps.googleusercontent.com";

  // function failedLogin(err){
  //   console.log(err);
  //     props.m2;
  // }

  return (
    <div className={styles.navBar}>
      <Link to="/">
        <img src={logo} alt="Interview Space Logo" className={styles.logo} />
      </Link>

      <div className={styles.rightHeader}>

        {!(props.loginButton)? (

          <Link to="/pastsessions" style={{ textDecoration: "none" }}>
          <Button className={styles.pastSessions}>
            <span className={styles.pastSessionsText}>Past Sessions</span>
          </Button>
          </Link>

        ):(null)}


        {props.loginButton? (
          <GoogleLogin
          className={styles.login}
          clientId={clientId}
          buttonText="Login"
          onSuccess={props.m1}
          onFailure={err => {
            console.log('login fail', err);
            alert("Some error occured while loging in. Try clearing browser cache");
          }}
          cookiePolicy={'single_host_origin'}
          />
        ):(
          <GoogleLogout
              className={styles.login}
              clientId={clientId}
              buttonText="Logout"
              onLogoutSuccess={props.m3}
            >
          </GoogleLogout>
        )}


      </div>
    </div>
  );
}
