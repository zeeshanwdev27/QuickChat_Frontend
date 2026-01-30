import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from './AuthContext.jsx'
import toast from "react-hot-toast";


export const ChatContext = createContext();



export const ChatProvider = ({ children })=>{

    const { socket, axios } = useContext(AuthContext)

    
    const [ messages, setMessages ] = useState([])
    const [ users, setUsers ] = useState([])
    const [ selectedUser, setSelectedUser ] = useState(null)
    const [ unseenMessages, setUnseenMessages ] = useState({})



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

        if(!socket) return;

        socket.on('newMessage', (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMsgs)=> [...prevMsgs, newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }else{
                setUnseenMessages((prevUnseenMsgs)=>({
                    ...prevUnseenMsgs, [newMessage.senderId] : prevUnseenMsgs[newMessage.senderId] ? prevUnseenMsgs[newMessage.senderId] + 1: 1
                }))

            }
        })
    } 



    // func to unsubs from messages
    const unsubscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage")
    }



    useEffect(()=>{
        subcribeToMessages()
        return ()=> unsubscribeFromMessages();
    },[socket, selectedUser])


    const value = {
        messages, setMessages,
        users,
        selectedUser, setSelectedUser,
        unseenMessages, setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
    }



    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}