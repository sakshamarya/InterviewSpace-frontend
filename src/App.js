import Header from './components/Header/Header'
import Home from './components/Home';
import Login from './components/Login';
import PastSessions from './components/PastSessions';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GetStarted from './components/GetStarted';
import MainPage from './components/MainPage';
import { useState } from 'react';
// import { GoogleLogin } from 'react-google-login';



function App() {

  // const clientId = "264308279201-5i0s2bgttq0t6sm9e0neri0a8kd1s8rv.apps.googleusercontent.com";

  const [showLoginButton, setShowLoginButton] = useState(true);
  const [showLogoutButton, setShowLogoutButton] = useState(false);

  const [profileObject, setProfileObject] = useState({
    email: "",
    givenName: "",
    googleId: "",
    imageUrl: "",
    name: ""
  })


  function onLoginSuccess(res) {
    setShowLoginButton(false);
    setShowLogoutButton(true);
    setProfileObject(res.profileObj);
    console.log("Login Successful : ", res.profileObj);
  }

  function onLoginFailure() {
    console.log("Logout failed");
  }

  function onSignoutSuccess() {
    setShowLoginButton(true);
    setShowLogoutButton(false);
    console.log("Log Out Successful");
  }

  return (
    <>

      <div className="main">


        {showLoginButton ? (

          <BrowserRouter>
            <Header m1={onLoginSuccess} m2={onLoginFailure} m3={onSignoutSuccess} loginButton={showLoginButton} logoutButton={showLogoutButton} />
            <Routes>
              <Route exact path="/" element={<Home loginButton={showLoginButton} />} />
              <Route exact path="/login" element={<Home loginButton={showLoginButton} />} />
              <Route exact path="/pastsessions" element={<Home loginButton={showLoginButton} />} />
              <Route exact path="/getstarted" element={<Home loginButton={showLoginButton} />} />
              <Route exact path="/mainpage" element={<Home loginButton={showLoginButton} />} />
              <Route exact path="/mainpageInterviewee" element={<Home loginButton={showLoginButton} />} />

            </Routes>
          </BrowserRouter>

        ) : (
          <BrowserRouter>
            <Header m1={onLoginSuccess} m2={onLoginFailure} m3={onSignoutSuccess} loginButton={showLoginButton} logoutButton={showLogoutButton} />
            <Routes>
              <Route exact path="/" element={<Home loginButton={showLoginButton} />} />
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/pastsessions" element={<PastSessions email={profileObject.email} />} />
              <Route exact path="/getstarted" element={<GetStarted />} />
              <Route exact path="/mainpage" element={<MainPage type="interviewer" profile={profileObject} />} />
              <Route exact path="/mainpageInterviewee" element={<MainPage type="interviewee" profile={profileObject} />} />
            </Routes>
          </BrowserRouter>

        )}




      </div>

    </>
  );
}

export default App;
