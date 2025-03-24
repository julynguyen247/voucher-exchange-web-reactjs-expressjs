import { createContext, useState } from 'react';

export const AuthContext = createContext({
    isAuthenticated:false,
    user:{
        email:"",
        name:"",
        phone:"",
        id:"",
        image:"",
    },
});

export const AuthWrapper=(props)=> {
    const [auth, setAuth] = useState({
        isAuthenticated:false,
    user:{
        email:"",
        name:"",
        phone:"",
        id:"",
        image:"",
    },
    });
    
    return (
      <AuthContext.Provider value={{setAuth,auth}}>
        {props.children}
      </AuthContext.Provider>
    );
  }