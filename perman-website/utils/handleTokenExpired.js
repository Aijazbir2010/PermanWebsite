"use client"
import axiosInstance from "@/app/axios"

export const handleTokenExpired = async (error, router) => {

    if(error.response.data.message === "Token expired!" || error.response.data.message === "Invalid or Expired Token !") {
        try {

          const refreshResponse = await axiosInstance.post('/refresh', {}, {withCredentials: true})
          
          const newAccessToken = refreshResponse.data.accessToken

          localStorage.setItem("accessToken", newAccessToken)

          window.location.reload()
        } catch (err) {
          if (err.response.status === 401 || err.response.status === 403) {
            localStorage.removeItem('accessToken')
            router.push(`/login?msg=${encodeURIComponent('Session Expired ! Please Log in Again !')}`)
          }
        }
        
    }


    
}