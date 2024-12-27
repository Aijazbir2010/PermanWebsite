import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true, // Ensures cookies (like refreshToken) are sent with the request
});


export default axiosInstance;