import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// Create a Context to share auth-related data/functions across the app
export const AuthContext = createContext({});

// Setup axios instance
const client = axios.create({
    baseURL: `http://localhost:8000/api/users`
})

//  Auth Provider
export const AuthProvider = ({children}) => {
    const authContex = useContext(AuthContext); // Get current context value
    const [userData, setUserData] = useState(authContex); // Store user data locally
    const router = useNavigate(); // after login we navigate to HomePage

    // ✅ Register new user
    const handleRegister = async(name, username, password) => {
        try{
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })
            // If registration is successful, return the message
            if(request.status === httpStatus.CREATED){
                return request.data.messages;
            }
        } catch(error) {
            throw error;
        }
    }

    // ✅ Login existing user
    const handleLogin = async(username, password) => {
        try{
            let request = await client.post("/login", {
                username: username,
                password: password
            })
            if(request.status === httpStatus.OK){
                // Save token to localStorage to persist login session
                localStorage.setItem("token", request.data.token)
                // Redirect user to home page after login
                router("/home")
            }
        } catch(error) {
            throw error;
        }
    }

    // ✅ Get meeting history of logged-in user
    const getHistoryOfUser = async () =>  {
        try {
            let request = await client.get("/get-all-activity", {
                params: {
                    token: localStorage.getItem("token") // send token by the params
                }
            });
            return request.data;
        } catch (error) {
            throw error;
        }
    }
 
    // ✅ Add a new meeting code to user's history
    const addToUserHistory = async (meetingCode) => {
      try {
        let request = await client.post("/add-to-activity", {
            token: localStorage.getItem("token"),
            meeting_code: meetingCode
        });
        return request // Return server response
      } catch (error) {
        throw error
      }
    }

    const data = { userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin }

    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider> 
    )
}