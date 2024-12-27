"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Spinner from '@/components/Spinner'
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from '../axios'

import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const changePasswordValidationSchema = Yup.object().shape({
  code: Yup.string()
    .min(6, "Code must be of 6 characters")
    .max(6, "Code cannot exceed 6 characters")
    .matches(/^[a-zA-Z0-9]*$/, "Only Letters and Numbers are Allowed !")
    .required("Code is Required !"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters")
    .required("Password is Required !"),
  confirmPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters")
    .required("Password is Required !"),
});

const ForgotPassword = () => {

  const router = useRouter()
  const searchParams = useSearchParams()

  const {
      register: passwordRegister,
      handleSubmit: handlePasswordSubmit,
      setError,
      formState: { errors: passwordErrors },
    } = useForm({
      resolver: yupResolver(changePasswordValidationSchema),
    });

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const [isResendingCode, setIsResendingCode] = useState(false)

  const [user, setUser] = useState(null)

  const sendEmailToUser = async () => {
    try {
      const response = await axiosInstance.get(`/user/forgotpassword?identifier=${searchParams.get('identifier')}`)

      const { user } = response.data

      setUser(user)
    } catch (err) {
      console.log("Can't Send E-mail To User !", err)

      if (err.response.data.message === "User Not Found !") {
        router.push(`/login?msg=${encodeURIComponent('Invaid E-mail / Username ! User Not Found !')}`)
      }
      
      if (err.response.data.message === "Error Sending Code !") {
        toast("Error Sending Code ! Please Try To Resend Code !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });
        setIsResendDisabled(false)
      }
    }
  }

  useEffect(() => {
    sendEmailToUser()
  }, [])
  
  function maskEmail(email) {
    const [username, domain] = email.split("@"); // Split the email into username and domain
    if (username.length <= 2) {
      // If the username is very short, don't mask too much
      return `${username}***@${domain}`;
    }
    const visibleStart = username.slice(0, 3); // First 3 characters of the username
    const visibleEnd = username.slice(-2); // Last 2 characters of the username
    return `${visibleStart}****${visibleEnd}@${domain}`; // Mask the middle
  }

  const changePassword = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match ! Please make sure both fields are identical.",
        })
        return
      }

      const response = await axiosInstance.post(`/user/resetpassword?id=${user.userId}`,
        {
          code: data.code,
          password: data.password,
        },
      )

      if (response.status === 200) {
        router.push(`/login?msg=${encodeURIComponent('Password Changed Successfully ! Please Log in To Continue !')}`)
      }

    } catch (err) {
      console.log("Can't Change Password !", err)

      if (err.response.data.message === "Invalid Verification Code !") {
        toast("Invalid Verification Code !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });
      }
    }
  }

  //First Code Sent On Page Load
  useEffect(() => {
    setIsResendDisabled(true);
    setTimeLeft(60); // Reset to 60 seconds for the next resend
  }, [])
  

  // Function to handle the resend action
  const resendCode = async () => {

    try {
      setIsResendingCode(true)

      const response = await axiosInstance.get(`/user/resendcode?id=${user.userId}`)

      setIsResendingCode(false)

      toast("Code Sent Successfully !", {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: '#2176ff' },
      });

      // Disable the resend button and start the timer
      setIsResendDisabled(true);
      setTimeLeft(60); // Reset to 60 seconds for the next resend
    } catch (err) {
      console.log("Can't Resend Code !", err)

      if (err.response.data.message === "Error Sending Code !") {
        toast("Error Sending Code ! Please Try To Resend Code !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });
        setIsResendDisabled(false)
      }
    }
    
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (isResendDisabled && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsResendDisabled(false); // Enable the resend button when the timer reaches 0
    }

    return () => clearInterval(timer); // Cleanup the timer on component unmount or when timeLeft reaches 0
  }, [isResendDisabled, timeLeft]);

  // Format the time in MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? `0${minutes}` : minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
  };

  return (
    <>
        <ToastContainer theme='colored' autoClose={3000}/>

        {isResendingCode || !user && <div className='inset-0 fixed bg-black-90-opacity z-50 flex justify-center items-center'>
            <Spinner/>
        </div>}

        <div className='nav flex mx-3 md:mx-10 h-20 pt-5'>
            <Link href={"/"}>
                <img width={80} height={80} src="/logo.svg" alt="logo" className='cursor-pointer hover:scale-110 transition-transform duration-300'/>
            </Link>
        </div>

        <div className='mx-3 md:mx-10 mt-10'>
            <Link href={"/login"}>
                <ArrowBackIcon sx={{fontSize: "48px"}} className='cursor-pointer hover:scale-110 transition-transform duration-300'/>
            </Link>
        </div>    

        <div className="main-container bg-blue-5-opacity my-10 mx-3 md:mx-10 h-[1100px] lg:h-[700px] flex flex-col gap-20 lg:gap-0 lg:flex-row-reverse lg:justify-between items-center p-20 rounded-3xl">
            <div className="forgot-password-container flex flex-row w-[350px] py-2">
                <form action="" className={`forgot-password text-center`} onSubmit={handlePasswordSubmit(changePassword)}>        

                    <div className={`text-center flex flex-col gap-2 mb-5`}>
                        <span className='font-bold text-5xl'>Enter Code</span>  
                        <span className=''>{user ? `An email has been sent to ${maskEmail(user.email)} which contains the code to be entered to reset the password` : 'Sending Code To Your E-mail'}</span>
                    </div>             

                    

                    <div className={`flex flex-col ${passwordErrors.code || passwordErrors.password || passwordErrors.confirmPassword ? 'gap-1' : 'gap-5'}`}>
                        <div className={`h-14 bg-black-50-opacity rounded-3xl flex flex-row px-10 items-center gap-2 hover:bg-black-90-opacity transition-colors duration-300 focus-within:bg-black-90-opacity ${passwordErrors.code? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                            <VpnKeyIcon sx={{color: "#A7AAA7"}}/>
                            <input type="text" className='h-14 bg-transparent w-full rounded-3xl border-0 outline-0 font-bold placeholder:font-normal placeholder:text-[#A7AAA7]' placeholder='Code' {...passwordRegister("code")}/>
                        </div>
                        {passwordErrors.code && <p className='text-red-500 text-left px-8 font-bold text-xs'>{passwordErrors.code.message}</p>}
                        <div className={`h-14 bg-black-50-opacity rounded-3xl flex flex-row px-10 items-center gap-2 hover:bg-black-90-opacity transition-colors duration-300 focus-within:bg-black-90-opacity ${passwordErrors.password? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                            <LockIcon sx={{color: "#A7AAA7"}}/>
                            <input type={`${passwordVisible ? 'text' : 'password'}`} className='h-14 bg-transparent w-full rounded-3xl border-0 outline-0 font-bold placeholder:font-normal placeholder:text-[#A7AAA7]' placeholder='Password' {...passwordRegister("password")}/>
                            {passwordVisible ? <VisibilityOffIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => setPasswordVisible(false)}/> : <VisibilityIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => setPasswordVisible(true)}/>}
                        </div>
                        {passwordErrors.password && <p className='text-red-500 text-left px-8 font-bold text-xs'>{passwordErrors.password.message}</p>}
                        <div className={`h-14 bg-black-50-opacity rounded-3xl flex flex-row px-10 items-center gap-2 hover:bg-black-90-opacity transition-colors duration-300 focus-within:bg-black-90-opacity ${passwordErrors.confirmPassword? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                            <LockIcon sx={{color: "#A7AAA7"}}/>
                            <input type={`${confirmPasswordVisible ? 'text' : 'password'}`} className='h-14 bg-transparent w-full rounded-3xl border-0 outline-0 font-bold placeholder:font-normal placeholder:text-[#A7AAA7]' placeholder='Confirm Password' {...passwordRegister("confirmPassword")}/>
                            {confirmPasswordVisible ? <VisibilityOffIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => setConfirmPasswordVisible(false)}/> : <VisibilityIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => setConfirmPasswordVisible(true)}/>}
                        </div>
                        {passwordErrors.confirmPassword && <p className='text-red-500 text-left px-8 font-bold text-xs'>{passwordErrors.confirmPassword.message}</p>}
                    </div>



                    <button className={`w-full h-14 mt-10 rounded-3xl bg-[#2176FF] font-bold flex justify-center items-center hover:scale-[0.98] transition-transform duration-300`} type='submit'>Change Password</button>

                    <button className='mt-5 hover:text-[#2176FF] transition-colors duration-300' onClick={resendCode} disabled={isResendDisabled}>{isResendDisabled ? `Resend Code in ${formatTime(timeLeft)}` : 'Resend Code'}</button>
                </form>
            </div>

            <div>
                <Image src={"/payan.png"} width={300} height={300} alt='perman-no.3'/>
            </div>
        </div>
    </>
  )
}

export default ForgotPassword
