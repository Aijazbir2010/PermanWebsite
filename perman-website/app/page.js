"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "./axios";
import UnNavbar from "@/components/Un-Navbar";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import AddIcon from '@mui/icons-material/Add';
import MoodIcon from '@mui/icons-material/Mood';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import EditIcon from '@mui/icons-material/Edit';
import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function Home() {
  
  const router = useRouter()

  const [averageRating, setAverageRating] = useState(0)

  const getAverageRating = async () => {
    try {
        const response = await axiosInstance.get('/reviews/average')

        const { averageRating } = response.data
        setAverageRating((prevRating) => averageRating)
    } catch (err) {
        console.log("Can't Get Average Rating !", err)
    }
  }

  useEffect(() => {
    getAverageRating()
  }, [])

  const [reviews, setReviews] = useState(null)

  const getReviews = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.get('/reviews')

        const { reviews } = response.data
        setReviews((prevReviews) => reviews)
    } catch (err) {
        console.log("Can't Fetch Reviews !", err)
    }
  }

  useEffect(() => {
    getReviews()
  }, [])

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

      if(accessToken) {
        router.push('/homepage')
      }
    }
    
    refreshAccessToken()
    
  }, [router])

  return (
   <>
    <UnNavbar/>

    <section className="main mx-3 md:mx-10 my-20">
      <div className="hero">

          <div className="sec1 w-full flex flex-row justify-between">
            <div className="w-1/2">
              <h1 className="font-bold text-2xl md:text-5xl leading-8 md:leading-[60px]">Log in/Sign up To Watch All Perman Episodes In Hindi For Free !</h1>
              <Link href={"/login"}>
                <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300">
                  <SubdirectoryArrowRightIcon/>
                  <span>Log in Page</span>
                </button>
              </Link>
            </div>
            <div className="w-1/2 flex justify-end">
              <Image src={"/perman-one.png"} width={150} height={350} alt="perman-no.1" className="mr-2 md:mr-10 w-20 h-48 md:w-[200px] md:h-[350px]"/>
            </div>
            
          </div>

          <div className="sec2 w-full flex flex-row justify-between mt-20">
            <div className="w-1/2 flex justify-start">
              <Image src={"/sumire.png"} width={200} height={300} alt="perman-no.2" className="w-28 h-48 md:w-[200px] md:h-[300px]"/>
            </div>
            <div className="w-1/2 flex flex-col gap-2 md:gap-5">
              <h1 className="font-bold text-2xl md:text-5xl leading-8 md:leading-[60px] text-right">Like Episodes To Make Them Trending !</h1>
              <p className="text-[#A7AAA7] text-xs md:text-base text-right">Episodes with highest likes across the Globe will be displayed in the Trending Section</p>
            </div>
          </div>

          <div className="sec3 w-full flex flex-row justify-between mt-20">
          <div className="w-1/2">
              <h1 className="font-bold text-2xl md:text-5xl leading-8 md:leading-[60px]">Create Custom Playlists To Save Your Favourite Episodes !</h1>
              <p className="text-[#A7AAA7] text-xs md:text-base mt-2 md:mt-5">Create Different Playlists And Save Different Kinds Of Episodes !</p>
              <Link href={"/login"}>
                <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300">
                  <AddIcon/>
                  <span>Create Playlist</span>
                </button>
              </Link>
            </div>
            <div className="w-1/2 flex justify-end">
              <Image src={"/payan.png"} width={300} height={400} alt="perman-no.3" className="mr-2 md:mr-10 w-60 h-70 md:w-[300px] md:h-[400px]"/>
            </div>
          </div>

          <div className="sec4 w-full flex flex-row justify-between mt-20">
          <div className="w-1/2 flex justify-start">
              <Image src={"/perman-badge.png"} width={150} height={300} alt="perman-badge" className="mr-10"/>
            </div>
            <div className="w-1/2 flex flex-col items-end">
              <h1 className="font-bold text-2xl md:text-5xl leading-8 md:leading-[60px] text-right">Create Your Customizable Profile To Comment On Episodes !</h1>
              <Link href={"/login"}>
                <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 w-fit hover:scale-110 transition-transform duration-300">
                  <MoodIcon/>
                  <span>Add Comment</span>
                </button>
              </Link>
            </div>
          </div>

      </div>
    </section>

    <section className="reviews my-20">
            <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">Rating</span>
                <div className="">
                    {Array.from({length: 5}).map((_, index) =>
                        index < averageRating ? (
                            <StarIcon key={index} sx={{ color: "#FFE600"}}/>
                        ) : (
                            <StarBorderIcon key={index} sx={{ color: "#FFE600"}}/>
                        )
                    )}
                </div>
            </div>

            <div className="reviews-container text-center mt-10">
                <Swiper modules={[Navigation]} navigation={true} spaceBetween={40} loop={false} centeredSlides={true} slidesPerView={"auto"} grabCursor={true} className="reviews-swiper">
                    
                    {reviews && reviews.map((review, index) => (<SwiperSlide key={index} className="reviews-card bg-blue-5-opacity !w-[20rem] !h-96 md:!w-96 rounded-3xl p-5 flex-shrink-0 hover:bg-blue-10-opacity">
                        <div className="user-details flex flex-row gap-5">
                            <div className="w-28 h-28 rounded-full flex flex-shrink-0 items-center justify-center">
                                <img src={review.userProfilePic || "https://m.media-amazon.com/images/M/MV5BMmU0OWRhNmMtZGM2Ni00MGI0LTkyZDEtYWU1YjlhZjkyNDU2XkEyXkFqcGc@._V1_.jpg"} alt="profile-pic" className="w-28 h-28 rounded-full object-cover" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-3xl font-bold">{review.userDisplayName}</span>
                                <span className="text-[#A7AAA7]">@{review.userUsername}</span>
                            </div>
                        </div>
                        <div className="user-review flex flex-col text-left mt-7">
                            <div>
                                {Array.from({length: 5}).map((_, index) => 
                                    index < review.rating ? (
                                        <StarIcon key={index} sx={{ color: "#FFE600"}}/>
                                    ) : (
                                        <StarBorderIcon key={index} sx={{ color: "#FFE600"}}/>
                                    )
                                )}
                            </div>
                            <span>"{review.content}"</span>
                        </div>
                        <div className="wasThisHelpful flex items-center gap-2 mt-20">
                            <Link href={"/login"}>
                              <div className='cursor-pointer'>
                                  <ThumbUpOffAltIcon sx={{color: "#A7AAA7"}} className="hover:scale-110 transition-transform duration-300"/>
                              </div>
                            </Link>
                            <span className="text-[#A7AAA7]">Was This Helpful ?</span>
                        </div>
                    </SwiperSlide>))}

                    {reviews && reviews.length === 0 && (<div className='!h-96 flex flex-col gap-5 items-center justify-center'>
                      <span className='font-bold text-3xl md:text-5xl'>No Reviews</span>
                      <span className='text-xl'>Be the First One to Post a Review !</span>
                    </div>)}

                </Swiper>

                {!reviews && <div className="!h-96 flex justify-center items-center">
                  <Spinner/>  
                </div>}
            </div>
            <div className="flex justify-center">
              <Link href={"/login"}>
                <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300">
                    <EditIcon/>
                    <span>Write a Review</span>
                </button>
              </Link>
            </div>
    </section>

    <Footer/>
   </>
  );
}
