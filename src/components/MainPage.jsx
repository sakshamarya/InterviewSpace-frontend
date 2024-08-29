// Free STUN and TURN servers: https://www.metered.ca/tools/openrelay/
// working stun server has atleast 1 candidate with type 'srflx' and working TURN server has atleast 1 candidate of type 'relay', check type at https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

import React from "react";
import styles from "./MainPage.module.css";
import { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import io, { Socket } from "socket.io-client";
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from "axios";
import { Navigate } from "react-router-dom";
import CodeMirror from '@uiw/react-codemirror';
import useSound from 'use-sound';
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
// import {Controlled as CodeMirror} from 'react-codemirror2'
// codemirror documentation : https://uiwjs.github.io/react-codemirror/


// For Production
const socket = io.connect("https://interviewspace-backend.onrender.com");

// for development
// const socket = io.connect("http://localhost:5000");

// loader
const useStyles = makeStyles((theme) => ({
  backdrop: {
      color: "#fff",
      zIndex: theme.zIndex.drawer + 1,
  },
}));

export default function MainPage(props) {

  const classes = useStyles();
  const [loading, setLoading]  = useState(false);

  const type = props.type;
  // console.log(type);

  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [recievingCall, setRecievingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [name, setName] = useState(props.profile.name);
  const [callEnded, setCallEnded] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [question, setQuestion] = useState({
    link: "",
    heading: "",
    description: [],
  });


  const [stunURL, setStunUrl] = useState("")
  const [turnURL, setTurnUrl] = useState("");
  const [turnUsername, setTurnUsername] = useState("");
  const [turnPass, setTurnPass] = useState("");

  const [toggleEditor, setToggleEditor] = useState(false);
  const [toggleEditorStyle, setToggleEditorStyle] = useState(styles.editorToggle);

  const [audioBtnStyle, setAudioBtnStyle] = useState(styles.audioBtn);
  const [videoBtnStyle, setVideoBtnStyle] = useState(styles.videoBtn);

  // const [session, setSession] = useState({
  //     userName: "",
  //     userEmail: "",
  //     date: "",
  //     questionLink: []
  // });

  // const createSession = {
  //     userName: "",
  //     userEmail: "",
  //     date: "",
  //     questionLink: []
  // }

  const createSession = useRef({
    userName: "",
    userEmail: "",
    date: "",
    questionLink: []
  })
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const [editorValue, setEditorValue] = useState("");


  function setNewQuestion()
  {
    
    let newQuestion={
      link: "",
      heading: "",
      description: [],
    };

    // For production

    axios.get("https://interviewspace-backend.onrender.com/getQuestion").then((res)=>{
        newQuestion=res.data;

        // pusing new question link to list of all clients in the room
        socket.emit("updateQuestionList",caller,newQuestion.link);
        socket.emit("updateQuestionList",me,newQuestion.link);


        console.log("Question becomes ", newQuestion);
        socket.emit("showQuestion",caller,newQuestion);
        socket.emit("showQuestion",me,newQuestion);
    }).catch((err)=>{
      return err;
    })

    // For Development

    // axios.get("http://localhost:5000/getQuestion").then((res)=>{
    //     newQuestion=res.data;

    //     // pusing new question link to list of all clients in the room
    //     socket.emit("updateQuestionList",caller,newQuestion.link);
    //     socket.emit("updateQuestionList",me,newQuestion.link);


    //     console.log("Question becomes ", newQuestion);
    //     socket.emit("showQuestion",caller,newQuestion);
    //     socket.emit("showQuestion",me,newQuestion);
    // }).catch((err)=>{
    //   return err;
    // })



    
  }

   // mute button
   const muteUnmute = () => {
    const enabled = stream.getAudioTracks()[0].enabled;
    if (enabled) {
      stream.getAudioTracks()[0].enabled = false;
      setAudioBtnStyle(styles.audioBtn1);
      // change mute button image
    } else {
      stream.getAudioTracks()[0].enabled = true;
      setAudioBtnStyle(styles.audioBtn);
      // change mute button image
    }
  };

  // video shutter

  const playPause = () => {
    let enabled = stream.getVideoTracks()[0].enabled;
    if (enabled) {
      stream.getVideoTracks()[0].enabled = false;
      setVideoBtnStyle(styles.videoBtn1);
      //change video button
    } else {
      stream.getVideoTracks()[0].enabled = true;
      setVideoBtnStyle(styles.videoBtn);
      //change video button
    }
  };

  
  function setRoomId()
  {
    socket.emit("me");
    console.log(me);
  }

  useEffect(() => {

    // For Production

    axios.get("https://interviewspace-backend.onrender.com/twilioServers").then((res)=>{

      console.log(res.data.stunURL);
      console.log(res.data.turnURL);
      console.log(res.data.turnUsername);
      console.log(res.data.turnPass);
      // console.log(turnURL);
      // console.log(turnUsername);
      // console.log(turnPass);
        
    }).catch((err)=>{
      return err;
    })

    // For Development

    // axios.get("http://localhost:5000/twilioServers").then((res)=>{
    //   setStunUrl(res.stunURL);
    //   setTurnUrl(res.turnURL);
    //   setTurnUsername(res.turnUsername);
    //   setTurnPass(res.turnPass);
        
    // }).catch((err)=>{
    //   return err;
    // })

    createSession.current.userName = props.profile.name;
    createSession.current.userEmail = props.profile.email;
    const current = new Date();
    const currdate = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
    createSession.current.date=currdate;

    socket.on("me", (id) => {
      setMe(id);
    });

    setRoomId();

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });
    

    socket.on("callUser", (data) => {
      setRecievingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    // on pressing back button, leave call
    window.onpopstate = () => {
      console.log("back button pressed");

      if(idToCall.length)
      {
        leaveCall(idToCall);
      }
      
      if(caller.length)
      {
        leaveCall(caller);
      }
    };

    // on closing or reloadin window, leave call

    window.addEventListener('beforeunload',(event) => {
      if(idToCall.length)
      {
        leaveCall(idToCall);
      }
      
      if(caller.length)
      {
        leaveCall(caller);
      }
  });

    // action on socket onQuestion event
    socket.on("showQuestion",(roomId,questionObject)=>{
      setCallConnected(true);
      console.log("Question broadcasted to all rooms is ", questionObject);
      setQuestion(questionObject);
    })


    // action on leaveCall button pressed
    socket.on("onLeaveCall",async (id1,id2)=>{

      // window.location.pathname = "/";

      // storing session to database

      try {

        // For Production

        
          const res = await axios.post("https://interviewspace-backend.onrender.com/insertSessionDetails",{createSession});
          console.log("storing session to mongoDb");
          window.location.pathname = "/";

        } catch (error) {
          console.log(error);
        }

        // For Development

        // const res = await axios.post("http://localhost:5000/insertSessionDetails",{createSession});
        //   console.log("storing session to mongoDb");
        // } catch (error) {
        //   console.log(error);
        // }

    });  
    
    socket.on("updateQuestionList",(id,link)=>{
        // pushing question link to create seesion ref
        createSession.current.questionLink.push(link);
    })

    socket.on("changeEditorValue",(newValue,id)=>{
      // console.log("changing editor's value to ", newValue);

      setEditorValue(newValue);
      
    })

  }, []);

  const callUser = (id) => {

    // setLoading(true);
    // socket.emit("joinRoom", idToCall);

    console.log(turnURL);
    console.log(turnPass);
    console.log(turnUsername);
    
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: { iceServers: [
        { urls: "stun:global.stun.twilio.com:3478"},
        {
          urls: "turn:global.turn.twilio.com:3478?transport=udp",
          username: "7ec969a60fd7d11862bee3e9ef9bd431017e8791a83954aea19328df624bcd9c",
          credential: "OJAroG6euzvhMaQwuFI67REGaOY0gEv2mJDbyJCt/X0=",
        }
      ] },
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on("callAccepted", (signal) => {
      // setLoading(false);
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    
    // socket.emit("joinRoom", me);
    setCallAccepted(true);
    setRecievingCall(false);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: { iceServers: [
        { urls: "stun:global.stun.twilio.com:3478?transport=udp"},
        {
          urls: "turn:turn.kyron.in:80",
          username: "1659109624:e4ae5613-be9c-4a26-83a2-969c62f8ee8a",
          credential: "Sm5Qnf84u9vNI4E7s+kxZrExkEk=",
        }
      ] },
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: caller,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;

    // on answer call, set a new question and broadcast the question to the room
    setNewQuestion();
    
  };

  const ignoreCall = () => {
    setRecievingCall(false);
  };

  const leaveCall = (otherPersonsId) => {



    socket.emit("onLeaveCall",me,otherPersonsId);

    // setCallEnded(true);
    // setCallAccepted(false);
    // setCallConnected(false);

    // stop media stream
    // stream.getTracks().forEach(function (track) {
    //   track.stop();
    // });

    // refresh page
    // window.location.reload(false);

    // console.log("callEnded is set to ", { callEnded });
    // connectionRef.current.destroy();
  };

  function setEditor()
  {

    if(toggleEditor==false)
    {
      setToggleEditor(true);
      setToggleEditorStyle(styles.editorToggle1);
    }
    else{
      setToggleEditor(false);
      setToggleEditorStyle(styles.editorToggle);
    }
    
  }


  return (
    <div className={styles.main}>
      {type == "interviewer" ? (
        <>
          {(recievingCall && !callAccepted) ? (
            <div className={styles.callRequestdiv}>
              <h1>{name} wants to join the call !</h1>
              <button className={styles.rejectBtn} onClick={ignoreCall}>
                Ignore
              </button>
              <button className={styles.acceptBtn} onClick={answerCall}>
                Accept
              </button>
            </div>
          ) : null}

          <div className={styles.videoPannel}>

            {callConnected? (
              <button
              className={styles.endBtn}
              onClick={() => {
                console.log("end call button pressed");
                leaveCall(caller);
              }}
              >
                End Call
              </button>
            ):(null)}
            

            <div className={styles.peer2Div}>
              {callAccepted && !callEnded ? (
                <video
                  ref={userVideo}
                  playsInline
                  autoPlay
                  className={styles.peer2Video}
                />
              ) : (
                <h1 className={styles.vidText}>No Video</h1>
              )}
            </div>

            <div className={styles.callId1}>
              <div className={styles.id}>{me}</div>
              <CopyToClipboard text={me}>
                <button className={styles.copyBtn}>Copy Room Id</button>
              </CopyToClipboard>
              {/* <button onClick={setRoomId}>Refresh</button> */}
            </div>

            {/* <Draggable> */}
            <div className={styles.peer1Div}>
              <div>
                {stream ? (
                  <video
                    playsInline
                    muted
                    ref={myVideo}
                    autoPlay
                    className={styles.peer1Video}
                  />
                ) : null}
              </div>
              <div className={styles.videoControlTools}>
                <button className={audioBtnStyle} onClick={muteUnmute}>
                  Mute
                </button>
                <button className={videoBtnStyle} onClick={playPause}>
                  Video
                </button>
              </div>
            </div>
            {/* </Draggable> */}
          </div>

          {callConnected ? (

              <div className={styles.questionPannel}>
              <div className={styles.qpannelHeader}>Question Pannel</div>
              <div className={styles.questionWindow}>
                <div className={styles.questionHeading}>{question.heading}</div>
                  {toggleEditor ? (

                  // <CodeMirror
                  //   value={editorValue}
                  //   onChange={(value)=>{
                  //     socket.emit("changeEditorValue",value,me);
                  //     console.log('value:', value);
                  //   }}
                  // />
                  <CodeMirror
                    value={editorValue}
                    onChange={(value)=>{
                      setEditorValue(value);
                    }}
                    onKeyUp={(editor, event) => {
                    socket.emit("changeEditorValue",editorValue,caller);
                    // console.log('value in editor is', editorValue);
                  }}
                  />

                   ):(

                    <div className={styles.questionBody}>
                    {question.description.map((txt) => (
                      // {
                      //   txt.includes("Example") ||
                      //   txt === "Output" ||
                      //   txt === "Constraints" ||
                      //   txt.includes("Follow-up") ? (
                      //     <strong>
                      //       <p>{txt}</p>
                      //     </strong>
                      //   ) : (
                      //     <p>{txt}</p>
                      //   )
                      // }
                      <p>{txt}</p>
                    ))}
                    <p>
                      <strong>Question Not Clear? </strong>
                      <a href={question.link} target="_blank">
                        Original Question Link
                      </a>
                    </p>
                    </div>

                  )}


              </div>

              <div className={styles.qpannelFooter}>
                <button className={toggleEditorStyle} onClick={setEditor}>Code Editor</button>
                <button className={styles.resetBtn} onClick={setNewQuestion}>Reset Question</button>
              </div>
            </div>
          ):(
            <div className={styles.questionPannel}>
              <div className={styles.qpannelHeader}>Question Pannel</div>
              <div className={styles.questionWindow}>
                <div className={styles.questionHeading}>Nothing to Display</div>
                <div className={styles.questionBody}>
                  Question Will Be displayed once the call gets connected.
                </div>
              </div>

              <div className={styles.qpannelFooter}></div>
            </div>
          )}

          
        </>
      ) : (
        <>
        
        <div className={styles.videoPannel}>

        {loading? (
            <Backdrop
              className={classes.backdrop}
              open
            >
              <CircularProgress color="inherit" />
            </Backdrop>
        ):(null)}

          {callConnected? (
            <button
            className={styles.endBtn}
            onClick={() => {
              console.log("end call button pressed");
              leaveCall(idToCall);
            }}
            >
              End Call
            </button>
          ):(null)}

          <div className={styles.peer2Div}>
            {callAccepted && !callEnded ? (
              <video
                ref={userVideo}
                playsInline
                autoPlay
                className={styles.peer2Video}
              />
            ) : (
              <h1 className={styles.vidText}>No Video</h1>
            )}
          </div>

          <div className={styles.userData}>
            <input
              required
              type="text"
              className={styles.name}
              placeholder="Enter Your Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />

            <input
              required
              type="text"
              className={styles.callId2}
              placeholder="Enter Call Id"
              onChange={(e) => setIdToCall(e.target.value)}
              value={idToCall}
            />
          </div>

          {callConnected? (
              <button
              className={styles.joinBtn}
            >
              Call Joined
            </button>
          ):(
            <button
            className={styles.joinBtn}
            onClick={() => {
              console.log("join button pressed");
              callUser(idToCall);
            }}
          >
            Join Call
          </button>
          )}

          

          {/* <Draggable> */}
          <div className={styles.peer1Div}>
            <div>
              {stream ? (
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  className={styles.peer1Video}
                />
              ) : null}
            </div>
            <div className={styles.videoControlTools}>
              <button className={audioBtnStyle} onClick={muteUnmute}>
                Mute
              </button>
              <button className={videoBtnStyle} onClick={playPause}>
                Video
              </button>
            </div>
          </div>
          {/* </Draggable> */}
        </div>

        {callConnected ? (
              <div className={styles.questionPannel}>
              <div className={styles.qpannelHeader}>Question Pannel</div>
              <div className={styles.questionWindow}>
                <div className={styles.questionHeading}>{question.heading}</div>
                {toggleEditor ? (

                  // <CodeMirror
                  //   value={editorValue}
                  //   onChange={(value) => {
                      
                  //     socket.emit("changeEditorValue",value,idToCall);
                  //     console.log('value:', value);
                  // }}
                  // />
                  <CodeMirror
                    value={editorValue}
                    onChange={(value)=>{
                      setEditorValue(value);
                    }}
                    onKeyUp={(editor, event) => {
                    socket.emit("changeEditorValue",editorValue,idToCall);
                    // console.log('value in editor is', editorValue);
                  }}
                  />
                  ):(

                    <div className={styles.questionBody}>
                    {question.description.map((txt) => (
                      // {
                      //   txt.includes("Example") ||
                      //   txt === "Output" ||
                      //   txt === "Constraints" ||
                      //   txt.includes("Follow-up") ? (
                      //     <strong>
                      //       <p>{txt}</p>
                      //     </strong>
                      //   ) : (
                      //     <p>{txt}</p>
                      //   )
                      // }
                      <p>{txt}</p>
                    ))}
                    <p>
                      <strong>Question Not Clear? </strong>
                      <a href={question.link} target="_blank">
                        Click here
                      </a>
                    </p>
                    </div>

                  )}


                {/* <div className={styles.questionBody}>
                  {question.description.map((txt) => (
                    // {
                    //   txt.includes("Example") ||
                    //   txt === "Output" ||
                    //   txt === "Constraints" ||
                    //   txt.includes("Follow-up") ? (
                    //     <strong>
                    //       <p>{txt}</p>
                    //     </strong>
                    //   ) : (
                    //     <p>{txt}</p>
                    //   )
                    // }
                    <p>{txt}</p>
                  ))}
                  <p>
                    <strong>Question Not Clear? </strong>
                    <a href={question.link} target="_blank">
                      Click here
                    </a>
                  </p>
                </div> */}
              </div>

              <div className={styles.qpannelFooter}><button className={toggleEditorStyle} onClick={setEditor}>Code Editor</button></div>
            </div>
          ):(
            <div className={styles.questionPannel}>
              <div className={styles.qpannelHeader}>Question Pannel</div>
              <div className={styles.questionWindow}>
                <div className={styles.questionHeading}>Nothing to Display</div>
                <div className={styles.questionBody}>
                  Question Will Be displayed once the call gets connected.
                </div>
              </div>

              <div className={styles.qpannelFooter}></div>
            </div>
          )}

        </>
      )}

      
    </div>
  );
}
