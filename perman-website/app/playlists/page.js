"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleTokenExpired } from '@/utils/handleTokenExpired';
import axiosInstance from '../axios';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Spinner from '@/components/Spinner';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Modal from 'react-modal';

Modal.setAppElement('#root'); // This should point to the root element of your app

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

const Playlists = () => {

  const router = useRouter() 

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
    formState: { errors: editPlaylistErrors },
  } = useForm({
    resolver: yupResolver(playlistValidationSchema)
  })
  
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

const [likedEpisodesLength, setLikedEpisodesLength] = useState(0)

const getLikedEpisodesLength = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.get('/episodes/likedepisodes/length', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        const { length } = response.data
        setLikedEpisodesLength(length)
    } catch (err) {
        console.log("Can't Get Length Of Liked Episodes !", err)
        handleTokenExpired(err, router)
    }
}

useEffect(() => {
    if (user) {
        getLikedEpisodesLength()
    }
}, [user])

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

  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isEditPlaylistModalOpen, setIsEditPlaylistModalOpen] = useState(false);
  const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] = useState(false);
  
  // Function to open the modal
  const openCreatePlaylistModal = () => setIsCreatePlaylistModalOpen(true);

  // Function to close the modal
  const closeCreatePlaylistModal = () => setIsCreatePlaylistModalOpen(false);

  
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
    if (isAddEpisodesToPlaylistModalOpen || isCreatePlaylistModalOpen || isEditPlaylistModalOpen || isDeletePlaylistModalOpen) {
      document.body.classList.add('no-scroll'); // Disable scroll
    } else {
      document.body.classList.remove('no-scroll'); // Enable scroll
    }
    return () => document.body.classList.remove('no-scroll'); // Cleanup
  }, [isAddEpisodesToPlaylistModalOpen, isCreatePlaylistModalOpen, isEditPlaylistModalOpen, isDeletePlaylistModalOpen]);

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

  const createPlaylist = async (data) => {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const response = await axiosInstance.post('/playlists',
            {
                name: data.name,
                description: data.description,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            },
        )

        const { newPlaylist } = response.data
        setPlaylists((prevPlaylists) => [...prevPlaylists, newPlaylist])
        createPlaylistReset()
        closeCreatePlaylistModal()

        toast("Playlist Created Successfully !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        });

    } catch (err) {
        closeCreatePlaylistModal()
        createPlaylistReset()
        console.log("Can't Create Playlist !", err)
        handleTokenExpired(err, router)

        toast("Can't Create Playlist ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });
    }
  }

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
        
        closeEditPlaylistModal()

        toast("Edited Playlist Successfully !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        });

    } catch (err) {
        closeEditPlaylistModal()
        console.log("Can't Edit Playlist !", err)
        handleTokenExpired(err, router)

        toast("Can't Edit Playlist ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });
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

        toast("Deleted Playlist Successfully !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: '#2176ff' },
        });
    } catch (err) {
        closeDeletePlaylistModal()
        console.log("Can't Delete Playlist !", err)
        handleTokenExpired(err, router)

        toast("Can't Delete Playlist ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });
    }
  }

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
        console.log("Episode Fetching Failed !", err.response.data.message)
        handleTokenExpired(err, router)
        
    }

  }  

  useEffect(() => {
    getEpisodes()
  }, [])
  
  const [checkedStates, setCheckedStates] = useState({}); // Initialize empty state

    useEffect(() => {
    if (episodes && episodes?.length > 0) {
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

      if (episodesToAdd.length === 0) {
        console.log("No Episodes Selected !")
        closeAddEpisodesToPlaylistModal()

        toast("No Episodes Selected To Add In !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });

        return
      }

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

      toast("Episodes Added Successfully !", {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: '#2176ff' },
      });

    } catch (err) {
      closeAddEpisodesToPlaylistModal()
      console.log("Can't Add Episodes !", err)
      handleTokenExpired(err, router)

      toast("Can't Add Episodes ! Please Try Again !", {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: 'red' },
      });
    }
  }

  return (
    
    <>
        <ToastContainer theme='colored' autoClose={3000}/>

        <Navbar/>

        <div className="main mx-3 md:mx-10 mt-10 mb-10">
            <div className="yourPlaylists">
                <div className='flex flex-row justify-center items-center gap-5 mb-5'>
                    <span className="text-2xl md:text-5xl font-bold">Your Playlists</span>
                    <Image src={"/booby.png"} width={150} height={150} alt='perman-no.2' className='w-32 h-32 md:w-[150px] md:h-[150px]'/>
                </div>

                <span className='font-bold text-2xl'>Playlists: {playlists ? playlists.length : 0}</span>

                {/* On Mobile */}
                <ul className="my-10 flex flex-col items-center gap-10 max-h-[950px] overflow-y-auto overflow-x-hidden md:hidden">

                    {playlists && playlists.map((playlist, index) => (<li key={index} className='playlist-page-card bg-blue-5-opacity !w-[20rem] !h-96 md:!w-96 rounded-3xl p-5 hover:cursor-pointer flex-shrink-0 hover:bg-blue-10-opacity relative transition-colors duration-300'>
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
                    </li>))}

                    {playlists && playlists.length === 0 && <li className='h-80 flex items-center justify-center'>
                            <span className='font-bold text-3xl'>No Playlists !</span>
                    </li>}

                    {!playlists && <li className='!h-96 flex justify-center items-center'><Spinner/></li>}

                </ul>

                {/* On Tab and Desktop */}
                <div className="playlists-container text-center mt-10 hidden md:block">
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

                      {!playlists && <div className='!h-96 flex justify-center items-center'><Spinner/></div>}

                    </Swiper>
                </div>

                <div className='flex justify-center'>
                    <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300" onClick={openCreatePlaylistModal}>
                        <AddIcon/>
                        <span>Create Playlist</span>
                    </button>
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
                        {episodes ? episodes.filter((episode) => !episodesToBeAddedInPlaylist?.episodes?.includes(episode.episodeId)).map((episode, index) => (
                            <div key={index} className='bg-black-50-opacity rounded-3xl flex flex-row gap-5 px-5 py-2 h-auto items-center'>
                                {checkedStates[episode.episodeId] ? <CheckBoxIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>toggleCheckbox(episode.episodeId)}/> : <CheckBoxOutlineBlankIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>toggleCheckbox(episode.episodeId)}/>}
                                <div className='flex flex-col'>
                                    <span className='font-bold text-xl'>{episode.name}</span>
                                    <span className='text-[#A7AAA7]'>S01 E{(episode.episodeNumber).toString().padStart(3, '0')}</span>
                                </div>
                            </div> 
                        )) : (<div className='flex justify-center items-center'><Spinner/></div>)}
                        
                    </div>

                    <div className="button flex justify-center">
                        <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 justify-center items-center hover:scale-110 transition-transform duration-300" onClick={addEpisodesToPlaylist}>
                            <AddIcon/>
                            <span>Add Episodes</span>
                        </button>
                    </div>
                </Modal>         

                <Modal isOpen={isCreatePlaylistModalOpen} onRequestClose={closeCreatePlaylistModal} contentLabel="New Playlist Modal" style={customCreateAndEditPlaylistModalStyles}> {/* Create New Playlist Modal */}
                    <div className='flex flex-row'>
                        <div className='text-center w-full'>
                            <span className='text-2xl md:text-5xl font-bold'>New Playlist</span>
                        </div>
                        <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeCreatePlaylistModal}/>
                    </div>
                    
                    <form action="" onSubmit={handleCreatePlaylistSubmit(createPlaylist)}>
                        <div className={`inputs mt-10 flex flex-col ${createPlaylistErrors.name || createPlaylistErrors.description ? 'gap-2' : 'gap-5'}`}>
                            <input type="text" className={`bg-black-50-opacity rounded-3xl border-0 outline-0 px-4 md:px-8 h-14 w-full placeholder:text-[#A7AAA7] ${createPlaylistErrors.name ? 'border-[1px] border-red-500 text-red-500' : ''}`} placeholder='Playlist Name' {...createPlaylistRegister("name")}/>
                            {createPlaylistErrors.name && <p className='text-red-500 text-left px-8 font-bold text-xs'>{createPlaylistErrors.name.message}</p>}

                            <textarea type="text" className={`bg-black-50-opacity rounded-3xl border-0 outline-0 h-40 px-4 md:px-8 w-full py-5 resize-none overflow-hidden placeholder:text-[#A7AAA7] ${createPlaylistErrors.description ? 'border-[1px] border-red-500 text-red-500' : ''}`} placeholder='Playlist Description' {...createPlaylistRegister("description")}></textarea>
                            {createPlaylistErrors.description && <p className='text-red-500 text-left px-8 font-bold text-xs'>{createPlaylistErrors.description.message}</p>}
                        </div>
                        <div className='flex justify-center'>
                            <button className={`bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center ${createPlaylistErrors.name || createPlaylistErrors.description ? 'mt-1' : 'mt-10'} hover:scale-110 transition-transform duration-300`} type='submit'>
                                <AddIcon/>
                                <span>Create Playlist</span>
                            </button>
                        </div>
                    </form>
                </Modal>

            </div>

            <div className="likedEpisodes">
                <div className='flex flex-row justify-center items-center gap-5 mt-10 mb-5'>
                    <span className="text-2xl md:text-5xl font-bold">Liked Episodes</span>
                    <Image src={"/sumire.png"} width={100} height={100} alt='perman-no.3'/>
                </div>

                <div className='flex items-center justify-center mt-10 mb-20'>
                    <div className="playlist-page-card bg-blue-5-opacity !w-[20rem] !h-96 md:!w-96 rounded-3xl p-5 hover:cursor-pointer hover:bg-blue-10-opacity relative">
                        <div className='flex flex-row justify-between w-full h-44'>
                            <div className='text-left w-3/4'>
                                <span className='text-3xl font-bold'>Liked Episodes</span>
                            </div>
                            <Link href={"/likedepisodes"}>
                                <div className="playbutton-playlist bg-[#2176FF] w-16 h-16 rounded-full flex items-center justify-center">
                                    <PlayArrowIcon sx={{fontSize: "40px"}}/>                    
                                </div> 
                            </Link>
                        </div>

                        <div className='w-full h-[1px] bg-white'></div>

                        <div className='text-left mt-2'>
                            <span className='text-xs text-[#A7AAA7] font-bold'>All The Episodes Which You've Liked Are In This Playlist</span>
                        </div>

                        <div className='text-left absolute bottom-5'>
                            <span className='font-bold'>Episodes: {likedEpisodesLength}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Footer/>
    </>
  );
}

export default Playlists;
