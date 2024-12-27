"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '../axios'
import { handleTokenExpired } from '@/utils/handleTokenExpired'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Spinner from '@/components/Spinner'
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import MailIcon from '@mui/icons-material/Mail';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const profileValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a Valid E-mail !"),
  username: Yup.string()
    .min(4, "Username must be at least 4 characters")
    .max(12, "Username cannot exceed 12 characters")
    .matches(/^[a-zA-Z0-9]*$/, "Only Letters and Numbers are Allowed !"),
  displayname: Yup.string()
    .min(4, "Display Name must be at least 4 characters")
    .max(20, "Display Name cannot exceed 20 characters"),
});

const Profile = () => {

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
    defaultValues: {
      displayname:  "",
      username:  "",
      email:  "",
    },
  });

  const router = useRouter()  
  const [isProfilePicUploading, setIsProfilePicUploading] = useState(false)

  const handleFileChange = async (e) => {
    const newFile = e.target.files[0];
    const formData = new FormData();
    formData.append('profilePic', newFile);

    try {
      setIsProfilePicUploading(true)

      // Send the file to the server using Axios
      const accessToken = localStorage.getItem('accessToken')
      const response = await axiosInstance.post('/user/uploadProfilePic', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',  // Important header for file uploads
        },
      });
  
      // Assuming the server returns the updated user object with the profilePic
      const updatedUser = response.data.user;
      setUser(updatedUser); // Update the user state with the updated user data (including profilePic)
  
      setIsProfilePicUploading(false)

      toast('Profile Pic Changed Successfully !', {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: '#2176ff' },
      });

    } catch (err) {
      console.log('Failed to upload image', err);
      setIsProfilePicUploading(false)

      handleTokenExpired(err, router)

      toast("Can't Change Profile Pic ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
      });
      
    }
  };

  useEffect(() => {
    const refreshAccessToken = async () => {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
          try {
              const refreshResponse = await axiosInstance.post('/refresh', {}, {withCredentials: true})
              const newAccessToken = refreshResponse.data.accessToken;
              localStorage.setItem('accessToken', newAccessToken) 
          } catch (err) {
              console.log("Unable to Refresh New Access Token :(")
              router.push('/login')
          }
        
      }  
    }
    
    refreshAccessToken()

  }, [router])

  const [user, setUser] = useState(null)

  const fetchUser = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await axiosInstance.get('/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',        
        },
      })
      const fetchedUser = response.data.user
      const updatedUser = {...fetchedUser, displayname: fetchedUser.displayname || fetchedUser.username}
      setUser(updatedUser)
      reset(updatedUser)
    } catch (err) {
        console.log(err)
        console.log("Profile Fetching Failed !")
        handleTokenExpired(err, router)
      }
  }
  
  useEffect(() => {
    fetchUser()
  }, [reset])

  const onProfileSubmit = async (data) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await axiosInstance.post('/user',
        {
          userId: data.userId,
          displayname: data.displayname,
          username: data.username,
          email: data.email,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',        
          },
        }
      )

      const updatedUser = response.data.user
      setUser(updatedUser)

      toast('Profile Updated Successfully !', {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: '#2176ff' },
      });

    } catch (err) {
        console.log(err)
        console.log("Updating User Failed !")

        if (err.response.data.message === 'Email already exists for another user !') {
          toast('This E-mail already exists for another user !', {
            style: { backgroundColor: '#0a1321', color: '#ffffff' },
            progressStyle: { backgroundColor: 'red' },
          });

          return
        }

        if (err.response.data.message === 'Username already exists for another user !') {
          toast('This Username already exists for another user !', {
            style: { backgroundColor: '#0a1321', color: '#ffffff' },
            progressStyle: { backgroundColor: 'red' },
          });

          return
        }

        toast("Can't Update User ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });

        handleTokenExpired(err, router)
    }
  }

  return (
    <>
        <ToastContainer theme='colored' autoClose={3000}/>
        
        <Navbar/>

        <div className='my-20 w-full'>
          <div className='text-center'>
            <span className="text-5xl font-bold">Your Profile</span>
          </div>
          {user ? (<form action="" onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className='flex justify-center my-10'>
                <div className="profile-img w-28 h-28 relative">
                  <img src={user?.profilePic || 'https://m.media-amazon.com/images/M/MV5BMmU0OWRhNmMtZGM2Ni00MGI0LTkyZDEtYWU1YjlhZjkyNDU2XkEyXkFqcGc@._V1_.jpg'} alt="" className='w-28 h-28 rounded-full'/>
                  <input type="file" name="profile-img-input" id="profile-img-input" accept="image/jpeg, image/png" className='hidden' onChange={handleFileChange}/>
                  <label htmlFor="profile-img-input" className='profile-img-input-label bg-black-opacity absolute z-10 top-0 w-28 h-28 rounded-full flex justify-center items-center'>
                    <AddPhotoAlternateIcon sx={{fontSize: "32px"}} className='hover:scale-110 transition-transform duration-300'/>
                  </label>

                  {isProfilePicUploading && <div className='w-28 h-28 bg-black-90-opacity z-50 absolute top-0 rounded-3xl flex justify-center items-center'>
                    <Spinner/>
                  </div>}
                </div>
              </div>

              <div className='flex flex-col items-center gap-7 mx-10'>
                <div className={`w-full md:w-3/4 bg-blue-5-opacity rounded-3xl h-14 px-10 flex flex-row items-center gap-2 hover:bg-blue-10-opacity transition-colors duration-300 focus-within:bg-blue-10-opacity ${profileErrors.displayname? 'border-[1px] border-red-500 text-red-500' : ''}`}>
                  <AccountCircleIcon sx={{color: "#A7AAA7"}}/>
                  <input type="text" className={`h-14 w-full bg-transparent border-0 outline-0 placeholder:text-[#A7AAA7] font-bold placeholder:font-normal`} placeholder='Display Name' {...profileRegister("displayname")}/>
                </div>
                <div className='text-left w-full md:w-3/4'>
                  {profileErrors.displayname && <p className='text-red-500 text-left px-8 font-bold text-sm'>{profileErrors.displayname.message}</p>}
                </div>
                

                <div className={`w-full md:w-3/4 bg-blue-5-opacity rounded-3xl h-14 px-10 flex flex-row items-center gap-2 hover:bg-blue-10-opacity transition-colors duration-300 focus-within:bg-blue-10-opacity ${profileErrors.username? 'border-[1px] border-red-500 text-red-500' : ''}`} {...profileRegister("username")}>
                  <AlternateEmailIcon sx={{color: "#A7AAA7"}}/>
                  <input type="text" className={`h-14 w-full bg-transparent border-0 outline-0 placeholder:text-[#A7AAA7] font-bold placeholder:font-normal`} placeholder='Username' {...profileRegister("username")}/>
                </div>
                <div className='text-left w-full md:w-3/4'>
                  {profileErrors.username && <p className='text-red-500 text-left px-8 font-bold text-sm'>{profileErrors.username.message}</p>}
                </div>

                <div className={`w-full md:w-3/4 bg-blue-5-opacity rounded-3xl h-14 px-10 flex flex-row items-center gap-2 hover:bg-blue-10-opacity transition-colors duration-300 focus-within:bg-blue-10-opacity ${profileErrors.email? 'border-[1px] border-red-500 text-red-500' : ''}`} {...profileRegister("email")}>
                  <MailIcon sx={{color: "#A7AAA7"}}/>
                  <input type="text" className={`h-14 w-full bg-transparent border-0 outline-0 placeholder:text-[#A7AAA7] font-bold placeholder:font-normal`} placeholder='E-mail' {...profileRegister("email")}/>
                </div>
                <div className='text-left w-full md:w-3/4'>
                  {profileErrors.email && <p className='text-red-500 text-left px-8 font-bold text-sm'>{profileErrors.email.message}</p>}
                </div>

                <button className='w-full md:w-3/4 h-14 rounded-3xl font-bold bg-[#2176FF] flex justify-center items-center hover:scale-[1.02] transition-transform duration-300' type='submit'>
                  <span>Save</span>
                </button>
              
              </div>
            </form>) : (
            <div className='!h-96 flex justify-center items-center'>
              <Spinner/>
            </div>)}

          <div className='mt-20 flex justify-center'>
            <Image src={"/perman-badge.png"} width={150} height={300} alt='perman-badge'/>
          </div>
          
        </div>

        <Footer/>
    </>
  )
}

export default Profile
