import API from "../api/axios";
import { createContext, useContext, useEffect, useState } from "react";

interface User{
    id:number;
    email:string;
    username:string;
    roles:{id:number;name:string;}[];
}

interface AuthContextType{
    user:User | null;
    token: string |null;
    login:(email:string,password:string)=>Promise<void>;
    logout: ()=>Promise<void>;
    isAdmin:()=>boolean;
}

const AuthContext=createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}:{children:React.ReactNode})=>{
    const [user,setUser] = useState<User |null>(null);
    const [token,setToken]=useState<string |null>(null);

    //check for existing token on mount
    useEffect(()=>{
        const storedToken = localStorage.getItem('token');
        const storedUser=localStorage.getItem('user');

        if(storedToken && storedUser){
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    },[]);

    const login=async (email:string,password:string)=>{
        try{
            const response=await API.post('/login',{email,password});
            const {token:newToken,user:userData} = response.data;

            setToken(newToken);
            setUser(userData);

            localStorage.setItem('token',newToken);
            localStorage.setItem('user',JSON.stringify(userData));

            API.defaults.headers.common['Authorization']=`Bearer ${newToken}`;
        } catch (error){
            throw error;
        }
    };

    const logout=async () =>{
        try{
            if(token){
                await API.post('/logout');
            }
        } catch(error){
            console.error('Logout error: ',error);
        } finally{
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete API.defaults.headers.common['Authorization'];
        }
    };

    const isAdmin=()=>{
        return user?.roles.some(role => role.name === 'admin' || role.name === 'DefaultAdmin') ?? false;
    };

    return(
        <AuthContext.Provider value={{user,token,login,logout,isAdmin}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth=()=>{
    const context=useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};