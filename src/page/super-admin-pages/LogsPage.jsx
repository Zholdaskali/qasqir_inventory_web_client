import { useState } from "react";
import ActionLogs from "./logs/ActionLogs";
import ExceptionLogs from "./logs/ExceptionLogs";
import LoginLogs from "./logs/LoginLogs";

// icons

import { GrTransaction } from "react-icons/gr";
import { BiCommentError } from "react-icons/bi";
import { IoMdLogIn } from "react-icons/io";
// icons


const LogsPage = () => {

    const [actionLogs, setActionLogs] = useState(true)
    const [exceptionLogs, setExceptionLogs] = useState(false)
    const [loginLogs, setLoginLogs] = useState(false)

    const actionLogsHandler = () => {
        if(actionLogs){
            return
        } else {
            setActionLogs((prev)=>!prev)
            setExceptionLogs(false)
            setLoginLogs(false)
        }
    }

    const exceptionLogsHandler = () => {
        if(exceptionLogs){
            return
        } else {
            setExceptionLogs((prev)=>!prev)
            setActionLogs(false)
            setLoginLogs(false)
        }
    }
    const loginLogsHandler = () => {
        if(loginLogs){
            return
        } else {
            setLoginLogs((prev)=>!prev)
            setActionLogs(false)
            setExceptionLogs(false)
        }
    }

    return (
        <div className="w-5/6 h-full">
            <li className="list-none flex w-full justify-between ">
                <ul >
                    <button 
                        className={`${actionLogs ? 'bg-main-purp text-white' : 'bg-white text-black'}  py-5 px-20 rounded-xl shadow-2xl flex items-center gap-x-5`} 
                        onClick={actionLogsHandler}
                    >
                        <GrTransaction size={20}/>
                        <p>История Действий</p>
                    </button>
                </ul>
                <ul>
                    <button 
                     className={`${exceptionLogs ? 'bg-main-purp text-white' : 'bg-white text-black'}  py-5 px-20 rounded-xl shadow-2xl flex items-center gap-x-5`} 
                    onClick={exceptionLogsHandler}
                    >
                        <BiCommentError size={20}/>
                        <p>История Ошибок</p>
                    </button>
                </ul>
                <ul>
                    <button 
                     className={`${loginLogs ? 'bg-main-purp text-white' : 'bg-white text-black'}  py-5 px-20 rounded-xl shadow-2xl flex items-center gap-x-5`} 
                    onClick={loginLogsHandler}
                    >
                        <IoMdLogIn size={25}/>
                        <p>История Входов </p>   
                    </button>
                </ul>
            </li>
            <div className="h-full">
                {
                    actionLogs && <ActionLogs/>
                }
                {
                    exceptionLogs && <ExceptionLogs/>
                }
                {
                    loginLogs && <LoginLogs/>
                }
            </div>
        </div>
    );
}

export default LogsPage;
