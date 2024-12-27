"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from 'next/link'
import Image from 'next/image'
import axiosInstance from '../axios'

import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MailIcon from '@mui/icons-material/Mail';
import Spinner from '@/components/Spinner';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const loginValidationSchema = Yup.object().shape({
  identifier: Yup.string()
    .test(
      "is-username-or-email",
      "Enter a Valid E-mail or Username !",
      (value) => {
        if (!value) return false; // Required check
        const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value); // Email validation
        const isUsername = /^[a-zA-Z0-9]{4,12}$/.test(value); // Username validation
        return isEmail || isUsername; // Either should pass
      }
    )
    .required("E-mail or Username is Required !"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters")
    .required("Password is Required !"),
});

const signupValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a Valid E-mail !")
    .required("E-mail is Required !"),
  username: Yup.string()
    .min(4, "Username must be at least 4 characters")
    .max(12, "Username cannot exceed 12 characters")
    .matches(/^[a-zA-Z0-9]*$/, "Only Letters and Numbers are Allowed !")
    .required("Username is Required !"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters")
    .required("Password is Required !"),
});

const Login = () => {

  const router = useRouter();

  useEffect(() => {
    const refreshAccessToken = async () => {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
          try {
              const refreshResponse = await axiosInstance.post('/refresh', {}, {withCredentials: true})
              const newAccessToken = refreshResponse.data.accessToken;
              localStorage.setItem('accessToken', newAccessToken)
              router.push('/homepage') 
          } catch (err) {
              console.log("Unable to Refresh New Access Token :(", err)
          }
        
      }
      
      if (accessToken) {
        router.push('/homepage')
      }
    }

    refreshAccessToken()
    
  }, [router])
  

  const searchParams = useSearchParams()
  const [isSignup, setIsSignup] = useState(null)
  const [passwordVisible, setPasswordVisible] = useState(false)


  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    watch,
    setError: setLoginError,
    formState: { errors: loginErrors, isValid },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
    mode: "onChange",
  });

  const identifier = watch("identifier")

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm({
    resolver: yupResolver(signupValidationSchema),
  });

  const [isSigningUp, setIsSigningUp] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const onLoginSubmit = async (data) => {

      try {
        setIsLoggingIn(true)

        const response = await axiosInstance.post('/login', {
          identifier: data.identifier,
          password: data.password,
        })

        localStorage.setItem('accessToken', response.data.accessToken)

        setIsLoggingIn(false)

        router.push(`/homepage?msg=${encodeURIComponent('Log in Successful !')}`)
      } catch (err) {
        setIsLoggingIn(false)
        console.error('Log in Error !', err)
        if(err.response.data.message === "Invalid e-mail/username !") {
          toast("Invalid E-mail / Username !", {
            style: { backgroundColor: '#0a1321', color: '#ffffff' },
            progressStyle: { backgroundColor: 'red' },
          });

          return
        }

        if(err.response.data.message === "Invalid password !") {
          toast("Invalid Password !", {
            style: { backgroundColor: '#0a1321', color: '#ffffff' },
            progressStyle: { backgroundColor: 'red' },
          });

          return
        }
      }
  }

  const onSignupSubmit = async (data) => {

    try {
      setIsSigningUp(true)

      const response = await axiosInstance.post('/signup', {
        email: data.email,
        username: data.username,
        password: data.password,
      })

      localStorage.setItem('accessToken', response.data.accessToken)

      setIsSigningUp(false)

      router.push(`/homepage?msg=${encodeURIComponent('Sign up Successful !')}`)
    } catch (err) {
      setIsSigningUp(false)
      console.error('Sign up Error !', err)

      if(err.response.data.message === "User with this Username Already Exists !") {
        toast("User with this Username Already Exists !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });

        return
      }
    
      if(err.response.data.message === "User with this E-mail Already Exists !") {
        toast("User with this E-mail Already Exists !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });

        return
      }
    }
}
  

  useEffect(() => {
    // Check if 'login' query parameter is present and set state
    const loginQuery = searchParams.get("login");

    if (loginQuery !== null) {
      setIsSignup(!(loginQuery === "true"));
    }
  }, [searchParams]); // Re-run when searchParams change
  
  const handleSpanForgotPasswordClick = () => {
    if (!identifier) {
      setLoginError("identifier", {
        type: "manual",
        message: "Please fill the Valid E-mail or Username before proceeding",
      })
    }
  }

  useEffect(() => {
    try {
      const toastMessage = searchParams.get('msg')

      if (toastMessage && decodeURIComponent(toastMessage) === 'Password Changed Successfully ! Please Log in To Continue !') {
        toast(decodeURIComponent(toastMessage), {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        });

        return
      }

      if(toastMessage) {
        toast(decodeURIComponent(toastMessage), {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });
      }

      router.replace('/login', undefined, { shallow: true });

    } catch (err) {
      return
    }
  }, [])

  return (
    <>

      <ToastContainer theme='colored' autoClose={3000}/>

      {isSigningUp || isLoggingIn && <div className='inset-0 fixed bg-black-90-opacity z-50 flex justify-center items-center'>
        <Spinner/>
      </div>}

      <div className='nav flex mx-3 md:mx-10 h-20 pt-5'>
        <Link href={"/"}>
          <img width={80} height={80} src="/logo.svg" alt="" className='cursor-pointer hover:scale-110 transition-transform duration-300'/>
        </Link>
      </div>

      <div className="main-container bg-blue-5-opacity my-20 mx-3 md:mx-10 h-[1000px] lg:h-[700px] flex flex-col gap-20 lg:gap-0 lg:flex-row lg:justify-between items-center p-20 rounded-3xl">

        <div className="login-signup-container flex flex-row w-[350px] py-2 relative overflow-hidden">
          <form action="" className={`log-in text-center transition-transform duration-300`} onSubmit={handleLoginSubmit(onLoginSubmit)}>        

              <div className={`font-bold text-5xl text-center transition-transform duration-300 ${isSignup? '-translate-x-full' : 'translate-x-0'}`}>
                <span>Log in Form</span>  
              </div>             

              <div className='h-14 bg-black-50-opacity rounded-3xl flex flex-row my-10 relative'>
                <div className={`bg-[#2176FF] h-14 w-1/2 rounded-3xl absolute z-0 transition-transform duration-300 ${isSignup? "translate-x-full" : "translate-x-0"}`}></div>
                <div className='h-14 rounded-3xl w-1/2 flex justify-center items-center z-10'><span className='font-bold cursor-pointer' onClick={()=>{setIsSignup(false)}}>Log in</span></div>
                <div className='h-14 w-1/2 flex justify-center items-center z-10'><span className='font-bold cursor-pointer' onClick={()=>{setIsSignup(true)}}>Sign up</span></div>
              </div>

              <div className={`flex flex-col ${loginErrors.identifier || loginErrors.password ? 'gap-1' : 'gap-5'} transition-transform duration-300 ${isSignup? '-translate-x-full' : 'translate-x-0'}`}>
                <div className={`h-14 bg-black-50-opacity rounded-3xl flex flex-row px-10 items-center gap-2 hover:bg-black-90-opacity transition-colors duration-300 focus-within:bg-black-90-opacity ${loginErrors.identifier? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                  <AlternateEmailIcon sx={{color: "#A7AAA7"}}/>
                  <input type="text" className={`h-14 bg-transparent w-full rounded-3xl border-0 outline-0 font-bold placeholder:font-normal placeholder:text-[#A7AAA7]`} placeholder='E-mail or Username' {...loginRegister("identifier")}/>
                </div>
                {loginErrors.identifier && <p className='text-red-500 text-left px-8 font-bold text-xs'>{loginErrors.identifier.message}</p>}
                <div className={`h-14 bg-black-50-opacity rounded-3xl flex flex-row px-10 items-center gap-2 hover:bg-black-90-opacity transition-colors duration-300 focus-within:bg-black-90-opacity ${loginErrors.password? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                  <LockIcon sx={{color: "#A7AAA7"}}/>
                  <input type={`${passwordVisible? 'text' : 'password'}`} className={`h-14 bg-transparent w-full rounded-3xl border-0 outline-0 font-bold placeholder:font-normal placeholder:text-[#A7AAA7]`} placeholder='Password' {...loginRegister("password")}/>
                  {passwordVisible? <VisibilityOffIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>setPasswordVisible(false)}/> : <VisibilityIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>setPasswordVisible(true)}/>}
                </div>
                {loginErrors.password && <p className='text-red-500 text-left px-8 font-bold text-xs'>{loginErrors.password.message}</p>}
              </div>

              <div className={`text-left px-10 my-3 transition-transform duration-300 ${isSignup? '-translate-x-full' : 'translate-x-0'}`}>
                {identifier && !loginErrors.identifier ? (
                  <Link className='text-[#2176FF] hover:underline cursor-pointer' href={`/forgotpassword?identifier=${identifier}`}>
                    Forgot Password?
                  </Link>
                ) : (
                  <span className='text-[#2176FF] hover:underline cursor-pointer' onClick={handleSpanForgotPasswordClick}>
                    Forgot Password?
                  </span>
                )}
                
              </div>

              <button className={`w-full h-14 rounded-3xl bg-[#2176FF] font-bold flex justify-center items-center hover:scale-[0.98] transition-transform duration-300 ${isSignup? '-translate-x-full' : 'translate-x-0'}`} type='submit'>Log in</button>

              <div className={`flex flex-row gap-1 justify-center my-5 transition-transform duration-300 ${isSignup? '-translate-x-full' : 'translate-x-0'}`}>
                <span>Not a Member ?</span>
                <span className='text-[#2176FF] hover:underline cursor-pointer' onClick={()=>setIsSignup(true)}>Sign up now</span>
              </div> 

            
          </form>

          <form action="" className={`sign-up text-center absolute transition-transform duration-300 overflow-y-auto ${isSignup? 'translate-x-0' : 'translate-x-full'}`} onSubmit={handleSignupSubmit(onSignupSubmit)}>        
              <div className={`font-bold text-5xl text-center transition-transform duration-300 ${isSignup? 'translate-x-0' : 'translate-x-full'}`}>
                <span>Sign up Form</span>  
              </div>            

              <div className={`flex flex-col ${signupErrors.username || signupErrors.email || signupErrors.password ? 'gap-1' : 'gap-5'} mt-[136px] transition-transform duration-300 ${isSignup? 'translate-x-0' : 'translate-x-full'}`}>
                <div className={`h-14 bg-black-50-opacity rounded-3xl flex flex-row px-10 items-center gap-2 hover:bg-black-90-opacity transition-colors duration-300 focus-within:bg-black-90-opacity ${signupErrors.username? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                  <AlternateEmailIcon sx={{color: "#A7AAA7"}}/>
                  <input type="text" className={`h-14 bg-transparent w-full rounded-3xl border-0 outline-0 font-bold placeholder:font-normal placeholder:text-[#A7AAA7]`} placeholder='Username' name='username' {...signupRegister("username")}/>
                </div>
                {signupErrors.username && <p className='text-red-500 text-left px-8 font-bold text-xs'>{signupErrors.username.message}</p>}
                <div className={`h-14 bg-black-50-opacity rounded-3xl flex flex-row px-10 items-center gap-2 hover:bg-black-90-opacity transition-colors duration-300 focus-within:bg-black-90-opacity ${signupErrors.email? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                  <MailIcon sx={{color: "#A7AAA7"}}/>
                  <input type="text" className={`h-14 bg-transparent w-full rounded-3xl border-0 outline-0 font-bold placeholder:font-normal placeholder:text-[#A7AAA7]`} placeholder='E-mail' name='email' {...signupRegister("email")}/>
                </div>
                {signupErrors.email && <p className='text-red-500 text-left px-8 font-bold text-xs'>{signupErrors.email.message}</p>}
                <div className={`h-14 bg-black-50-opacity rounded-3xl flex flex-row px-10 items-center gap-2 hover:bg-black-90-opacity transition-colors duration-300 focus-within:bg-black-90-opacity ${signupErrors.password? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                  <LockIcon sx={{color: "#A7AAA7"}}/>
                  <input type={`${passwordVisible? 'text' : 'password'}`} className={`h-14 bg-transparent w-full rounded-3xl border-0 outline-0 font-bold placeholder:font-normal placeholder:text-[#A7AAA7]`} placeholder='Password' name='password' {...signupRegister("password")}/>
                  {passwordVisible? <VisibilityOffIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>setPasswordVisible(false)}/> : <VisibilityIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>setPasswordVisible(true)}/>}
                </div>
                {signupErrors.password && <p className='text-red-500 text-left px-8 font-bold text-xs'>{signupErrors.password.message}</p>}
              </div>


              <button className={`w-full h-14 rounded-3xl ${signupErrors.password? 'mb-10 mt-2' : 'my-10'} bg-[#2176FF] font-bold flex justify-center items-center hover:scale-[0.98] transition-transform duration-300 ${isSignup? 'translate-x-0' : 'translate-x-full'}`} type='submit'>Sign up</button>

           
          </form>
          
        </div>

        <div>
          <Image src={"/copy-robot.png"} width={300} height={300} alt='copy-robot'/>
        </div>

      </div>


    </>
  )
}

export default Login
