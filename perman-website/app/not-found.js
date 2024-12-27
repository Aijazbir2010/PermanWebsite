"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CustomNotFound = () => {
  return (
    <>
        <Navbar/>

        <div className='flex mx-3 md:mx-10 mt-10'>
            <ArrowBackIcon className='text-2xl md:text-5xl cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>window.history.back()}/>
        </div>
        

        <div className="main bg-blue-5-opacity mt-10 mb-20 mx-3 md:mx-10 h-[900px] lg:h-[700px] p-20 rounded-3xl flex flex-col">
            <div className='flex flex-col gap-20 lg:gap-0 lg:flex-row lg:justify-between items-center h-full'>
                <div className='flex flex-col w-[20rem] md:w-[26rem] gap-3 text-center lg:text-left'>
                    <span className='text-9xl md:text-[10rem] font-bold drop-shadow-custom-blue'>404</span>
                    <span className='font-bold text-3xl md:text-5xl'>Page Not Found !</span>
                    <span className='text-[#A7AAA7] text-lg md:text-2xl'>Oops ! The Page which you are looking for was Not Found !</span>
                </div>
                <div>
                    <Image src={"/copy-robot.png"} width={300} height={300} alt='copy-robot' className='w-72 h-64 md:w-[300px] md:h-[300px]'/>
                </div>
            </div>
            <Link href={"/homepage"} className='flex justify-center'>
                <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-0 md:mt-10 hover:scale-110 transition-transform duration-300">
                    <HomeIcon/>
                    <span>Home Page</span>
                </button>
            </Link>
        </div>

        <Footer/>
    </>
  )
}

export default CustomNotFound
