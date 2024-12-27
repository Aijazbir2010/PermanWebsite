"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from '../axios'
import { handleTokenExpired } from '@/utils/handleTokenExpired';
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Spinner from '@/components/Spinner';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import SendIcon from '@mui/icons-material/Send';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneIcon from '@mui/icons-material/Done';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Modal from 'react-modal';

Modal.setAppElement('#root'); // This should point to the root element of your app

const commentValidationSchema = Yup.object().shape({
    content: Yup.string()
      .min(4, "Comment must be at least 4 characters")
      .required("Comment Cannot Be Empty !"),
  });

const PlayEpisodePage = () => {

    const router = useRouter()

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
            router.push('/login')
        }
    }, [router])

    const {
        register: commentRegister,
        handleSubmit: handleCommentSubmit,
        reset: commentReset,
        formState: { errors: commentErrors },
      } = useForm({
        resolver: yupResolver(commentValidationSchema),
      });

      const {
        register: editedCommentRegister,
        handleSubmit: handleEditedCommentSubmit,
        reset: editedCommentReset,
        formState: { errors: editedCommentErrors },
      } = useForm({
        resolver: yupResolver(commentValidationSchema),
      });

    const [isEditCommentModalOpen, setisEditCommentModalOpen] = useState(false);
    const [isDeleteCommentModalOpen, setisDeleteCommentModalOpen] = useState(false);

    const [commentToBeDeleted, setCommentToBeDeleted] = useState({})
    const [commentToBeEdited, setCommentToBeEdited] = useState({})

    // Function to open the modal
  const openEditCommentModal = (comment) => {
    setCommentToBeEdited(comment)
    setisEditCommentModalOpen(true)
  };

  // Function to close the modal
  const closeEditCommentModal = () => {
    setisEditCommentModalOpen(false);
    setCommentToBeEdited({})
  };

  const openDeleteCommentModal = (comment) => {
    setCommentToBeDeleted(comment)
    setisDeleteCommentModalOpen(true);
  };

  const closeDeleteCommentModal = () => {
    setisDeleteCommentModalOpen(false)
    setCommentToBeDeleted({})
  };


  const editComment = async (data) => {
    try {
      closeEditCommentModal()
      const accessToken = localStorage.getItem('accessToken')
      const response = await axiosInstance.post(`/comments/edit?id=${commentToBeEdited.commentId}`,
        {
          content: data.content
        },
        {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      const { comments } = response.data
      setComments(comments)
      editedCommentReset()
      
      toast("Edited Comment Successfully !", {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: '#2176ff' },
      });

    } catch (err) {
      closeEditCommentModal()
      console.log('Error Editing Comment !', err)
      handleTokenExpired(err, router)

      toast("Can't Edit Comment ! Please Try Again !", {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: 'red' },
      });
    }
  }

  const deleteComment = async () => {
    try {
      closeDeleteCommentModal()
      const accessToken = localStorage.getItem('accessToken')
      const response = await axiosInstance.delete(`/comments?id=${commentToBeDeleted.commentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      const { updatedEpisode, comments, userComments } = response.data
      setEpisode(updatedEpisode)
      setComments(comments)
      setUserComments(userComments)

      toast("Deleted Comment Successfully !", {
        style: { backgroundColor: '#0a1321', color: '#ffffff' },
        progressStyle: { backgroundColor: '#2176ff' },
      });

    } catch (err) {
        closeDeleteCommentModal()
        console.log('Error Deleting Comment !', err)
        handleTokenExpired(err, router)

        toast("Can't Delete Comment ! Please Try Again !", {
          style: { backgroundColor: '#0a1321', color: '#ffffff' },
          progressStyle: { backgroundColor: 'red' },
        });
    }
  }

  useEffect(() => {
    if (isEditCommentModalOpen || isDeleteCommentModalOpen) {
      document.body.classList.add('no-scroll'); // Disable scroll
    } else {
      document.body.classList.remove('no-scroll'); // Enable scroll
    }
    return () => document.body.classList.remove('no-scroll'); // Cleanup
  }, [isEditCommentModalOpen, isDeleteCommentModalOpen]);

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

    const [episode, setEpisode] = useState(null)

    const getEpisode = async (id) => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            const response = await axiosInstance.get(`/playepisode/${id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
            })
            const episode = response.data.episode
            setEpisode(episode)
        } catch (err) {
            console.log("Error Fetching Episode !")
            handleTokenExpired(err, router)
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
            console.log("Episode Fetching Failed !")
            handleTokenExpired(err, router)
        }

    }  

    const searchParams = useSearchParams();

    useEffect(() => {
        const episodeId = searchParams.get("id")
        if (episodeId) {
            getEpisode(episodeId)   
        }
        getEpisodes()
    }, [searchParams])

    const handleEpisodeClick = (id) => {
        router.push(`/playepisode?id=${id}`)
    }


    //Modal
    const [isAddEpisodeToPlaylistsModalOpen, setIsAddEpisodeToPlaylistsModalOpen] = useState(false);

    const openAddEpisodeToPlaylistsModal = () => {
      setIsAddEpisodeToPlaylistsModalOpen(true);
    }  

    const closeAddEpisodeToPlaylistsModal = () => {
      setIsAddEpisodeToPlaylistsModalOpen(false);
    }  

    const [isRemoveEpisodeFromPlaylistsModalOpen, setIsRemoveEpisodeFromPlaylistsModalOpen] = useState(false);
  
    const openRemoveEpisodeFromPlaylistsModal = () => {
      setIsRemoveEpisodeFromPlaylistsModalOpen(true);
    }  

    const closeRemoveEpisodeFromPlaylistsModal = () => {
      setIsRemoveEpisodeFromPlaylistsModalOpen(false);
    }  

    useEffect(() => {
      if (isAddEpisodeToPlaylistsModalOpen || isRemoveEpisodeFromPlaylistsModalOpen) {
        document.body.classList.add('no-scroll'); // Disable scroll
      } else {
        document.body.classList.remove('no-scroll'); // Enable scroll
      }
      return () => document.body.classList.remove('no-scroll'); // Cleanup
    }, [isAddEpisodeToPlaylistsModalOpen, isRemoveEpisodeFromPlaylistsModalOpen]); 
  
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
            setEpisode(updatedEpisode)
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
            setEpisode(updatedEpisode)
        } catch (err) {
            console.log('Failed To Unlike Episode', err)
            handleTokenExpired(err, router)
        }
      }    

      const [comments, setComments] = useState(null)
      const [userComments, setUserComments] = useState(null)


      const getComments = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            const response = await axiosInstance.get(`/comments?id=${episode?.episodeId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            })

            const { comments, userComments } = response.data
            setComments(comments)
            setUserComments(userComments)
        } catch (err) {
            console.log('Error Fetching Comments !', err)
            handleTokenExpired(err, router)
        }
      }

      useEffect(() => {
        getComments()
      }, [episode])


      const onCommentSubmit = async (data) => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            const response = await axiosInstance.post(`/comments?id=${episode?.episodeId}`,
            {
                content: data.content,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            } 
            )
            
            const { newComment, updatedEpisode } = response.data

            setComments((prevComments) => [...prevComments, newComment])
            setEpisode(updatedEpisode)
            commentReset()

            toast("Comment Posted Successfully !", {
              style: { backgroundColor: '#0a1321', color: '#ffffff' },
              progressStyle: { backgroundColor: '#2176ff' },
            });
        } catch (err) {
            console.log('Error Posting Comment !', err)
            handleTokenExpired(err, router)

            toast("Can't Post Comment ! Please Try Again !", {
              style: { backgroundColor: '#0a1321', color: '#ffffff' },
              progressStyle: { backgroundColor: 'red' },
            });
        }
      }

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

    const [checkedPlaylistsState, setCheckedPlaylistsState] = useState({});

    useEffect(() => {
        if (playlists && playlists?.length > 0) {
            const initialState = playlists.reduce((acc, playlist) => {
            acc[playlist.playlistId] = false;
            return acc;
            }, {});
            setCheckedPlaylistsState(initialState); // Update state when playlists are available
        }
    }, [playlists]); // Run effect when playlists change
  

    const togglePlaylistsCheckbox = (playlistId) => {
        setCheckedPlaylistsState((prevStates) => ({
        ...prevStates,
        [playlistId]: !prevStates[playlistId],
        }));
    };

    const addEpisodeToPlaylists = async () => {
        try {
          const accessToken = localStorage.getItem('accessToken')
          const addToPlaylists = Object.keys(checkedPlaylistsState).filter((key) => checkedPlaylistsState[key] === true)
    
          if (addToPlaylists.length === 0) {
            console.log("No Playlists Selected !")
            closeAddEpisodeToPlaylistsModal()

            toast("No Playlists Selected To Add In !", {
              style: { backgroundColor: '#0a1321', color: '#ffffff' },
              progressStyle: { backgroundColor: 'red' },
            });
            
            return
          }
    
          const response = await axiosInstance.post(`/playlists/addepisodetoplaylists?id=${episode?.episodeId}`,
            {
              addToPlaylists,
            },
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            },
          )
    
          const { updatedPlaylists } = response.data
          setPlaylists(updatedPlaylists)
          closeAddEpisodeToPlaylistsModal()

          toast("Added Episode Successfully !", {
            style: { backgroundColor: '#0a1321', color: '#ffffff' },
            progressStyle: { backgroundColor: '#2176ff' },
          });

        } catch (err) {
          closeAddEpisodeToPlaylistsModal()
          console.log("Can't Add Episode To Playlists !", err)
          handleTokenExpired(err, router)

          toast("Can't Add Episode To Playlists ! Please Try Again !", {
            style: { backgroundColor: '#0a1321', color: '#ffffff' },
            progressStyle: { backgroundColor: 'red' },
          });
        }
      }
    
      const removeEpisodeFromPlaylists = async () => {
        try {
          const accessToken = localStorage.getItem('accessToken')
          const removeFromPlaylists = Object.keys(checkedPlaylistsState).filter((key) => checkedPlaylistsState[key] === true)
    
          if (removeFromPlaylists.length === 0) {
            console.log("No Playlists Selected !")
            closeRemoveEpisodeFromPlaylistsModal()

            toast("No Playlists Selected To Remove From !", {
              style: { backgroundColor: '#0a1321', color: '#ffffff' },
              progressStyle: { backgroundColor: 'red' },
            });

            return
          }
    
          const response = await axiosInstance.post(`/playlists/removeepisodefromplaylists?id=${episode?.episodeId}`,
            {
              removeFromPlaylists,
            },
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            },
          )
    
          const { updatedPlaylists } = response.data
          setPlaylists(updatedPlaylists)
          closeRemoveEpisodeFromPlaylistsModal()

          toast("Removed Episode Successfully !", {
            style: { backgroundColor: '#0a1321', color: '#ffffff' },
            progressStyle: { backgroundColor: '#2176ff' },
          });

        } catch (err) {
          closeRemoveEpisodeFromPlaylistsModal()
          console.log("Can't Add Episode To Playlists !", err)
          handleTokenExpired(err, router)

          toast("Can't Remove Episode From Playlists ! Please Try Again !", {
            style: { backgroundColor: '#0a1321', color: '#ffffff' },
            progressStyle: { backgroundColor: 'red' },
          });

        }
      }

  return (
    <>
        <ToastContainer theme='colored' autoClose={3000}/>

        <Navbar/>

        <div className='flex my-10 mx-3 md:mx-10 justify-center items-center relative'>
            <ArrowBackIcon className='text-2xl md:text-5xl cursor-pointer hover:scale-110 transition-transform duration-300 absolute left-0' onClick={()=>window.history.back()}/>
            <Image src={"/perman-badge.png"} width={100} height={100} alt='perman-badge' className='w-20 h-28 md:w-[100px] md:h-[150px]'/>
        </div>

        {!episode && <div className='h-96 flex justify-center items-center'><Spinner/></div>}

        {episode && <div className="iframe mx-3 md:mx-10 flex h-[20rem] lg:h-[40rem] rounded-3xl">
            <iframe src={episode.episodeDriveLink} width={500} height={500} allowFullScreen className='w-full h-full rounded-3xl'></iframe>
        </div>}

        {episode && <div className='flex flex-col gap-5 mt-5 md:mt-10 mb-10 mx-3 md:mx-10'>
            <span className='font-bold text-2xl md:text-3xl'>{episode.name} • S01 E{(episode.episodeNumber)?.toString().padStart(3, '0')}</span>

            <div className='likes-add-remove-playlist flex flex-row gap-3'>
                <div className="likes flex flex-row justify-center gap-1">
                    {(user?.likedEpisodes || []).includes(episode.episodeId) ? <FavoriteIcon className='text-[#FF0066] hover:scale-110 transition-transform duration-300 cursor-pointer' onClick={()=>handleUnlike(episode.episodeId)}/> : <FavoriteBorderIcon className='hover:text-[#FF0066] hover:scale-110 transition-all duration-300 cursor-pointer' onClick={()=>handleLike(episode.episodeId)}/>}
                    <span className='font-bold md:text-lg'>{episode.likes} Likes</span>
                </div>
                <div className="add-to-playlist flex flex-row justify-center gap-1" onClick={openAddEpisodeToPlaylistsModal}>
                    <AddIcon className='hover:scale-110 hover:text-[#2176FF] transition-all duration-300 cursor-pointer'/>
                    <span className='font-bold md:text-lg hover:text-[#2176FF] transition-colors duration-300 cursor-pointer'>Add To Playlist</span>
                </div>
                {playlists && playlists.filter((playlist) => playlist.episodes.includes(episode.episodeId)).length > 0 && <div className="remove-from-playlist flex flex-row justify-center gap-1" onClick={() => openRemoveEpisodeFromPlaylistsModal(episode)}>
                    <DeleteIcon className='hover:scale-110 hover:text-[#2176FF] transition-all duration-300 cursor-pointer'/>
                    <span className='font-bold md:text-lg hover:text-[#2176FF] transition-all duration-300 cursor-pointer'>Remove From Playlist</span>
                </div>}
            </div>
        
            {playlists && playlists.filter((playlist) => playlist.episodes.includes(episode.episodeId)).length > 0 && <div className='added-to-playlist-div relative'>
                <CheckCircleIcon sx={{color: "#2176FF"}} className='hover:scale-110 transition-transform duration-300 cursor-pointer peer'/>
                <div className={`addedToPlaylistsDropdown flex flex-col gap-2 bg-black-90-opacity text-center p-5 max-h-32 transition-opacity duration-300 overflow-y-auto rounded-3xl absolute left-0 -top-[5px] translate-y-[-100%] opacity-0 pointer-events-none peer-hover:opacity-100 peer-hover:pointer-events-auto`}>
                  {playlists.filter((playlist) => playlist.episodes.includes(episode.episodeId)).map((playlist, index) => (<span key={index} className='text-nowrap'>Added To {playlist.name}</span>))}
                </div>
            </div>}
        </div>}

        {episode && <Modal isOpen={isAddEpisodeToPlaylistsModalOpen} onRequestClose={closeAddEpisodeToPlaylistsModal} contentLabel="Add Episode To Playlists Modal" style={customStyles}> {/* Add Episode To Playlists Popup */}
                <div className='flex flex-row'>
                    <div className='text-center w-full'>
                        <span className='text-2xl md:text-5xl font-bold'>Select Playlists To Add In</span>
                    </div>
                    <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeAddEpisodeToPlaylistsModal}/>
                </div>
                <div className={`main flex flex-col ${(playlists && playlists.length < 3) ? 'justify-center' : ''} gap-2 my-5 p-1 md:p-2 h-48 overflow-y-auto`}>
                    {playlists && playlists.filter((playlist) => !playlist.episodes.includes(episode?.episodeId)).map((playlist, index) => (
                        <div key={index} className='bg-black-50-opacity rounded-3xl flex flex-row gap-5 px-5 py-2 h-auto items-center'>
                            {checkedPlaylistsState[playlist.playlistId]? <CheckBoxIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => togglePlaylistsCheckbox(playlist.playlistId)}/> : <CheckBoxOutlineBlankIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => togglePlaylistsCheckbox(playlist.playlistId)}/>}
                            <div className='flex flex-col'>
                                <span className='font-bold text-xl'>{playlist.name}</span>
                                <span className='text-[#A7AAA7]'>Episodes: {playlist.episodes.length}</span>
                            </div>
                        </div> 
                    ))}

                    {playlists && playlists.filter((playlist) => !playlist.episodes.includes(episode?.episodeId)).length === 0 && <div className='h-full flex justify-center items-center'>
                          <span className='font-bold text-3xl'>No Playlists !</span>
                    </div>}

                    {!playlists && (<div className='flex justify-center items-center'><Spinner/></div>)}
                   
                </div>

                <div className="buttons flex justify-center">
                    <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 justify-center items-center hover:scale-110 transition-transform duration-300" onClick={addEpisodeToPlaylists}>
                        <AddIcon/>
                        <span>Add Episode</span>
                    </button>
                </div>
        </Modal>}    

        {episode && <Modal isOpen={isRemoveEpisodeFromPlaylistsModalOpen} onRequestClose={closeRemoveEpisodeFromPlaylistsModal} contentLabel="Remove Episode From Playlists Modal" style={customStyles}> {/* Remove Episode From Playlists Popup */}
                <div className='flex flex-row'>
                    <div className='text-center w-full'>
                        <span className='text-2xl md:text-5xl font-bold'>Select Playlists To Remove From</span>
                    </div>
                    <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeRemoveEpisodeFromPlaylistsModal}/>
                </div>
                <div className={`main flex flex-col ${(playlists && playlists.length < 3)? 'justify-center' : ''} gap-2 my-5 p-1 md:p-2 h-48 overflow-y-auto`}>
                    {playlists && playlists.filter((playlist) => playlist.episodes.includes(episode?.episodeId)).map((playlist, index) => (
                        <div key={index} className='bg-black-50-opacity rounded-3xl flex flex-row gap-5 px-5 py-2 h-auto items-center'>
                            {checkedPlaylistsState[playlist.playlistId]? <CheckBoxIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => togglePlaylistsCheckbox(playlist.playlistId)}/> : <CheckBoxOutlineBlankIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => togglePlaylistsCheckbox(playlist.playlistId)}/>}
                            <div className='flex flex-col'>
                                <span className='font-bold text-xl'>{playlist.name}</span>
                                <span className='text-[#A7AAA7]'>Episodes: {playlist.episodes.length}</span>
                            </div>
                        </div> 
                    ))}
                    
                    {!playlists && (<div className='flex justify-center items-center'><Spinner/></div>)}

                </div>

                <div className="buttons flex justify-center">
                    <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 justify-center items-center hover:scale-110 transition-transform duration-300" onClick={removeEpisodeFromPlaylists}>
                        <DeleteIcon/>
                        <span>Remove Episode</span>
                    </button>
                </div>
        </Modal>}

        {episode && <div className='flex mx-3 md:mx-10 h-[1px] bg-white mb-20'></div>}

        {episode && <div className='comments-episodes flex flex-col lg:flex-row items-center gap-10 lg:gap-0 lg:justify-between mx-3 md:mx-10 mb-20'>
            <div className='comments bg-blue-5-opacity w-full lg:w-[48%] rounded-3xl p-5 md:p-10 h-[45rem]'>
                <span className='text-3xl font-bold'>Comments {episode.comments}</span>

                <div className="main my-5">
                    <ul className='flex flex-col gap-10 h-[32rem] overflow-y-auto'>

                        {comments && comments.map((comment, index) => (<li key={index} className='flex flex-row gap-2 p-2 w-[99%] rounded-3xl'>
                            <img src={comment.userProfilePic} alt="profile-pic" className='w-20 h-20 flex-shrink-0 rounded-full'/>
                            <div className='flex flex-col gap-3 w-full'>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-xl md:text-2xl'>{comment.userDisplayName}</span>
                                    <span className='text-[#A7AAA7]'>@{comment.userUsername}</span>
                                </div>
                                <div className='flex flex-col gap-1'>
                                  {comment.editedCount > 0 && <span className='text-[#2176FF]'>{"(Edited)"}</span>} 
                                  <span className='w-[99%]'>{comment.content}</span>
                                </div>
                                
                            </div>
                            {userComments && userComments.some((userComment) => userComment.commentId === comment.commentId) && <div className='relative'>
                                <button className='outline-none border-none hover:text-[#2176FF] transition-colors duration-300 cursor-pointer peer'>
                                  <MoreVertIcon/>  
                                </button>
                                <div className={`bg-black-50-opacity hidden flex-col rounded-3xl justify-center gap-2 h-20 w-48 absolute right-0 bottom-[-30px] peer-focus:flex`}>
                                    <span className='font-bold cursor-pointer hover:text-[#2176FF] transition-colors duration-300 text-center' onMouseDown={() => openEditCommentModal(comment)}>Edit Comment</span>
                                    <span className='font-bold cursor-pointer hover:text-[#2176FF] transition-colors duration-300 text-center' onMouseDown={() => openDeleteCommentModal(comment)}>Delete Comment</span>
                                </div>  
                            </div>}
                            
                        </li>))}

                        
                        {comments && comments.length === 0 && <li className='h-full text-3xl md:text-5xl font-bold flex justify-center items-center'>
                            <span>No Comments !</span>
                        </li>}

                        {!comments && <li className='h-full flex justify-center items-center'><Spinner/></li>}
                    </ul>
                </div>

                <form action="" onSubmit={handleCommentSubmit(onCommentSubmit)}>          
                    <div className='flex flex-row gap-3'>
                        <input type="text" className={`h-14 rounded-3xl bg-black-50-opacity w-full px-4 md:px-8 outline-0 border-0 placeholder:text-[#A7AAA7] ${commentErrors.content? 'border-[1px] border-red-500 text-red-500' : ''}`} placeholder='Type a Comment' {...commentRegister("content")}/>
                        <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-2 items-center hover:scale-110 transition-transform duration-300" type='submit'>
                            <span>Post</span>
                            <SendIcon/>
                        </button>
                    </div>
                </form>
                {commentErrors.content && <p className='text-red-500 text-left px-8 font-bold text-sm mt-1'>{commentErrors.content.message}</p>}  
            </div>

            <Modal isOpen={isEditCommentModalOpen} onRequestClose={closeEditCommentModal} contentLabel="Edit Comment Modal" style={customEditModalStyles}> {/* Edit Comment Modal */}
                    <div className='flex flex-row'>
                        <div className='text-center w-full'>
                            <span className='text-2xl md:text-5xl font-bold'>Edit Comment</span>
                        </div>
                        <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeEditCommentModal}/>
                    </div>
                    
                    <form action="" onSubmit={handleEditedCommentSubmit(editComment)}>
                        <div className="input mt-10 flex">
                            <textarea type="text" className={`bg-black-50-opacity rounded-3xl border-0 outline-0 h-40 px-4 md:px-8 w-full py-5 resize-none overflow-hidden placeholder:text-[#A7AAA7] ${editedCommentErrors.content? 'border-[1px] border-red-500 text-red-500' : ''}`} defaultValue={commentToBeEdited?.content || 'Edit Comment !'} placeholder={commentToBeEdited?.content || 'Edit Comment !'} {...editedCommentRegister("content")}></textarea>
                        </div>
                        {editedCommentErrors.content && <p className='text-red-500 text-left px-8 font-bold text-sm mt-1'>{editedCommentErrors.content.message}</p>}
                        <div className='flex justify-center'>
                            <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-10 hover:scale-110 transition-transform duration-300" type='submit'>
                                <DoneIcon/>
                                <span>Save Comment</span>
                            </button>
                        </div>
                    </form>
            </Modal>

            <Modal isOpen={isDeleteCommentModalOpen} onRequestClose={closeDeleteCommentModal} contentLabel="Delete Comment Modal" style={customDeleteModalStyles}> {/* Delete Comment Modal */}
                    <div className='flex flex-row gap-5 justify-center'>
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl md:text-3xl font-bold'>Are You Sure You Want To Delete It ?</span>
                        </div>
                        <div className="buttons flex flex-row gap-2 justify-center items-center">
                            <button className='bg-black-50-opacity hover:bg-[#2176FF] transition-colors duration-300 font-bold px-4 md:px-8 h-14 rounded-3xl' onClick={deleteComment}>Yes</button>
                            <button className='bg-black-50-opacity hover:bg-[#2176FF] transition-colors duration-300 font-bold px-4 md:px-8 h-14 rounded-3xl' onClick={closeDeleteCommentModal}>No</button>
                        </div> 
                    </div>
            </Modal>

            <div className="episodes bg-blue-5-opacity w-full lg:w-[48%] rounded-3xl p-5 md:p-10 h-[45rem]">
                <div className='flex flex-row justify-between items-center'>
                    <span className='text-3xl font-bold'>Episodes</span>
                    <Link href={"/episodes"}>
                        <button className="bg-[#2176FF] h-14 px-2 md:px-4 rounded-3xl font-bold flex flex-row gap-2 items-center hover:scale-110 transition-transform duration-300">
                            <SubdirectoryArrowRightIcon/>
                            <span>Episodes Page</span>
                        </button>
                    </Link>
                        
                </div>

                <ul className='flex flex-col gap-10 h-[37rem] my-5 overflow-y-auto'>

                    {episodes ? episodes.map((episode, index) => (<li key={index} className='flex flex-row gap-3 md:gap-5 bg-black-50-opacity rounded-3xl p-2 w-[99%] hover:bg-black-70-opacity cursor-pointer transition-colors duration-300'  onClick={()=>handleEpisodeClick(episode.episodeId)}>
                        <img src="/episode-thumbnail.jpg" alt="episode-thumbnail" className='w-32 h-20 md:w-40 md:h-24 rounded-3xl flex-shrink-0'/>
                        <div className='flex flex-col'>
                            <span className='font-bold text-xl md:text-2xl hover:text-[#2176FF] transition-colors duration-300 cursor-pointer'>{episode.name}</span>
                            <span className='text-[#A7AAA7]'>S01 E{(episode.episodeNumber).toString().padStart(3, '0')} • {episode.duration}</span>
                        </div>
                    </li>)) : (<li className='h-full flex justify-center items-center'><Spinner/></li>)}     

                </ul>                
            </div>
        </div>}

        <Footer/>
    </>
  )
}

export default PlayEpisodePage
