import { createSlice } from "@reduxjs/toolkit" ;
import { useReducer,useState } from "react";

export default function TodoList(){

const [text,settext] = useState('')

const adding = useReducer(()=>{
    settext(e.target.value);
})



    return(
        <>
        <input type="text"  value={item}/>
        <button onClick={adding}>create</button>

        {items.map((item,i)=>(
            <p key ={i}>{item}</p>
        ))}
        </>
    )
}