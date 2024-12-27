import React from 'react'
import Link from 'next/link';

import SearchIcon from '@mui/icons-material/Search';

const UnNavbar = () => {
  return (
    <div className='nav flex flex-row items-center mx-1 md:mx-10 pt-5 gap-2 md:gap-10 justify-between'>
      <img width={80} height={80} src="/logo.svg" alt="" className='cursor-pointer hover:scale-110 transition-transform duration-300'/>

      <div className="searchBar w-1/2 flex flex-row">
        <input type="text" className='w-full h-14 px-4 md:px-10 rounded-s-3xl outline-none border-none   bg-blue-5-opacity placeholder:text-[#A7AAA7] placeholder:font-normal hover:bg-blue-10-opacity transition-colors duration-300 focus-within:bg-blue-10-opacity' placeholder='Search Episode by Name'/>
        <Link href={"/login"}>
          <button className='h-14 bg-[#2176FF] w-16 rounded-e-3xl outline-none border-none'>
              <SearchIcon className='hover:scale-110 transition-transform duration-300'/>
          </button>
        </Link>
      </div>

      <div className="login-signup-btns flex flex-row gap-2 md:gap-5">
      <Link href={{pathname: "/login", query: {login: true}}}>
          <button className='h-14 bg-blue-5-opacity rounded-3xl px-4 md:px-8 hover:bg-[#2176FF] transition-colors duration-300 whitespace-nowrap text-xs md:text-base font-bold'>
              Log in
          </button>
        </Link>
        <Link href={{pathname: "/login", query: {login: false}}}>
          <button className='h-14 bg-blue-5-opacity rounded-3xl px-4 md:px-8 hover:bg-[#2176FF] transition-colors duration-300 whitespace-nowrap text-xs md:text-base font-bold'>
              Sign up
          </button>
        </Link>
        
      </div>
    </div>
  )
}

export default UnNavbar
