import React from "react";
import styles from "./PastSessions.module.css";
import axios from "axios";
import Table from "./Table";

import { useState, useEffect } from "react";

export default function AboutUs(props) {
  
  const [dataTable, setDataTable] = useState([]);

  const [mail, setMail]= useState(null);

  async function getSessionRecords(id)
  {
    console.log(id);
    const res = await axios.post("https://interviewspace-backend.herokuapp.com/getSessionRecords");

    axios.post("https://interviewspace-backend.herokuapp.com/getSessionRecords",{id}).then((res)=>{

      // console.log(res);
      console.log(res.data);
      setDataTable(res.data);

    }).catch((error)=>{
      console.log(error);
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

    {dataTable===[] ? (
      <h>Fetching Data ...</h>
    ):(
      <Table data={dataTable} column = {column}/>
    )}
      

    </div>
  );
}
