/* eslint-disable no-unused-vars */
import axios from "axios";
import { useState, useEffect } from "react";
import successIcon from '../assets/success.svg'

import inviteIllustration from '../assets/illustrations/invite.svg'
import { toast } from "react-toastify";
import { API_CREATE_INVITE } from "../api/API"

const CreateInvite = () => {

    const [userLogin, setUserLogin] = useState('')
    const [userFirtName, setUserFirstName] = useState('')
    const [userLastName, setUserLastName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [userPassword, setUserPassword] = useState('')
    const [inviteSuccess, setInviteSuccess] = useState(false)

    const handleUserInviteCreation = async (e) => {
        e.preventDefault();

        try{
            const path = API_CREATE_INVITE;
            const response = await axios.post(path,
                {
                    userLogin,
                    userEmail,
                    userPassword
                }
            )

            console.log(response.data)
            setInviteSuccess((prevInviteSuccess)=>!prevInviteSuccess)
            setTimeout(() => {
                setInviteSuccess((prevInviteSuccess)=>!prevInviteSuccess)
            }, 2000);

            const link = response.data.link
            toast.success()
        } catch(error){
            console.log(error.response ? error.response.data : 'Ошибка создания приглашения');
        }
    }

    const testSuccess = (e) => {
        e.preventDefault()
        setInviteSuccess((prevInviteSuccess)=>!prevInviteSuccess)
        setTimeout(() => {
            setInviteSuccess((prevInviteSuccess)=>!prevInviteSuccess)
        }, 2000);
    }
 
    return (
        <div className="h-full w-full flex justify-center items-center gap-5">

            {
                inviteSuccess ? 
                <div className="absolute h-screen w-full top-1/3 left-0 text-black">
                <div className='flex justify-center items-center w-full'>
                            <div className='bg-white w-2/5 md:w-1/5 px-4 py-8 md:px-2 rounded-xl'>
                                <div className='flex flex-col items-center gap-y-8 md:gap-y-16'>
                                    <img src={successIcon} className='w-1/2 md:w-1/3'/>
                                    <h2>Приглашение успешно отправлено</h2>
                                </div>
                            </div>
                        </div>
                </div> :
                <>

                </>
            }
        
            <form className="flex flex-col w-1/2 gap-y-5 items-start" autoComplete="off" onSubmit={testSuccess}>
                <img src="/logo.svg" alt="" className="w-24 h-24"/>
                <h1 className="my-5 font-bold text-main-green text-2xl">Создайте приглашение для  нового пользователя</h1>
                <div className="flex justify between w-full gap-x-5">
                    <div className="w-full flex flex-col gap-y-2">
                        <label htmlFor="firstName" className="font-bold text-main-purp border-main-purp text-xl border-b-2 pb-2">Имя пользователя</label>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="Имя пользователя"
                            onChange={(e) => setUserFirstName(e.target.value)}
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors  border-main-purp px-3 rounded-lg cursor-pointer"
                            required
                        />
                    </div>
                    <div className="w-full flex flex-col gap-y-2">
                        <label htmlFor="lastName" className="font-bold text-main-purp border-main-purp text-xl border-b-2 pb-2 cursor-pointer">Фамилия пользователя</label>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Фамилия пользователя"
                            onChange={(e) => setUserLastName(e.target.value)}
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors  border-main-purp px-3 rounded-lg cursor-pointer"
                            required
                        />
                    </div>
                </div>
                <div className="flex justify between w-full gap-x-5">
                    <div className="w-full flex flex-col gap-y-2">
                    <label htmlFor="email" className="font-bold text-main-purp border-main-purp text-xl w-full border-b-2 pb-2">Почта пользователя</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Почта пользователя"
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors  border-main-purp px-3 rounded-lg cursor-pointer"
                            required
                        />
                    </div>
                    <div className="w-full flex flex-col gap-y-2">
                    <label htmlFor="phone" className="font-bold text-main-purp border-main-purp text-xl border-b-2 pb-2">Номер пользователя</label>
                        <input
                            type="phone"
                            name="phone"
                            placeholder="Номер телефона пользователя"
                            // onChange={(e) => setUserPassword(e.target.value)}
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors  border-main-purp px-3 rounded-lg cursor-pointer"
                            required
                        />
                    </div>
                </div>
                <label htmlFor="password" className="font-bold text-main-purp border-main-purp text-xl w-full border-b-2 pb-2">Пароль пользователя</label>
                <input 
                    type="text"
                    name="password"
                    placeholder="Временный пароль пользователя"
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors  border-main-purp px-3 rounded-lg cursor-pointer"
                    required
                 />
                <button className="bg-main-purp text-xl font-bold hover:bg-main-green transition-colors w-full self-center text-white py-4 rounded-xl" >Создать приглашение</button>
            </form>
            <img src={inviteIllustration} alt="" className="w-1/2 mt-12"/>
        </div>
    );
}

export default CreateInvite;
