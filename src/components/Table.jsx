import React from 'react'
import {styles} from './Table.module.css';

export default function Table(props) {

    const TableHeadItem = ({item})=> <th>{item.heading}</th>

    const TableRow = ({item,question})=>{
        
        console.log(item, question);
        return (
            <tr>
                <td>{item['userEmail']}</td>
                <td>{item['date']}</td>
                <td><a href={question} target="_blank">{question}</a></td>
            </tr>
        )
    }

  return (
    <table>

        <thead>
            <tr>
                {props.column.map((item) => <TableHeadItem item={item} />)}
            </tr>
        </thead>
        <tbody>
            
            {props.data.map((item)=>{
                return (item['questionLink'].map((question)=>{
                    return (<TableRow item={item} question={question}/>)
                }))
            })}

        </tbody>

    </table>
  )
}
