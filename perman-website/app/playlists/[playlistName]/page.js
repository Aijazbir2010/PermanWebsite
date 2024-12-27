"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axiosInstance from '@/app/axios'
import { handleTokenExpired } from '@/utils/handleTokenExpired'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Spinner from '@/components/Spinner'

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TextsmsIcon from '@mui/icons-material/Textsms';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Modal from 'react-modal';


Modal.setAppElement('#root'); // This should point to the root element of your app

const OpenedPlaylist = () => {

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const id = searchParams.get("id")
        if (id === null) {
            router.push('/404')
        }
    }, [])  

    const [episodeToAddInPlaylists, setEpisodeToAddInPlaylists] = useState({})
    const [episodeToRemoveFromPlaylists, setEpisodeToRemoveFromPlaylists] = useState({})

    //Modal
  
    const [isAddEpisodeToPlaylistsModalOpen, setIsAddEpisodeToPlaylistsModalOpen] = useState(false)

    const openAddEpisodeToPlaylistsModal = (episode) => {
      setEpisodeToAddInPlaylists(episode)
      setIsAddEpisodeToPlaylistsModalOpen(true);
    }
  
    const closeAddEpisodeToPlaylistsModal = () => {
      setIsAddEpisodeToPlaylistsModalOpen(false);
      setEpisodeToAddInPlaylists({})
    }


    const [isRemoveEpisodeFromPlaylistsModalOpen, setIsRemoveEpisodeFromPlaylistsModalOpen] = useState(false);
  
    const openRemoveEpisodeFromPlaylistsModal = (episode) => {
      setEpisodeToRemoveFromPlaylists(episode)
      setIsRemoveEpisodeFromPlaylistsModalOpen(true);
    }
  
    const closeRemoveEpisodeFromPlaylistsModal = () => {
      setIsRemoveEpisodeFromPlaylistsModalOpen(false);
      setEpisodeToRemoveFromPlaylists({})
    }
  

    const [isAddEpisodesToPlaylistModalOpen, setisAddEpisodesToPlaylistModalOpen] = useState(false);

    const openAddEpisodesToPlaylistModal = () => {
        setisAddEpisodesToPlaylistModalOpen(true);
    }  

    const closeAddEpisodesToPlaylistModal = () => {
        setisAddEpisodesToPlaylistModalOpen(false);
    }  

    useEffect(() => {
      if (isAddEpisodesToPlaylistModalOpen || isAddEpisodeToPlaylistsModalOpen || isRemoveEpisodeFromPlaylistsModalOpen) {
        document.body.classList.add('no-scroll'); // Disable scroll
      } else {
        document.body.classList.remove('no-scroll'); // Enable scroll
      }
      return () => document.body.classList.remove('no-scroll'); // Cleanup
    }, [isAddEpisodesToPlaylistModalOpen, isAddEpisodeToPlaylistsModalOpen, isRemoveEpisodeFromPlaylistsModalOpen]); 
  
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

    const [playlist, setPlaylist] = useState(null)
    const [playlistEpisodes, setPlaylistEpisodes] = useState(null)

    const getPlaylist = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            const response = await axiosInstance.get(`/playlists/playlist?id=${searchParams.get('id')}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            const { playlist, playlistEpisodes } = response.data
            setPlaylist(playlist)
            setPlaylistEpisodes(playlistEpisodes)
            console.log(playlist, playlistEpisodes)
        } catch (err) {
            if(err.response.data.message === "Not Found Playlist!") {
                router.push('/404')
            }
            console.log("Can't Get Playlist !", err)
            handleTokenExpired(err, router)
        }
    }

    useEffect(() => {
        getPlaylist()
    }, [])

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

    const [checkedEpisodesState, setCheckedEpisodesState] = useState({}); // Initialize empty state
    const [checkedPlaylistsState, setCheckedPlaylistsState] = useState({});

    useEffect(() => {
    if (episodes && episodes?.length > 0) {
        const initialState = episodes.reduce((acc, episode) => {
        acc[episode.episodeId] = false;
        return acc;
        }, {});
        setCheckedEpisodesState(initialState); // Update state when episodes are available
    }
    }, [episodes]); // Run effect when episodes change

    useEffect(() => {
      if (playlists && playlists?.length > 0) {
          const initialState = playlists.reduce((acc, playlist) => {
          acc[playlist.playlistId] = false;
          return acc;
          }, {});
          setCheckedPlaylistsState(initialState); // Update state when playlists are available
      }
    }, [playlists]); // Run effect when playlists change

  const toggleEpisodesCheckbox = (episodeId) => {
    setCheckedEpisodesState((prevStates) => ({
    ...prevStates,
    [episodeId]: !prevStates[episodeId],
    }));
  };

  const togglePlaylistsCheckbox = (playlistId) => {
    setCheckedPlaylistsState((prevStates) => ({
    ...prevStates,
    [playlistId]: !prevStates[playlistId],
    }));
  };

  //Add Episodes to Playlist Which is Currently Opened !
  const addEpisodesToPlaylist = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const episodesToAdd = Object.keys(checkedEpisodesState).filter((key) => checkedEpisodesState[key] === true)

      if (episodesToAdd.length === 0) {
        console.log("No Episodes Selected !")
        closeAddEpisodesToPlaylistModal()

        toast("No Episodes Selected To Add In !", {
                  style: { backgroundColor: '#0a1321', color: '#ffffff' },
                  progressStyle: { backgroundColor: 'red' },
        });

        return
      }

      const response = await axiosInstance.post(`/playlists/addepisodes?id=${playlist?.playlistId}`, 
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
      setPlaylist(updatedPlaylist)
      closeAddEpisodesToPlaylistModal()
      getPlaylist()
      getPlaylists()

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

      const response = await axiosInstance.post(`/playlists/addepisodetoplaylists?id=${episodeToAddInPlaylists?.episodeId}`,
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

      const response = await axiosInstance.post(`/playlists/removeepisodefromplaylists?id=${episodeToRemoveFromPlaylists?.episodeId}`,
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
      getPlaylist()

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
            setPlaylistEpisodes(prevEpisodes => prevEpisodes.map(episode => episode.episodeId === episodeId ? {...episode, likes: updatedEpisode.likes} : episode))
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
            setPlaylistEpisodes(prevEpisodes => prevEpisodes.map(episode => episode.episodeId === episodeId ? {...episode, likes: updatedEpisode.likes} : episode))
        } catch (err) {
            console.log('Failed To Unlike Episode', err)
            handleTokenExpired(err, router)
        }
      }

    
  return (
    <>
        <ToastContainer theme='colored' autoClose={3000}/>

        <Navbar/>

        {playlist ? (<div className="main mx-3 md:mx-10 mt-10 mb-20">
            <div className='flex flex-row justify-center items-center gap-2 md:gap-5 mb-5 relative'>
                <div className='flex items-center' onClick={() => window.history.back()}>
                    <ArrowBackIcon className='text-2xl md:text-5xl cursor-pointer hover:scale-110 transition-transform duration-300 absolute left-0'/>
                </div>
                
                <div className='flex flex-col gap-2 text-center w-56 md:w-fit'>
                    <span className="text-2xl md:text-5xl font-bold">{playlist.name}</span>
                    <span className='text-[#A7AAA7] text-xs md:text-base'>{playlist.description}</span>
                </div>
                <Image src={"/perman-one.png"} width={100} height={100} alt='perman-no.1' className='w-20 h-28 md:w-[100px] md:h-[150px]'/>
            </div>

            <span className='font-bold text-2xl'>Episodes: {playlist ? playlist.episodes.length : 0}</span>

            <ul className="mt-10 flex flex-col gap-10 max-h-[950px] overflow-y-auto">

                {playlistEpisodes && playlistEpisodes.map((episode, index) => (<li key={index} className='bg-blue-5-opacity w-[99%] h-72 lg:h-60 p-5 rounded-3xl flex flex-col gap-5 hover:bg-blue-10-opacity cursor-pointer transition-colors duration-300'>
                    <div className='flex flex-row gap-5'>
                        <Image src={"/episode-thumbnail.jpg"} alt={"episode-thumbnail"} width={144} height={128} className='w-36 h-32 md:w-48 md:h-40 rounded-3xl'/>
                        <div className='upper-episode-data flex flex-col w-full gap-1'>
                            <Link href={`/playepisode?id=${episode.episodeId}`}>
                                <span className='font-bold text-xl md:text-3xl hover:text-[#2176FF] transition-colors duration-300'>{episode.name}</span>
                            </Link>
                            
                            <span className='text-[#A7AAA7]'>S01 E{(episode.episodeNumber).toString().padStart(3, '0')} • {episode.duration}</span>
                        </div>
                    </div>

                    
                        
                    <div className='bottom-episode-data flex flex-row justify-between'>
                        <div className='flex flex-col lg:flex-row gap-3'>
                            <div className='likes-comments flex flex-row gap-3'>
                                <div className="likes flex flex-row justify-center gap-1">
                                    {(user?.likedEpisodes || []).includes(episode.episodeId) ? <FavoriteIcon className='text-[#FF0066] hover:scale-110 transition-transform duration-300' onClick={()=>handleUnlike(episode.episodeId)}/> : <FavoriteBorderIcon className='hover:text-[#FF0066] hover:scale-110 transition-all duration-300' onClick={()=>handleLike(episode.episodeId)}/>}
                                    <span className='font-bold md:text-lg'>{episode.likes} Likes</span>
                                </div>
                                <div className="comments flex flex-row justify-center gap-1">
                                    <Link href={`/playepisode?id=${episode.episodeId}`}>
                                        <TextsmsIcon className='hover:scale-110 hover:text-[#2176FF] transition-all duration-300 cursor-pointer'/>
                                    </Link>
                                    
                                    <span className='font-bold md:text-lg'>{episode.comments} Comments</span>
                                </div>
                            </div>
                            <div className='add-remove-playlist flex flex-row gap-3'>
                                <div className="add-to-playlist flex flex-row justify-center gap-1"  onClick={() => openAddEpisodeToPlaylistsModal(episode)}>
                                    <AddIcon className='hover:scale-110 hover:text-[#2176FF] transition-all duration-300 cursor-pointer'/>
                                    <span className='font-bold md:text-lg hover:text-[#2176FF] transition-all duration-300 cursor-pointer'>Add To Playlist</span>
                                </div>
                                {playlists && playlists.filter((playlist) => playlist.episodes.includes(episode.episodeId)).length > 0 && <div className="remove-from-playlist flex flex-row justify-center gap-1" onClick={() => openRemoveEpisodeFromPlaylistsModal(episode)}>
                                    <DeleteIcon className='hover:scale-110 hover:text-[#2176FF] transition-all duration-300 cursor-pointer'/>
                                    <span className='font-bold md:text-lg hover:text-[#2176FF] transition-all duration-300 cursor-pointer'>Remove From Playlist</span>
                                </div>}
                            </div>
                        </div>

                        {playlists && playlists.filter((playlist) => playlist.episodes.includes(episode.episodeId)).length > 0 && <div className='added-to-playlist-div relative'>
                            <CheckCircleIcon sx={{color: "#2176FF"}} className='hover:scale-110 transition-transform duration-300 cursor-pointer peer'/>
                            <div className={`addedToPlaylistsDropdown flex flex-col gap-2 bg-black-50-opacity text-center p-5 max-h-32 transition-opacity duration-300 overflow-y-auto rounded-3xl absolute right-0 -top-[5px] translate-y-[-100%] opacity-0 pointer-events-none peer-hover:opacity-100 peer-hover:pointer-events-auto`}>
                                {playlists.filter((playlist) => playlist.episodes.includes(episode.episodeId)).map((playlist, index) => (<span key={index} className='text-nowrap'>Added To {playlist.name}</span>))}
                            </div>
                        </div>}
                    </div>
                    
                </li>))}
            
                {playlistEpisodes && playlistEpisodes.length === 0 && <li className='h-80 flex justify-center items-center'>
                    <span className='font-bold text-3xl md:text-5xl'>No Episodes in the Playlist !</span>    
                </li>}

                {!playlistEpisodes && <li className='h-80 flex justify-center items-center'><Spinner/></li>}

            </ul>

            <div className='flex justify-center'>
                <button className="bg-[#2176FF] h-14 px-4 md:px-8 rounded-3xl font-bold flex flex-row gap-1 items-center mt-5 md:mt-10 hover:scale-110 transition-transform duration-300" onClick={openAddEpisodesToPlaylistModal}>
                    <AddIcon/>
                    <span>Add Episodes</span>
                </button>
            </div>

            

            <Modal isOpen={isAddEpisodesToPlaylistModalOpen} onRequestClose={closeAddEpisodesToPlaylistModal} contentLabel="Add To Playlists Modal" style={customStyles}> {/* Add Episodes To Playlist Popup */}
                    <div className='flex flex-row'>
                        <div className='text-center w-full'>
                            <span className='text-2xl md:text-5xl font-bold'>Select Episodes To Add In</span>
                        </div>
                        <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeAddEpisodesToPlaylistModal}/>
                    </div>
                    <div className={`main flex flex-col ${(episodes && episodes.length < 3) ? 'justify-center' : ''} gap-2 my-5 p-1 md:p-2 h-48 overflow-y-auto`}>
                        {episodes ? episodes.filter((episode) => !playlist?.episodes?.includes(episode.episodeId)).map((episode, index) => (
                            <div key={index} className='bg-black-50-opacity rounded-3xl flex flex-row gap-5 px-5 py-2 h-auto items-center'>
                                {checkedEpisodesState[episode.episodeId] ? <CheckBoxIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>toggleEpisodesCheckbox(episode.episodeId)}/> : <CheckBoxOutlineBlankIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={()=>toggleEpisodesCheckbox(episode.episodeId)}/>}
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

            <Modal isOpen={isAddEpisodeToPlaylistsModalOpen} onRequestClose={closeAddEpisodeToPlaylistsModal} contentLabel="Add Episode To Playlists Modal" style={customStyles}> {/* Add Episode To Playlists Popup */}
                <div className='flex flex-row'>
                    <div className='text-center w-full'>
                        <span className='text-2xl md:text-5xl font-bold'>Select Playlists To Add In</span>
                    </div>
                    <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeAddEpisodeToPlaylistsModal}/>
                </div>
                <div className={`main flex flex-col ${(playlists && playlists.length < 3) ? 'justify-center' : ''} gap-2 my-5 p-1 md:p-2 h-48 overflow-y-auto`}>
                    {playlists && playlists.filter((playlist) => !playlist.episodes.includes(episodeToAddInPlaylists?.episodeId)).map((playlist, index) => (
                        <div key={index} className='bg-black-50-opacity rounded-3xl flex flex-row gap-5 px-5 py-2 h-auto items-center'>
                            {checkedPlaylistsState[playlist.playlistId]? <CheckBoxIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => togglePlaylistsCheckbox(playlist.playlistId)}/> : <CheckBoxOutlineBlankIcon className='cursor-pointer hover:scale-110 transition-transform duration-300' onClick={() => togglePlaylistsCheckbox(playlist.playlistId)}/>}
                            <div className='flex flex-col'>
                                <span className='font-bold text-xl'>{playlist.name}</span>
                                <span className='text-[#A7AAA7]'>Episodes: {playlist.episodes.length}</span>
                            </div>
                        </div> 
                    ))}

                    {playlists && playlists.filter((playlist) => !playlist.episodes.includes(episodeToAddInPlaylists?.episodeId)).length === 0 && <div className='h-full flex justify-center items-center'>
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
            </Modal>    

            <Modal isOpen={isRemoveEpisodeFromPlaylistsModalOpen} onRequestClose={closeRemoveEpisodeFromPlaylistsModal} contentLabel="Remove Episode From Playlists Modal" style={customStyles}> {/* Remove Episode From Playlists Popup */}
                <div className='flex flex-row'>
                    <div className='text-center w-full'>
                        <span className='text-2xl md:text-5xl font-bold'>Select Playlists To Remove From</span>
                    </div>
                    <CloseIcon className='cursor-pointer text-3xl hover:scale-110 transition-transform duration-300' onClick={closeRemoveEpisodeFromPlaylistsModal}/>
                </div>
                <div className={`main flex flex-col ${(playlists && playlists.length < 3)? 'justify-center' : ''} gap-2 my-5 p-1 md:p-2 h-48 overflow-y-auto`}>
                    {playlists && playlists.filter((playlist) => playlist.episodes.includes(episodeToRemoveFromPlaylists?.episodeId)).map((playlist, index) => (
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
            </Modal>


        </div>) : (<div className='h-[700px] flex justify-center items-center'><Spinner/></div>)}
    
        <Footer/>
    </>
  )
}

export default OpenedPlaylist
