import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps{
    children:React.ReactNode;
    requireAdmin?:boolean;
}

export const ProtectedRoute = ({
    children,
    requireAdmin=false
}:ProtectedRouteProps) =>{
    const {user,isAdmin} = useAuth();
    const location=useLocation();

    if(!user){ //redirect to login but remember where they were trying to go
        return <Navigate to="/login" state={{from:location}} replace/>;
    }

    if(requireAdmin && !isAdmin()){ //redirect unauthorized to dashboard
        return <Navigate to="/dashboard" replace/>;
    }
    return <>{children}</>;
}