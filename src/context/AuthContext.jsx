import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl

export const AuthContext = createContext();



export const AuthProvider = ({ children })=>{

    const [ token, setToken ] = useState( localStorage.getItem('token'))
    const [ authUser, setAuthUser ] = useState(null)
    const [ onlineUsers, setOnlineUsers ] = useState([])
    const [ socket, setSocket ] = useState(null)


    // check if user is authenticated and if so, set the user data and connect socket
    const checkAuth = async()=>{
        try {
            const {data} = await axios.get('/api/auth/check')
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    // connect socket func to handle socket connection and online users update
    const connectSocket = (userData)=>{

        if(!userData || socket?.connected) return;

        const newSocket = io( backendUrl, {
            query:{
                userId: userData._id,
            }
        })

        newSocket.connect()
        setSocket(newSocket)

        newSocket.on('getOnlineUsers', (userIds)=>{
            setOnlineUsers(userIds)
        })
    }


    // login or signup func handle for user auth & socket connection
    const loginHandler = async( state, credentials )=>{
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)
            
            if(data.success){
                setAuthUser(data.userData)
                connectSocket(data.userData)
                axios.defaults.headers.common['token'] = data.token   //include token with all axios requests
                setToken(data.token)
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }


    // logout func to handle user auth & socket disconnect
    const logoutHandler = async()=>{
        localStorage.removeItem("token")
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common['token'] = null        //remove token with all next axios requests
        toast.success("Logged out successfully")
        socket.disconnect()
    }


    // Update profile fun to handle user profile
    const updateProfile = async(body)=>{
        try {
            const {data} = await axios.put('/api/auth/update-profile', body)
            if(data.success){
                setAuthUser(data.user)
                toast.success('Profile updated successfully')
            }else{
                 toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }




    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['token'] = token  //all req happen when token available !
        }
        checkAuth()
    },[])




    const value = {
        axios,
        socket,
        authUser,
        onlineUsers,
        loginHandler,
        logoutHandler,
        updateProfile
    }

    



    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}