import { createContext, useState } from 'react';

export const AuthContext = createContext({
    isAuthenticated:false,
    user:{
        email:"",
        name:""
    },
});

export const AuthWrapper=(props)=> {
    const [auth, setAuth] = useState({
        isAuthenticated:false,
    user:{
        email:"",
        name:""
    },
    });
    
    return (
      <AuthContext.Provider value={{setAuth,auth}}>
        {props.children}
      </AuthContext.Provider>
    );
  }