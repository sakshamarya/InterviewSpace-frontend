import React from "react";
import styles from "./PastSessions.module.css";
import axios from "axios";
import Table from "./Table";

import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";


import { useState, useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  backdrop: {
      color: "#fff",
      zIndex: theme.zIndex.drawer + 1,
  },
}));

export default function AboutUs(props) {

  const classes = useStyles();

  const [loading, setLoading]  = useState(false);
  
  const [dataTable, setDataTable] = useState([]);

  const [mail, setMail]= useState(null);

  
  async function getSessionRecords(id)
  {
    setLoading(true);

    console.log(id);
    const res = await axios.post("https://interviewspace-backend.herokuapp.com/getSessionRecords");

    axios.post("https://interviewspace-backend.herokuapp.com/getSessionRecords",{id}).then((res)=>{

      // console.log(res);
      console.log(res.data);
      setDataTable(res.data);
      setLoading(false);

    }).catch((error)=>{
      console.log(error);
      setLoading(false);
    })
  }
  
  useEffect(() => {

    console.log(props);

    setMail(props.email);

    if(props)
    {
      getSessionRecords(props.email);
    }

    console.log(dataTable)

  }, [])
  

  const column = [
    {heading: 'Email Id', value: 'userEmail'},
    {heading: 'Date', value: 'date'},
    {heading: 'Questions', value: 'questionLink'}
  ]

  return (
    <div className={styles.main}>

      {loading? (
          <Backdrop
            className={classes.backdrop}
            open
          >
            <CircularProgress color="inherit" />
          </Backdrop>
      ):(null)}

    {dataTable===[] ? (
      <h>Fetching Data ...</h>
    ):(
      <Table data={dataTable} column = {column}/>
    )}
      

    </div>
  );
}
