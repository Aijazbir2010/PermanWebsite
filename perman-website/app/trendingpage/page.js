"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '../axios'
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

const TrendingPage = () => {

    const router = useRouter()

    const [episodes, setEpisodes] = useState(null)

    const getTrendingEpisodes = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            const response = await axiosInstance.get('/episodes/trendingepisodes', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            })
            const { trendingEpisodes } = response.data
            setEpisodes(trendingEpisodes)
        } catch (err) {
            console.log("Can't Fetch Trending Episodes !", err)
            handleTokenExpired(err, router)
        }
    }

    useEffect(() => {
        getTrendingEpisodes()
    }, [])

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
            setEpisodes(prevEpisodes => prevEpisodes.map(episode => episode.episodeId === episodeId ? {...episode, likes: updatedEpisode.likes} : episode))
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
        } catch (err) {
            console.log('Failed To Unlike Episode', err)
            handleTokenExpired(err, router)
        }
    }

    const [episodeToAddInPlaylists, setEpisodeToAddInPlaylists] = useState({})
    const [episodeToRemoveFromPlaylists, setEpisodeToRemoveFromPlaylists] = useState({})

    //Modal
    const [isAddEpisodeToPlaylistsModalOpen, setIsAddEpisodeToPlaylistsModalOpen] = useState(false);

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

        <div className="main mx-3 md:mx-10 mt-10 mb-20">
            <div className='flex flex-row justify-center items-center gap-2 md:gap-5 mb-5 relative'>
                <Link href={"/episodes"} className='flex items-center'>
                    <ArrowBackIcon className='text-2xl md:text-5xl cursor-pointer hover:scale-110 transition-transform duration-300 absolute left-0'/>
                </Link>
                
                <div className='flex flex-row items-center justify-center text-center gap-2 md:gap-5 w-44 md:w-80 lg:w-auto'>
                    <img src="/trending-fire.png" alt="trending-fire" className='w-7 md:w-14 h-10 md:h-20'/>
                    <span className="text-2xl md:text-5xl font-bold">Trending Episodes</span>
                </div>
                <Image src={"/perman-two.png"} width={200} height={200} alt='perman-no.1' className='w-32 h-32 md:w-[200px] md:h-[200px]'/>
            </div>

            <span className='font-bold text-2xl'>Episodes: {episodes ? episodes.length : 0}</span>

            <ul className="mt-10 flex flex-col gap-10 max-h-[950px] overflow-y-auto">
                
            {episodes && episodes.map((episode, index) => (
                    <li key={index} className='bg-blue-5-opacity w-[99%] h-72 lg:h-60 p-5 rounded-3xl flex flex-col gap-5 hover:bg-blue-10-opacity cursor-pointer transition-colors duration-300'>
                    <div className='flex flex-row gap-5'>
                        <Image src={"/episode-thumbnail.jpg"} alt={"episode-thumbnail"} width={144} height={128} className='w-36 h-32 md:w-48 md:h-40 rounded-3xl'/>
                        <div className='upper-episode-data flex flex-col w-full gap-1'>
                            <Link href={`/playepisode?id=${episode.episodeId}`}>
                                <span className='font-bold text-xl md:text-3xl hover:text-[#2176FF] transition-colors duration-300 cursor-pointer'>{episode.name}</span> 
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
                                <div className="add-to-playlist flex flex-row justify-center gap-1" onClick={() => openAddEpisodeToPlaylistsModal(episode)}>
                                    <AddIcon className='hover:scale-110 hover:text-[#2176FF] transition-all duration-300 cursor-pointer'/>
                                    <span className='font-bold md:text-lg hover:text-[#2176FF] transition-colors duration-300 cursor-pointer'>Add To Playlist</span>
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
                    
                    </li>
                ))}

                {!episodes && <div className='h-80 flex justify-center items-center'><Spinner/></div>}

            </ul>

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
        </div>
    
        <Footer/>
    </>
  )
}

export default TrendingPage
