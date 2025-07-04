import { useEffect } from "react";
import { useNavigate } from  'react-router-dom';


const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const router = useNavigate();

        // check if user is authenticated (by checking token in localStorage)
        const isAuthenticated = () => {
            if(localStorage.getItem("token")){
                return true;
            }
            return false;
        }
        
        // If not authenticated, redirect to "/auth" login page
        useEffect(() => {
            if(!isAuthenticated()) {
                router("/auth");
            }
        },[])
        return <WrappedComponent {...props} />
    }
    return AuthComponent;
}

export default withAuth;