"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/axios';
import { handleTokenExpired } from '@/utils/handleTokenExpired';
import Link from 'next/link';
import Spinner from './Spinner';

import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';


const Navbar = () => {

    const router = useRouter()

    const [searchQuery, setSearchQuery] = useState("")
    const [searchedEpisodes, setSearchedEpisodes] = useState([])
    const [isSearchingEpisodes, setIsSearchingEpisodes] = useState(false)
    const [isSignOut, setIsSignOut] = useState(false)

    const fetchSearchResults = async (searchQuery) => {
        try {
            setIsSearchingEpisodes(true)
            const accessToken = localStorage.getItem('accessToken')
            const response = await axiosInstance.get(`/search?episode=${searchQuery}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',        
                },
            })
            const filteredEpisodes = response.data.filteredEpisodes

            console.log(filteredEpisodes)
            setSearchedEpisodes(filteredEpisodes)
            setIsSearchingEpisodes(false)  
        } catch (err) {
            console.log("Error Fetching Search Results :(", err)
            handleTokenExpired(err, router)
        }
        
    }

    const handleSearchQueryChange = (e) => {
        setSearchQuery(e.target.value)
    }

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.trim()) {
                fetchSearchResults((searchQuery.trim()))
            }
        }, 300)

        return () => clearTimeout(delaySearch)
    }, [searchQuery])

    const [showMenuDropdown, setShowMenuDropdown] = useState(false)
    const [showSearchDropdown, setShowSearchDropdown] = useState(false)
    const [isSearchHover, setIsSearchHover] = useState(false)

    const handleSignOut = async () => {
        setIsSignOut(true)
        const response = await axiosInstance.post('/signout')
        localStorage.removeItem('accessToken')
        setIsSignOut(false)
        router.push('/')
    }

    return (
        <>
            {isSignOut && <div className='bg-black-90-opacity fixed inset-0 z-[60] flex justify-center items-center'>
                <Spinner/>
            </div>}

            <div className='nav flex flex-row mx-1 md:mx-10 gap-2 md:gap-10 justify-between pt-5 h-20 relative'>
                <Link href={"/homepage"}>
                    <img width={80} height={80} src="/logo.svg" alt="" className='!w-[80px] !h-[80px] cursor-pointer hover:scale-110 transition-transform duration-300'/>
                </Link>

                <div className='flex flex-col w-1/2 items-center'>
                    <div className="searchBar w-full flex flex-row">
                        <input type="text" className='w-full h-14 px-4 md:px-10 rounded-s-3xl outline-none border-none  bg-blue-5-opacity placeholder:text-[#A7AAA7] placeholder:font-normal hover:bg-blue-10-opacity transition-colors duration-300 focus-within:bg-blue-10-opacity' placeholder='Search Episode by Name' onFocus={()=>setShowSearchDropdown(true)} onBlur={()=> setTimeout(()=>setShowSearchDropdown(false), 100)} value={searchQuery} onChange={handleSearchQueryChange} name='searchbar'/>
                        <Link href={`/searchresults?episode=${searchQuery.trim()}`}>
                            <button className='h-14 bg-[#2176FF] w-16 rounded-e-3xl outline-none border-none' onMouseEnter={()=>setIsSearchHover(true)} onMouseLeave={()=>setIsSearchHover(false)}>
                                <SearchIcon className={`${isSearchHover? 'scale-110' : ''} transition-transform duration-300`}/>
                            </button>
                        </Link>
                    </div>
                    {showSearchDropdown && (<div className={`searchDropdown w-full md:w-1/2 ${searchedEpisodes.length > 1 ? 'h-48' : 'h-24'} rounded-3xl bg-[#0a0e15] absolute ${searchedEpisodes.length > 1 ? 'bottom-[-200px]' : 'bottom-[-100px]'} z-10 p-5 overflow-y-auto`}>
                        {!isSearchingEpisodes && searchedEpisodes.map((episode) => (<div key={episode.episodeId} className='flex flex-col cursor-pointer mb-4 hover:bg-blue-10-opacity p-2 rounded-xl transition-colors duration-300'>
                            <Link href={`/playepisode?id=${episode.episodeId}`}>
                                <span className='w-fit font-bold hover:text-[#2176FF] transition-colors duration-300'>{episode.name}</span>
                            </Link>
                            
                            <span className='w-fit text-[#A7AAA7] text-xs mt-1'>S01 E{(episode.episodeNumber).toString().padStart(3, '0')} • {episode.duration}</span>
                            <div className='w-full h-[1px] bg-white mt-4'></div>
                        </div>))}

                        {!isSearchingEpisodes && searchedEpisodes.length === 0 && <p className={`text-center font-bold text-2xl my-2`}>No Episodes !</p>}    

                        {isSearchingEpisodes && <div className='h-full flex justify-center items-center'><Spinner/></div>}
                    </div>)}
                </div>
                
                <div className="menu flex flex-col items-end gap-3">
                    <button className='flex flex-row items-center md:gap-2 h-14 w-fit bg-blue-5-opacity rounded-3xl px-4 md:px-8 hover:bg-[#2176FF] transition-colors duration-300 whitespace-nowrap' onClick={()=>setShowMenuDropdown(!showMenuDropdown)} onBlur={()=> setTimeout(()=>setShowMenuDropdown(false), 100)}>
                        <span className='text-sm md:text-base font-bold'>Menu</span>
                        {showMenuDropdown?<ArrowDropUpIcon/>:<ArrowDropDownIcon/>}
                    </button>
                    {showMenuDropdown && (<div className="dropdown bg-[#0a0e15] h-48 w-40 rounded-3xl flex flex-col p-5 items-center gap-2 absolute bottom-[-200px] z-10">
                        <Link href={"/episodes"} className='font-bold cursor-pointer hover:text-[#2176FF] transition-colors duration-300'>
                            Episodes
                        </Link>
                        <div className='separating-line h-[1px] w-full bg-white'></div>
                        <Link href={"/playlists"} className='font-bold cursor-pointer hover:text-[#2176FF] transition-colors duration-300'>
                            Playlists
                        </Link>
                        <div className='separating-line h-[1px] w-full bg-white'></div>
                        <Link href={"/profile"} className='font-bold cursor-pointer hover:text-[#2176FF] transition-colors duration-300'>
                            Profile
                        </Link>
                        <div className='separating-line h-[1px] w-full bg-white'></div>
                        <span className='font-bold cursor-pointer hover:text-[#2176FF] transition-colors duration-300' onClick={handleSignOut}>Sign out</span>
                    </div>)}
                </div>
            </div>
        </>
    )
}

export default Navbar
