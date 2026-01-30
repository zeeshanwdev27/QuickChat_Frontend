import { createContext, useContext, useState } from "react";
import { AuthContext } from './AuthContext.jsx'
import toast from "react-hot-toast";


export const ChatContext = createContext();



export const ChatProvider = ({ children })=>{

    const [ messages, setMessages ] = useState([])
    const [ users, setUsers ] = useState([])
    const [ selectedUser, setSelectedUser ] = useState(null)
    const [ unseenMessages, setUnseenMessages ] = useState({})

    const { socket, axios } = useContext(AuthContext)


    // func to get all users for sidebar
    const getUsers = async()=>{
        try {
            const {data} = await axios.get('/api/messages/users')
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    // func to get messages for selected user
    const getMessages = async( userId )=>{
        try {
            const {data} = await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
             toast.error(error.message)
        }
    }


    // func to send message to selected user
    const sendMessage = async( messageData )=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if(data.success){
                setMessages((prevMessage) => [ ...prevMessage, data.newMessage ])
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }


    // func to subcribe to message for selected user    
    const subcribeToMessages = async()=>{
        if(!socket) return
        socket.on('newMessage', (newMessage)=>{
            
        })
    } 


    const value = {

    }



    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}