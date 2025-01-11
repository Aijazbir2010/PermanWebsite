"use client"
import React from 'react'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import MailIcon from '@mui/icons-material/Mail';
import LanguageIcon from '@mui/icons-material/Language';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <div className='footer bg-blue-5-opacity h-[550px] md:h-72 px-10 pt-16 relative'>
        <div className='main flex flex-col md:flex-row justify-between gap-10 md:gap-0'>  
            <div className="contactUs flex flex-col justify-center items-center">
                <h2 className='font-bold text-4xl mb-6'>Contact Us</h2>
                <div className='text-[#A7AAA7] flex flex-row items-center gap-2 mb-2 hover:text-[#2176FF] cursor-pointer transition-colors duration-300'>
                    <LocalPhoneIcon/>
                    <span>+91-00000-00000</span>
                </div>
                <div className='text-[#A7AAA7] flex flex-row items-center gap-2 hover:text-[#2176FF] cursor-pointer transition-colors duration-300'>
                    <MailIcon/>
                    <span>sumirexmitsuo@gmail.com</span>
                </div>
            </div>

            <div className="about flex flex-col justify-center items-center">
                <h2 className='font-bold text-4xl mb-6'>About</h2>
                <div className='text-[#A7AAA7] flex flex-row items-center gap-2 mb-2 hover:text-[#2176FF] cursor-pointer transition-colors duration-300'>
                    <LanguageIcon/>
                    <span>Portfolio</span>
                </div>
            </div>

            <div className="socialMedia flex flex-col justify-center items-center">
            <h2 className='font-bold text-4xl mb-6'>Social Media</h2>
                <a href={"https://www.instagram.com/aijazbir_2010/"} target={"_blank"} rel={"noopener noreferrer"}>
                    <div className='text-[#A7AAA7] flex flex-row items-center gap-2 mb-2 hover:text-[#2176FF] cursor-pointer transition-colors duration-300'>
                        <InstagramIcon/>
                        <span>Instagram</span>
                    </div>
                </a>
                <a href={"https://www.facebook.com/aijazbirbrar"} target={"_blank"} rel={"noopener noreferrer"}>
                <div className='text-[#A7AAA7] flex flex-row items-center gap-2 hover:text-[#2176FF] cursor-pointer transition-colors duration-300'>
                    <FacebookIcon/>
                    <span>Facebook</span>
                </div>
                </a>
            </div>
        </div>

        <div className='flex justify-center'>
            <span className='text-[#A7AAA7] absolute bottom-5'>&copy; {new Date().getFullYear()} Perman Website. All Rights Reserved</span>
        </div>
    </div>
  )
}

export default Footer
