import React from "react";
import styles from "./MainPage.module.css";
import QuestionPannel from "./QuestionPannel";
import { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import Peer from "simple-peer";
import io, { Socket } from "socket.io-client";
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from "axios";
import { Navigate } from "react-router-dom";
import CodeMirror from '@uiw/react-codemirror';
// import {Controlled as CodeMirror} from 'react-codemirror2'
// codemirror documentation : https://uiwjs.github.io/react-codemirror/



const socket = io.connect("https://interviewspace-backend.herokuapp.com");

export default function MainPage(props) {
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

    axios.get("https://interviewspace-backend.herokuapp.com/getQuestion").then((res)=>{
        newQuestion=res.data;

        // pusing new question link to list of all clients in the room
        socket.emit("updateQuestionList",me,newQuestion.link);


        console.log("Question becomes ", newQuestion);
        socket.emit("showQuestion",me,newQuestion);
    }).catch((err)=>{
      return err;
    })

    
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

    // on pressing back button, stop the getUserMedia stream
    window.onpopstate = () => {
      console.log("back button pressed");
      // console.log(stream);
      // stream.getTracks().forEach(function (track) {
      //   track.stop();
      // });
    };

    // action on socket onQuestion event
    socket.on("showQuestion",(roomId,questionObject)=>{
      setCallConnected(true);
      console.log("Question broadcasted to all rooms is ", questionObject);
      setQuestion(questionObject);
    })

    // action on leaveCall button pressed
    socket.on("onLeaveCall",async (id1,id2)=>{

      // storing session to database

      try {

        // console.log("navigating to homepage");
        // <Navigate to="/"/>
        // refresh page
        window.location.reload(false);

        const res = await axios.post("https://interviewspace-backend.herokuapp.com/insertSessionDetails",{createSession});
        console.log("storing session to mongoDb");
      } catch (error) {
        console.log(error);
      }


    });  
    
    socket.on("updateQuestionList",(id,link)=>{
        // pushing question link to create seesion ref
        createSession.current.questionLink.push(link);
    })

    socket.on("changeEditorValue",(newValue,id)=>{
      console.log("changing editor's value to ", newValue);

      setEditorValue(newValue);
      
    })

  }, []);

  const callUser = (id) => {
    socket.emit("joinRoom", idToCall);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
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
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  

  const answerCall = () => {
    
    socket.emit("joinRoom", me);
    setCallAccepted(true);
    setRecievingCall(false);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
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

  const leaveCall = () => {



    socket.emit("onLeaveCall",me,idToCall);

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
          {recievingCall && !callAccepted ? (
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
                leaveCall();
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
                    socket.emit("changeEditorValue",editorValue,me);
                    console.log('value in editor is', editorValue);
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

          {callConnected? (
            <button
            className={styles.endBtn}
            onClick={() => {
              console.log("end call button pressed");
              leaveCall();
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
                    console.log('value in editor is', editorValue);
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
