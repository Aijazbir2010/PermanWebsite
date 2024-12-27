"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axiosInstance from '../axios'
import { handleTokenExpired } from '@/utils/handleTokenExpired'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Spinner from '@/components/Spinner'
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import Modal from 'react-modal';

import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TextsmsIcon from '@mui/icons-material/Textsms';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DoneIcon from '@mui/icons-material/Done';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root'); // This should point to the root element of your app

const reviewValidationSchema = Yup.object().shape({
    content: Yup.string()
      .min(4, "Review must be at least 4 characters !")
      .max(100, "Review can't exceed 100 characters !")
      .required("Review Cannot Be Empty !"),
  });


const playlistValidationSchema = Yup.object().shape({
    name: Yup.string()
      .min(6, "Playlist Name must be at least 6 characters")
      .max(30, "Playlist Name cannot exceed 30 characters")
      .required("Playlist Name is Required !"),
    description: Yup.string()
      .min(6, "Playlist Description must be at least 6 characters")
      .max(150, "Playlist Description cannot exceed 150 characters")
      .required("Playlist Description is Required !"),
});


const Homepage = () => {

  const router = useRouter()
  const searchParams = useSearchParams()

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

  const {
    register: reviewRegister,
    handleSubmit: handleReviewSubmit,
    reset: resetReview,
    formState: { errors: reviewErrors },
  } = useForm({
    resolver: yupResolver(reviewValidationSchema),
  });

  const {
    register: createPlaylistRegister,
    handleSubmit: handleCreatePlaylistSubmit,
    reset: createPlaylistReset,
    formState: { errors: createPlaylistErrors },
  } = useForm({
    resolver: yupResolver(playlistValidationSchema),
  });

  const {
    register: editPlaylistRegister,
    handleSubmit: handleEditPlaylistSubmit,
    reset: editPlaylistReset,
    formState: { errors: editPlaylistErrors },
  } = useForm({
    resolver: yupResolver(playlistValidationSchema)
  })

  const [episodes, setEpisodes] = useState(null)
    
  const getEpisodes = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.get('/episodes', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',        
            },
        })
        const episodes = response.data.episodes
        setEpisodes(episodes)  
    } catch (err) {
        console.log(err)
        console.log("Episode Fetching Failed !")
        handleTokenExpired(err, router)
    }

  }  

  useEffect(() => {
    if (!episodes) {
      getEpisodes()  
    }
  }, [episodes])

  const [user, setUser] = useState({})

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
      console.log("User Fetch Successful...")
    } catch (err) {
        console.log(err)
        console.log("User Fetching Failed !")
        handleTokenExpired(err, router)
    }
  }
  useEffect(() => {
    fetchUser()
  }, [])

  const [rating, setRating] = useState(0); // Tracks the number of stars selected (1-5)

  const handleStarClick = (index) => {
    setRating(index + 1); // Set the rating to the index of the clicked star + 1
  };

  const [averageRating, setAverageRating] = useState(0)

  const getAverageRating = async () => {
    try {
        const response = await axiosInstance.get('/reviews/average')

        const { averageRating } = response.data
        setAverageRating(averageRating)
    } catch (err) {
        console.log("Can't Get Average Rating !", err)
    }
  }


  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [isDeleteReviewModalOpen, setIsDeleteReviewModalOpen] = useState(false);

  const [reviewToBeDeleted, setReviewToBeDeleted] = useState({})
  const [reviewToBeEdited, setReviewToBeEdited] = useState({})

    // Function to open the modal
  const openEditReviewModal = (review) => {
    setIsEditReviewModalOpen(true)
    setReviewToBeEdited(review)
    setRating(review.rating)
  };

  // Function to close the modal
  const closeEditReviewModal = () => {
    setIsEditReviewModalOpen(false);
    setReviewToBeEdited({})
  };

  const openDeleteReviewModal = (review) => {
    setIsDeleteReviewModalOpen(true);
    setReviewToBeDeleted(review)
  };

  const closeDeleteReviewModal = () => {
    setIsDeleteReviewModalOpen(false)
    setReviewToBeDeleted({})
  };

  useEffect(() => {
    if (isEditReviewModalOpen || isDeleteReviewModalOpen) {
      document.body.classList.add('no-scroll'); // Disable scroll
    } else {
      document.body.classList.remove('no-scroll'); // Enable scroll
    }
    return () => document.body.classList.remove('no-scroll'); // Cleanup
  }, [isEditReviewModalOpen, isDeleteReviewModalOpen]);

  const [customEditModalStyles, setCustomEditModalStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: '#0a0e15',
      borderRadius: '24px',
      position: 'relative',
      zIndex: 50,
      border: 'none',
    },
    overlay: {
      backgroundColor: 'rgba(8, 8, 8, 0.7)',
      zIndex: 40,
    },
  });

  const [customDeleteModalStyles, setCustomDeleteModalStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: '#0a0e15',
      borderRadius: '24px',
      position: 'relative',
      zIndex: 50,
      border: 'none',
    },
    overlay: {
      backgroundColor: 'rgba(8, 8, 8, 0.7)',
      zIndex: 40,
    },
  });

  useEffect(() => {
    const updateStyles = () => {
      if (window.innerWidth <= 1024) {
        setCustomEditModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '410px', // Adjust height automatically
          },
        }));
      } else {
        setCustomEditModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '60%',
            height: '410px',
          },
        }));
      }
    };

    updateStyles(); // Set initial styles
    window.addEventListener('resize', updateStyles);

    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  useEffect(() => {
    const updateStyles = () => {
      if (window.innerWidth <= 436) {
        setCustomDeleteModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '140px', // Adjust height automatically
          },
        }));
      }
      else if (window.innerWidth <= 768) {
        setCustomDeleteModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '112px', // Adjust height automatically
          },
        }));
      }
      else if (window.innerWidth <= 855) {
        setCustomDeleteModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '130px', // Adjust height automatically
          },
        }));
      }
      else if (window.innerWidth <= 1024) {
        setCustomDeleteModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '110px', // Adjust height automatically
          },
        }));
      }
      else {
        setCustomDeleteModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '60%',
            height: '115px',
          },
        }));
      }
    };

    updateStyles(); // Set initial styles
    window.addEventListener('resize', updateStyles);

    return () => window.removeEventListener('resize', updateStyles);
  }, []);


  const [isOpen, setIsOpen] = useState(false);

  // Function to open the modal
  const openModal = () => setIsOpen(true);

  // Function to close the modal
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll'); // Disable scroll
    } else {
      document.body.classList.remove('no-scroll'); // Enable scroll
    }
    return () => document.body.classList.remove('no-scroll'); // Cleanup
  }, [isOpen]);  

  const [customWriteReviewModalStyles, setCustomWriteReviewModalStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: '#0a0e15',
      borderRadius: '24px',
      position: 'relative',
      zIndex: 50,
      border: 'none',
    },
    overlay: {
      backgroundColor: 'rgba(8, 8, 8, 0.7)',
      zIndex: 40,
    },
  });

  useEffect(() => {
    const updateStyles = () => {
      if (window.innerWidth <= 1024) {
        setCustomWriteReviewModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '320px', // Adjust height automatically
          },
        }));
      } else {
        setCustomWriteReviewModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '60%',
            height: '320px',
          },
        }));
      }
    };

    updateStyles(); // Set initial styles
    window.addEventListener('resize', updateStyles);

    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  const handleLike = async (episodeId) => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.post(`/episodes/likeepisode?id=${episodeId}`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',        
            }
        })
        
        const updatedUser = response.data.user
        const updatedEpisode = response.data.episode
        setUser(updatedUser)
        setEpisodes(prevEpisodes => prevEpisodes.map(episode => episode.episodeId === episodeId ? {...episode, likes: updatedEpisode.likes} : episode))
        setTrendingEpisode(updatedEpisode)
    } catch (err) {
        console.log('Failed To Like Episode', err)
        handleTokenExpired(err, router)
    }   
  }

  const handleUnlike = async (episodeId) => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.post(`/episodes/unlikeepisode?id=${episodeId}`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',        
            }
        })
        
        const updatedUser = response.data.user
        const updatedEpisode = response.data.episode
        setUser(updatedUser)
        setEpisodes(prevEpisodes => prevEpisodes.map(episode => episode.episodeId === episodeId ? {...episode, likes: updatedEpisode.likes} : episode))
        setTrendingEpisode(updatedEpisode)
    } catch (err) {
        console.log('Failed To Unlike Episode', err)
        handleTokenExpired(err, router)
    }
  }

  const [reviews, setReviews] = useState(null)

  const getReviews = async () => {
    try {
        const response = await axiosInstance.get('/reviews')

        const { reviews } = response.data
        setReviews(reviews)
    } catch (err) {
        console.log("Can't Fetch Reviews !", err)
    }
  }

  useEffect(() => {
    getReviews()
  }, [])

  useEffect(() => {
    getAverageRating()
  }, [reviews])

  const [userReview, setUserReview] = useState(null)

  const getUserReview = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.get('/reviews/userreview', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const { userReview } = response.data
        setUserReview(userReview)
    } catch (err) {
        console.log("Can't Fetch User Review !", err)
        handleTokenExpired(err, router)
    }
  }

  useEffect(() => {
    getUserReview()   
  }, [])

  const postReview = async (data) => {
    closeModal()
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.post('/reviews',
            {
                rating,
                content: data.content
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            },
        )

        const { newReview } = response.data

        setReviews((prevReviews) => [...prevReviews, newReview])
        setUserReview(newReview)
        resetReview()
        setRating(0)

        toast('Thank You For Reviewing Us !', {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        })
    } catch (err) {
        closeModal()
        console.log("Can't Post Review !", err)
        handleTokenExpired(err, router)
        
        toast("Can't Post Review ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        })
    }
  }

  const editReview = async (data) => {
    closeEditReviewModal()
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.post('/reviews/edit',
            {
                content: data.content,
                rating,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            },
        )

        const { updatedReview } = response.data
        setReviews((prevReviews) => prevReviews.map((review) => review.reviewId === updatedReview.reviewId ? updatedReview : review))
        toast('Edited Review Successfully !', {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        })
    } catch (err) {
        closeEditReviewModal()
        console.log("Can't Edit Review !", err)
        handleTokenExpired(err, router)
        
        toast("Can't Edit Review ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        })
    }
  }

  const deleteReview = async () => {
    closeDeleteReviewModal()
    setRating(0)
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.delete('/reviews', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const { deletedReview } = response.data
        setReviews((prevReviews) => prevReviews.filter((review) => review.reviewId !== deletedReview.reviewId))
        setUserReview(null)
        toast('Deleted Review Successfully !', {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        })
    } catch (err) {  
        closeDeleteReviewModal()
        console.log("Can't Delete Review", err)
        handleTokenExpired(err, router)
        
        toast("Can't Delete Review ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        })
    }
  }

  const likeReview = async (reviewId) => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.post(`/reviews/like?id=${reviewId}`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const { updatedReview } = response.data
        setReviews((prevReviews) => prevReviews.map((review) => review.reviewId === updatedReview.reviewId ? updatedReview : review))
    } catch (err) {
        console.log("Can't Like Review !", err)
        handleTokenExpired(err, router)
    }
  }

  const unlikeReview = async (reviewId) => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.post(`/reviews/unlike?id=${reviewId}`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const { updatedReview } = response.data
        setReviews((prevReviews) => prevReviews.map((review) => review.reviewId === updatedReview.reviewId ? updatedReview : review))
    } catch (err) {
        console.log("Can't Unlike Review !", err)
        handleTokenExpired(err, router)
    }
  }

  const [trendingEpisode, setTrendingEpisode] = useState(null)

  const getTrendingEpisode = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.get('/episodes/trendingepisode', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })

        const { trendingEpisode } = response.data
        setTrendingEpisode(trendingEpisode)
    } catch (err) {
        console.log("Can't Fetch Trending Episode !", err)
        handleTokenExpired(err, router)
    }
  }

  useEffect(() => {
    getTrendingEpisode()
  }, [])

  const [isAddEpisodesToPlaylistHover, setIsAddEpisodesToPlaylistHover] = useState(false)
  const [isEditPlaylistHover, setIsEditPlaylistHover] = useState(false)  
  const [isDeletePlaylistHover, setIsDeletePlaylistHover] = useState(false)


  const [isAddEpisodesToPlaylistModalOpen, setisAddEpisodesToPlaylistModalOpen] = useState(false);

  const [episodesToBeAddedInPlaylist, setEpisodesToBeAddedInPlaylist] = useState({}) //Playlst in which episodes will be added when Modal is opened

  const openAddEpisodesToPlaylistModal = (playlist) => {
    setEpisodesToBeAddedInPlaylist(playlist)
    setisAddEpisodesToPlaylistModalOpen(true);
  }  

  const closeAddEpisodesToPlaylistModal = () => {
    setisAddEpisodesToPlaylistModalOpen(false);
    setEpisodesToBeAddedInPlaylist({})
  } 

  const [isEditPlaylistModalOpen, setIsEditPlaylistModalOpen] = useState(false);
  const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] = useState(false);

  
  const [playlistToBeEdited, setPlaylistToBeEdited] = useState({})
  const [playlistToBeDeleted, setPlaylistToBeDeleted] = useState({})

  const openEditPlaylistModal = (playlist) => {
    setPlaylistToBeEdited(playlist)
    setIsEditPlaylistModalOpen(true);
  }  
  
  const closeEditPlaylistModal = () => {
    setIsEditPlaylistModalOpen(false);
    setPlaylistToBeEdited({})
  }
  
  const openDeletePlaylistModal = (playlist) => {
    setPlaylistToBeDeleted(playlist)
    setIsDeletePlaylistModalOpen(true);
  }
  
  const closeDeletePlaylistModal = () => {
    setIsDeletePlaylistModalOpen(false);
    setPlaylistToBeDeleted({})
  }

  useEffect(() => {
    if (isAddEpisodesToPlaylistModalOpen || isEditPlaylistModalOpen || isDeletePlaylistModalOpen) {
      document.body.classList.add('no-scroll'); // Disable scroll
    } else {
      document.body.classList.remove('no-scroll'); // Enable scroll
    }
    return () => document.body.classList.remove('no-scroll'); // Cleanup
  }, [isAddEpisodesToPlaylistModalOpen, isEditPlaylistModalOpen, isDeletePlaylistModalOpen]);

  const [customStyles, setCustomStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: '#0a0e15',
      borderRadius: '24px',
      position: 'relative',
      zIndex: 50,
      border: 'none',
    },
    overlay: {
      backgroundColor: 'rgba(8, 8, 8, 0.7)',
      zIndex: 40,
    },
  });

  useEffect(() => {
    const updateStyles = () => {
      if (window.innerWidth <= 768) {
        setCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '430px', // Adjust height automatically
          },
        }));
      } 
      else if (window.innerWidth <= 1280) {
        setCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '380px', // Adjust height automatically
          },
        }));
      }
      else {
        setCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '60%',
            height: '380px',
          },
        }));
      }
    };

    updateStyles(); // Set initial styles
    window.addEventListener('resize', updateStyles);

    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  const [customCreateAndEditPlaylistModalStyles, setCustomCreateAndEditPlaylistModalStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: '#0a0e15',
      borderRadius: '24px',
      position: 'relative',
      zIndex: 50,
      border: 'none',
    },
    overlay: {
      backgroundColor: 'rgba(8, 8, 8, 0.7)',
      zIndex: 40,
    },
  });

  const [customDeletePlaylistStyles, setCustomDeletePlaylistStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: '#0a0e15',
      borderRadius: '24px',
      position: 'relative',
      zIndex: 50,
      border: 'none',
    },
    overlay: {
      backgroundColor: 'rgba(8, 8, 8, 0.7)',
      zIndex: 40,
    },
  });

  useEffect(() => {
    const updateStyles = () => {
      if (window.innerWidth <= 1024) {
        setCustomCreateAndEditPlaylistModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '460px', // Adjust height automatically
          },
        }));
      } else {
        setCustomCreateAndEditPlaylistModalStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '60%',
            height: '460px',
          },
        }));
      }
    };

    updateStyles(); // Set initial styles
    window.addEventListener('resize', updateStyles);

    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  useEffect(() => {
    const updateStyles = () => {
      if (window.innerWidth <= 436) {
        setCustomDeletePlaylistStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '140px', // Adjust height automatically
          },
        }));
      }
      else if (window.innerWidth <= 768) {
        setCustomDeletePlaylistStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '112px', // Adjust height automatically
          },
        }));
      }
      else if (window.innerWidth <= 855) {
        setCustomDeletePlaylistStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '130px', // Adjust height automatically
          },
        }));
      }
      else if (window.innerWidth <= 1024) {
        setCustomDeletePlaylistStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%', // Set modal width to 90% of screen width
            height: '110px', // Adjust height automatically
          },
        }));
      }
      else {
        setCustomDeletePlaylistStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '60%',
            height: '115px',
          },
        }));
      }
    };

    updateStyles(); // Set initial styles
    window.addEventListener('resize', updateStyles);

    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  const [playlists, setPlaylists] = useState(null)

  const getPlaylists = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.get('/playlists', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const { playlists } = response.data
        setPlaylists(playlists)
    } catch (err) {
        console.log("Can't Get Playlists !", err)
        handleTokenExpired(err, router)
    }
  }

  useEffect(() => {
    getPlaylists()
  }, [])

  const editPlaylist = async (data) => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.post(`/playlists/edit?id=${playlistToBeEdited.playlistId}`,
            {
                name: data.name,
                description: data.description,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            },
        )

        const { updatedPlaylist } = response.data
        setPlaylists((prevPlaylists) => prevPlaylists.map((playlist) => playlist.playlistId === updatedPlaylist.playlistId ? updatedPlaylist : playlist))
        editPlaylistReset()
        closeEditPlaylistModal()

        toast('Edited Playlist Successfully !', {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        })
    } catch (err) {
        closeEditPlaylistModal()
        console.log("Can't Edit Playlist !", err)
        handleTokenExpired(err, router)
        
        toast("Can't Edit Playlist ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        })
    }
  }

  const deletePlaylist = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.delete(`/playlists?id=${playlistToBeDeleted.playlistId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        const { playlists } = response.data
        setPlaylists(playlists)
        closeDeletePlaylistModal()

        toast('Deleted Playlist Successfully !', {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        })
    } catch (err) {
        closeDeletePlaylistModal()
        console.log("Can't Delete Playlist !", err)
        handleTokenExpired(err, router)
        
        toast("Can't Delete Playlist ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        })
    }
  }

  const [checkedStates, setCheckedStates] = useState({}); // Initialize empty state

    useEffect(() => {
    if (episodes?.length > 0) {
        const initialState = episodes.reduce((acc, episode) => {
        acc[episode.episodeId] = false;
        return acc;
        }, {});
        setCheckedStates(initialState); // Update state when episodes are available
    }
    }, [episodes]); // Run effect when episodes change

  const toggleCheckbox = (episodeId) => {
    setCheckedStates((prevStates) => ({
    ...prevStates,
    [episodeId]: !prevStates[episodeId],
    }));
  };


  const addEpisodesToPlaylist = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const episodesToAdd = Object.keys(checkedStates).filter((key) => checkedStates[key] === true)
      const response = await axiosInstance.post(`/playlists/addepisodes?id=${episodesToBeAddedInPlaylist.playlistId}`, 
        {
          episodesToAdd,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        },  
      )

      const { updatedPlaylist } = response.data
      setPlaylists((prevPlaylists) => prevPlaylists.map((playlist) => playlist.playlistId === updatedPlaylist.playlistId ? updatedPlaylist : playlist))
      closeAddEpisodesToPlaylistModal()

      toast('Episodes Added Successfully !', {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: '#2176ff' },
      })
    } catch (err) {
      closeAddEpisodesToPlaylistModal()
      console.log("Can't Add Episodes !", err)
      handleTokenExpired(err, router)
      
      toast("Can't Add Episodes ! Please Try Again !", {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: 'red' },
      })
    }
  }

  

  useEffect(() => {
    try {
      const toastMessage = searchParams.get('msg')

      if (toastMessage) {
        toast(decodeURIComponent(toastMessage), {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: '#2176ff' },
        });
      }
      
      router.replace('/homepage', undefined, { shallow: true });
    } catch (err) {
      return
    }
  }, [])

  return (
    <>
        <ToastContainer theme='colored' autoClose={3000}/>

        <Navbar/>

        <section className="episodes my-20">
            <div className='text-center'>
                <span className="text-2xl md:text-5xl font-bold">All Episodes</span>
            </div>
            
            <div className="reviews-container text-center mt-10">
                <Swiper modules={[Navigation]} navigation={true} spaceBetween={40} loop={false} centeredSlides={true} slidesPerView={"auto"} grabCursor={true} className="reviews-swiper">

                    {episodes ? episodes.map((episode, index) => (<SwiperSlide key={index} className="episode-card-homepage bg-blue-5-opacity !w-[20rem] !h-96 md:!w-96 rounded-3xl p-5 hover:cursor-pointer hover:bg-blue-10-opacity">
                        <div className='flex justify-center'>
                            <Image src={"/episode-thumbnail.jpg"} alt={"episode-thumbnail"} width={240} height={160} className='w-60 h-40 rounded-3xl'/>
                        </div>
                        <div className='flex flex-col gap-1 text-left mt-4'>
                            <Link href={`/playepisode?id=${episode.episodeId}`}>
                                <span className='font-bold hover:text-[#2176FF] transition-colors duration-300 cursor-pointer'>{episode.name}</span>
                            </Link>
                            <span className='text-xs text-[#A7AAA7]'>S01 E{(episode.episodeNumber).toString().padStart(3, '0')} • {episode.duration}</span>
                        </div>
                        <div className='flex flex-row justify-between mt-24'>
                            <div className='flex flex-row gap-2'>
                                {(user?.likedEpisodes || []).includes(episode.episodeId) ? <FavoriteIcon className='text-[#FF0066] hover:scale-110 transition-transform duration-300' onClick={()=>handleUnlike(episode.episodeId)}/> : <FavoriteBorderIcon className='hover:text-[#FF0066] hover:scale-110 transition-all duration-300' onClick={()=>handleLike(episode.episodeId)}/>}
                                <span className='font-bold'>{episode.likes} Likes</span>
                            </div>
                            <div className='flex flex-row gap-2'>
                                <Link href={`/playepisode?id=${episode.episodeId}`}>
                                    <TextsmsIcon className='hover:text-[#2176FF] hover:scale-110 transition-all duration-300'/>
                                </Link>
                                <span className='font-bold'>{episode.comments} Comments</span>
                            </div>
                        </div>
                    </SwiperSlide>)) : (<div className='!h-96 flex justify-center items-center'>
                      <Spinner/>
                    </div>)}

                </Swiper>
            </div>
            <div className="flex justify-center">
                <Link href={"/episodes"}>
                    <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300">
                        <SubdirectoryArrowRightIcon/>
                        <span>Episodes Page</span>
                    </button>
                </Link>
            </div>
        </section>

        <section className="trending mx-10">
            <div className='flex flex-row items-center justify-center gap-2 md:gap-5'>
                <img src="/trending-fire.png" alt="trending-fire" className='w-7 md:w-14 h-10 md:h-20'/>
                <span className="text-2xl md:text-5xl font-bold">Trending Episodes</span>
            </div>

            <div className='flex flex-col lg:flex-row items-center justify-between px-5 md:px-20 mt-10 gap-5 md:gap-0'>
                {trendingEpisode ? (<div className='episode-card-homepage bg-blue-5-opacity !w-[20rem] !h-96 md:!w-96 rounded-3xl p-5 hover:cursor-pointer hover:bg-blue-10-opacity transition-colors duration-300'>
                    <div className='flex justify-center'>
                        <img src="/episode-thumbnail.jpg" alt="episode-thumbnail" className='w-60 h-40 rounded-3xl'/>
                    </div>
                    <div className='flex flex-col gap-1 text-left mt-4'>
                        <Link href={`/playepisode?id=${trendingEpisode.episodeId}`}>
                            <span className='font-bold hover:text-[#2176FF] transition-colors duration-300'>{trendingEpisode.name}</span>
                        </Link>
                        <span className='text-xs text-[#A7AAA7]'>S01 E{(trendingEpisode.episodeNumber).toString().padStart(3, '0')} • {trendingEpisode.duration}</span>
                    </div>
                    <div className='flex flex-row justify-between mt-24'>
                        <div className='flex flex-row gap-2'>
                            {(user?.likedEpisodes || []).includes(trendingEpisode.episodeId) ? <FavoriteIcon className='text-[#FF0066] hover:scale-110 transition-transform duration-300' onClick={()=>handleUnlike(trendingEpisode.episodeId)}/> : <FavoriteBorderIcon className='hover:text-[#FF0066] hover:scale-110 transition-all duration-300' onClick={()=>handleLike(trendingEpisode.episodeId)}/>}
                            <span className='font-bold'>{trendingEpisode.likes} Likes</span>
                        </div>
                        <div className='flex flex-row gap-2'>
                            <Link href={`/playepisode?id=${trendingEpisode.episodeId}`}>
                                <TextsmsIcon className='hover:text-[#2176FF] hover:scale-110 transition-all duration-300'/>
                            </Link>    
                            <span className='font-bold'>{trendingEpisode.comments} Comments</span>
                        </div>
                    </div>
                </div>) : (
                  <Spinner/>
                )}

                <div>
                    <Image src={"/perman-two.png"} width={300} height={300} alt='perman-no.1' className='w-60 md:w-[300px] h-60 md:h-[300px]'/>
                </div>
            </div>

            <div className="flex justify-center">
                <Link href={"/trendingpage"}>
                    <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 lg:mt-10 hover:scale-110 transition-transform duration-300">
                        <SubdirectoryArrowRightIcon/>
                        <span>Trending Page</span>
                    </button>
                </Link>
            </div>
        </section>

        <section className="playlists my-20">
            <div className='text-center'>
                <span className="text-2xl md:text-5xl font-bold">Your Playlists</span>
            </div>
            
            <div className="playlists-container text-center mt-10">
                <Swiper modules={[Navigation]} navigation={true} spaceBetween={40} loop={false} centeredSlides={true} slidesPerView={"auto"} grabCursor={true} className="reviews-swiper">
                    
                {playlists && playlists.map((playlist, index) => (<SwiperSlide key={index} className="playlist-card bg-blue-5-opacity !w-[20rem] !h-96 md:!w-96 rounded-3xl p-5 hover:cursor-pointer hover:bg-blue-10-opacity relative">
                            <div className='flex flex-row justify-between w-full h-44'>
                            <div className='text-left w-3/4'>
                                    <span className='text-3xl font-bold'>{playlist.name}</span>
                                </div>
                                <Link href={`/playlists/${playlist.name}?id=${playlist.playlistId}`}>
                                    <div className="playbutton-playlist bg-[#2176FF] w-16 h-16 rounded-full flex items-center justify-center">
                                        <PlayArrowIcon sx={{fontSize: "40px"}}/>                    
                                    </div> 
                                </Link>    
                            </div>

                            <div className='w-full h-[1px] bg-white'></div>

                            <div className='text-left mt-2'>
                                <span className='text-xs text-[#A7AAA7] font-bold'>{playlist.description}</span>
                            </div>
                            <div className='text-left absolute bottom-5 w-[90%] flex flex-row justify-between items-end'>
                                <span className='font-bold'>Episodes: {playlist.episodes.length}</span>
                                <div className={`icons flex flex-row gap-2 transition-opacity duration-300`}>
                                <div className='flex flex-col items-end relative'>
                                    <div className={`bg-black-50-opacity rounded-3xl px-8 py-4 absolute top-[-60px] ${isAddEpisodesToPlaylistHover? '' : 'opacity-0'} transition-opacity duration-300`}><span className='text-nowrap'>Add Episodes</span></div>
                                        <div className='bg-[#2176FF] w-10 h-10 rounded-full flex justify-center items-center hover:scale-110 transition-transform duration-300' onMouseEnter={()=>setIsAddEpisodesToPlaylistHover(true)} onMouseLeave={()=>setIsAddEpisodesToPlaylistHover(false)} onClick={() => openAddEpisodesToPlaylistModal(playlist)}>
                                            <AddIcon/>
                                        </div> 
                                    </div>
                                    <div className='flex flex-col items-end relative'>
                                        <div className={`bg-black-50-opacity rounded-3xl px-8 py-4 absolute top-[-60px] ${isEditPlaylistHover? '' : 'opacity-0'} transition-opacity duration-300`}><span className='text-nowrap'>Edit Playlist</span></div>
                                        <div className='bg-[#2176FF] w-10 h-10 rounded-full flex justify-center items-center hover:scale-110 transition-transform duration-300' onMouseEnter={()=>setIsEditPlaylistHover(true)} onMouseLeave={()=>setIsEditPlaylistHover(false)} onClick={() => openEditPlaylistModal(playlist)}>
                                            <EditIcon/>
                                        </div> 
                                    </div>
                                    <div className='flex flex-col items-end relative'>
                                        <div className={`bg-black-50-opacity rounded-3xl px-8 py-4 absolute top-[-60px] ${isDeletePlaylistHover? '' : 'opacity-0'} transition-opacity duration-300`}><span className='text-nowrap'>Delete Playlist</span></div>
                                        <div className='bg-[#2176FF] w-10 h-10 rounded-full flex justify-center items-center hover:scale-110 transition-transform duration-300' onMouseEnter={()=>setIsDeletePlaylistHover(true)} onMouseLeave={()=>setIsDeletePlaylistHover(false)} onClick={() => openDeletePlaylistModal(playlist)}>
                                            <DeleteIcon/>
                                        </div> 
                                    </div>
                                    
                                </div>
                            </div>
                            
                        </SwiperSlide>))}

                        {playlists && playlists.length === 0 && <div className='h-80 flex items-center justify-center'>
                            <span className='font-bold text-5xl'>No Playlists !</span>
                        </div>}

                        {!playlists && <div className='!h-96 flex justify-center items-center'>
                          <Spinner/>  
                        </div>}

                </Swiper>
            </div>
            <div className="flex justify-center">
                <Link href={"/playlists"}>
                    <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300">
                        <SubdirectoryArrowRightIcon/>
                        <span>Playlists Page</span>
                    </button>
                </Link>
            </div>

            <Modal isOpen={isEditPlaylistModalOpen} onRequestClose={closeEditPlaylistModal} contentLabel="Edit Playlist Modal" style={customCreateAndEditPlaylistModalStyles}> {/* Edit Playlis Modal */}
                    <div className='flex flex-row'>
                        <div className='text-center w-full'>
                            <span className='text-2xl md:text-5xl font-bold'>Edit Playlist</span>
                        </div>
                        <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeEditPlaylistModal}/>
                    </div>
                    
                    <form action="" onSubmit={handleEditPlaylistSubmit(editPlaylist)}>
                        <div className={`inputs mt-10 flex flex-col ${editPlaylistErrors.name || editPlaylistErrors.description ? 'gap-2' : 'gap-5'}`}>
                            <input type="text" className={`bg-black-50-opacity rounded-3xl border-0 outline-0 px-4 md:px-8 h-14 w-full placeholder:text-[#A7AAA7] ${editPlaylistErrors.name ? 'border-[1px] border-red-500 text-red-500' : ''}`} defaultValue={playlistToBeEdited.name} placeholder="Edit Playlist !" {...editPlaylistRegister("name")}/>
                            {editPlaylistErrors.name && <p className='text-red-500 text-left px-8 font-bold text-xs'>{editPlaylistErrors.name.message}</p>}

                            <textarea type="text" className={`bg-black-50-opacity rounded-3xl border-0 outline-0 h-40 px-4 md:px-8 w-full py-5 resize-none overflow-hidden placeholder:text-[#A7AAA7] ${editPlaylistErrors.description ? 'border-[1px] border-red-500 text-red-500' : ''}`} defaultValue={playlistToBeEdited.description} placeholder='Edit Description !' {...editPlaylistRegister("description")}></textarea>
                            {editPlaylistErrors.description && <p className='text-red-500 text-left px-8 font-bold text-xs'>{editPlaylistErrors.description.message}</p>}
                        </div>
                        <div className='flex justify-center'>
                            <button className={`bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center ${editPlaylistErrors.name || editPlaylistErrors.description ? 'mt-1' : 'mt-10'} hover:scale-110 transition-transform duration-300`} type='submit'>
                                <DoneIcon/>
                                <span>Save Playlist</span>
                            </button>
                        </div>
                    </form>
            </Modal>

            <Modal isOpen={isDeletePlaylistModalOpen} onRequestClose={closeDeletePlaylistModal} contentLabel="Delete Playlist Modal" style={customDeletePlaylistStyles}> {/* Delete Playlis Modal */}
                    <div className='flex flex-row gap-5 justify-center'>
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl md:text-3xl font-bold'>Are You Sure You Want To Delete It ?</span>
                        </div>
                        <div className="buttons flex flex-row gap-2 justify-center items-center">
                            <button className='bg-black-50-opacity hover:bg-[#2176FF] transition-colors duration-300 font-bold px-4 md:px-8 h-14 rounded-3xl' onClick={deletePlaylist}>Yes</button>
                            <button className='bg-black-50-opacity hover:bg-[#2176FF] transition-colors duration-300 font-bold px-4 md:px-8 h-14 rounded-3xl' onClick={closeDeletePlaylistModal}>No</button>
                        </div> 
                    </div>
            </Modal>

            <Modal isOpen={isAddEpisodesToPlaylistModalOpen} onRequestClose={closeAddEpisodesToPlaylistModal} contentLabel="Add To Playlists Modal" style={customStyles}> {/* Add To Playlist Popup */}
                    <div className='flex flex-row'>
                        <div className='text-center w-full'>
                            <span className='text-2xl md:text-5xl font-bold'>Select Episodes To Add In</span>
                        </div>
                        <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeAddEpisodesToPlaylistModal}/>
                    </div>
                    <div className={`main flex flex-col ${(episodes && episodes.length < 3) ? 'justify-center' : ''} gap-2 my-5 p-1 md:p-2 h-48 overflow-y-auto`}>
                        {episodes && episodes.filter((episode) => !episodesToBeAddedInPlaylist?.episodes?.includes(episode.episodeId)).map((episode, index) => (
                            <div key={index} className='bg-black-50-opacity rounded-3xl flex flex-row gap-5 px-5 py-2 h-auto items-center'>
                                {checkedStates[episode.episodeId] ? <CheckBoxIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>toggleCheckbox(episode.episodeId)}/> : <CheckBoxOutlineBlankIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>toggleCheckbox(episode.episodeId)}/>}
                                <div className='flex flex-col'>
                                    <span className='font-bold text-xl'>{episode.name}</span>
                                    <span className='text-[#A7AAA7]'>S01 E{(episode.episodeNumber).toString().padStart(3, '0')}</span>
                                </div>
                            </div> 
                        ))}
                        
                    </div>

                    <div className="button flex justify-center">
                        <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 justify-center items-center hover:scale-110 transition-transform duration-300" onClick={addEpisodesToPlaylist}>
                            <AddIcon/>
                            <span>Add Episodes</span>
                        </button>
                    </div>
            </Modal> 
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
                    
                    {reviews && reviews.map((review, index) => (<SwiperSlide key={index} className="reviews-card bg-blue-5-opacity !w-[20rem] !h-96 md:!w-96 rounded-3xl p-5 flex-shrink-0 relative hover:bg-blue-10-opacity">
                        <div className="user-details flex flex-row gap-5">
                            <div className="w-28 h-28 rounded-full flex flex-shrink-0 items-center justify-center">
                                <img src={review.userProfilePic || "https://m.media-amazon.com/images/M/MV5BMmU0OWRhNmMtZGM2Ni00MGI0LTkyZDEtYWU1YjlhZjkyNDU2XkEyXkFqcGc@._V1_.jpg"} alt="profile-pic" className="w-28 h-28 rounded-full object-cover" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-3xl font-bold">{review.userDisplayName}</span>
                                <span className="text-[#A7AAA7]">@{review.userUsername}</span>
                            </div>
                        </div>
                        <div className="user-review flex flex-col gap-2 text-left mt-7">
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
                        <div className={`flex w-[90%] ${review.userId === user?.userId ? 'justify-end' : ''} absolute bottom-5`}>
                            {!(review.userId === user?.userId) && <div className="wasThisHelpful flex items-center gap-2">
                                <div className='cursor-pointer'>
                                    {review.likedByUsers.some((userId) => userId === user?.userId) ? <ThumbUpAltIcon sx={{color: "#A7AAA7"}} className="hover:scale-110 transition-transform duration-300" onClick={() => unlikeReview(review.reviewId)}/> : <ThumbUpOffAltIcon sx={{color: "#A7AAA7"}} className="hover:scale-110 transition-transform duration-300" onClick={() => likeReview(review.reviewId)}/>}
                                </div>
                                {review.likedByUsers.some((userId) => userId === user?.userId) ? <span className="text-[#A7AAA7]">Thanks !</span> : <span className="text-[#A7AAA7]">Was This Helpful ?</span>}
                            </div>}

                            {userReview?.userId === review.userId &&  <div className={`icons flex flex-row gap-2 transition-opacity duration-300 absolute right-0 bottom-0`}>
                                    <div className='flex flex-col items-end relative'>
                                        <div className={`bg-black-50-opacity rounded-3xl px-8 py-4 absolute top-[-60px] ${isEditPlaylistHover? '' : 'opacity-0'} transition-opacity duration-300`}><span className='text-nowrap'>Edit Review</span></div>
                                        <div className='bg-[#2176FF] w-10 h-10 rounded-full flex justify-center items-center hover:scale-110 transition-transform duration-300 cursor-pointer' onMouseEnter={()=>setIsEditPlaylistHover(true)} onMouseLeave={()=>setIsEditPlaylistHover(false)} onClick={() => openEditReviewModal(review)}>
                                            <EditIcon/>
                                        </div> 
                                    </div>
                                    <div className='flex flex-col items-end relative'>
                                        <div className={`bg-black-50-opacity rounded-3xl px-8 py-4 absolute top-[-60px] ${isDeletePlaylistHover? '' : 'opacity-0'} transition-opacity duration-300`}><span className='text-nowrap'>Delete Review</span></div>
                                        <div className='bg-[#2176FF] w-10 h-10 rounded-full flex justify-center items-center hover:scale-110 transition-transform duration-300 cursor-pointer' onMouseEnter={()=>setIsDeletePlaylistHover(true)} onMouseLeave={()=>setIsDeletePlaylistHover(false)} onClick={() => openDeleteReviewModal(review)}>
                                            <DeleteIcon/>
                                        </div> 
                                    </div>
                            </div>}
                        </div>
                        
                    </SwiperSlide>))}

                    {reviews && reviews.length === 0 && <div className='!h-96 flex flex-col gap-5 items-center justify-center'>
                      <span className='font-bold text-3xl md:text-5xl'>No Reviews</span>
                      <span className='text-xl'>Be the First One to Post a Review !</span>
                    </div>}

                </Swiper>

                {!reviews && <div className='!h-96 flex items-center justify-center'>
                    <Spinner/>
                </div>}
            </div>
            <div className="flex justify-center">
                {!userReview && <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300" onClick={openModal}>
                    <EditIcon/>
                    <span>Write a Review</span>
                </button>}
                {userReview && Object.keys(userReview).length > 0 && <span className='font-bold text-xl md:text-2xl mt-10 bg-[#2176FF] px-4 md:px-8 py-4 rounded-3xl'>Thank You for Reviewing Us !</span>}
            </div>
        </section>

        <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Review Modal" style={customWriteReviewModalStyles}> {/* Write a Review Popup */}
            <form action="" onSubmit={handleReviewSubmit(postReview)}>
                <div className='h-48 flex flex-col justify-between gap-2'>
                    <div className="upper flex flex-row justify-between">
                        <div className='user-details flex flex-row gap-2'>
                            <img src={user.profilePic} alt="profile-image" className='w-20 h-20 rounded-full'/>
                            <div className='flex flex-col'>
                                <span className='text-xl font-bold'>{user.displayname || user.username}</span>
                                <span className='text-[#A7AAA7]'>@{user.username}</span>
                            </div>
                        </div>

                        <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeModal}/>
                    </div>

                    <div className="main-review flex flex-col-reverse gap-1">
                        {reviewErrors.content && <p className='text-red-500 text-left px-8 font-bold text-sm'>{reviewErrors.content.message}</p>}
                        <input type="text" className={`h-14 w-full px-5 md:px-10 my-1 bg-black-50-opacity rounded-3xl border-0 outline-0 placeholder:text-[#A7AAA7] ${reviewErrors.content? 'border-[1px] border-red-500 text-red-500' : ''}`} placeholder='Write a Review' {...reviewRegister("content")}/>
                        <div className="flex flex-row">
                            {Array(5).fill(0).map((_, index) => (
                                <div key={index} onClick={() => handleStarClick(index)} className="cursor-pointer hover:scale-110 transition-transform duration-300">
                                    {index < rating ? (
                                    <StarIcon sx={{ color: "#FFE600"}} className='text-3xl md:text-4xl'/>
                                    ) : (
                                    <StarBorderIcon sx={{ color: "#FFE600"}} className='text-3xl md:text-4xl'/>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>    

                <div className='flex items-center justify-center'>
                    <button className='bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-2 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300 absolute bottom-5' type='submit'>
                        <span className=''>Post Review</span>
                        <SendIcon/>
                    </button>
                </div>
            </form>
        </Modal>

        <Modal isOpen={isEditReviewModalOpen} onRequestClose={closeEditReviewModal} contentLabel="Edit Review Modal" style={customEditModalStyles}> {/* Edit a Review Popup */}
            <form action="" onSubmit={handleReviewSubmit(editReview)}>
                <div className='h-48 flex flex-col justify-between gap-2'>
                    <div className="upper flex flex-row justify-between">
                        <div className='user-details flex flex-row gap-2'>
                            <img src={user.profilePic} alt="profile-image" className='w-20 h-20 rounded-full'/>
                            <div className='flex flex-col'>
                                <span className='text-xl font-bold'>{user.displayname || user.username}</span>
                                <span className='text-[#A7AAA7]'>@{user.username}</span>
                            </div>
                        </div>

                        <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeEditReviewModal}/>
                    </div>

                    <div className="main-review flex flex-col-reverse gap-1">
                        {reviewErrors.content && <p className='text-red-500 text-left px-8 font-bold text-sm'>{reviewErrors.content.message}</p>}
                        <input type="text" className={`h-14 w-full px-5 md:px-10 my-1 bg-black-50-opacity rounded-3xl border-0 outline-0 placeholder:text-[#A7AAA7] ${reviewErrors.content? 'border-[1px] border-red-500 text-red-500' : ''}`} placeholder='Write a Review' defaultValue={reviewToBeEdited.content} {...reviewRegister("content")}/>
                        <div className="flex flex-row">
                            {Array(5).fill(0).map((_, index) => (
                                <div key={index} onClick={() => handleStarClick(index)} className="cursor-pointer hover:scale-110 transition-transform duration-300">
                                    {index < rating ? (
                                    <StarIcon sx={{ color: "#FFE600"}} className='text-3xl md:text-4xl'/>
                                    ) : (
                                    <StarBorderIcon sx={{ color: "#FFE600"}} className='text-3xl md:text-4xl'/>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>    

                <div className='flex items-center justify-center'>
                    <button className='bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-2 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300 absolute bottom-5' type='submit'>
                        <span className=''>Save Review</span>
                        <DoneIcon/>
                    </button>
                </div>
            </form>
        </Modal>

        <Modal isOpen={isDeleteReviewModalOpen} onRequestClose={closeDeleteReviewModal} contentLabel="Delete Review Modal" style={customDeleteModalStyles}> {/* Delete Review Popup */}
                    <div className='flex flex-row gap-5 justify-center'>
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl md:text-3xl font-bold'>Are You Sure You Want To Delete It ?</span>
                        </div>
                        <div className="buttons flex flex-row gap-2 justify-center items-center">
                            <button className='bg-black-50-opacity hover:bg-[#2176FF] transition-colors duration-300 font-bold px-4 md:px-8 h-14 rounded-3xl' onClick={deleteReview}>Yes</button>
                            <button className='bg-black-50-opacity hover:bg-[#2176FF] transition-colors duration-300 font-bold px-4 md:px-8 h-14 rounded-3xl' onClick={closeDeleteReviewModal}>No</button>
                        </div> 
                    </div>
        </Modal>

        <div className='my-20 flex justify-center'>
            <Image src={"/booby.png"} width={200} height={200} alt='perman-no.2'/>
        </div>

        <Footer/>
    </>
  )
}

export default Homepage
