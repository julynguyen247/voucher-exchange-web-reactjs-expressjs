import { createContext, useState, useContext } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  user: {
    email: "",
    name: "",
    phone: "",
    id: "",
    image: "",
  },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthWrapper');
  }
  
  return {
    isAuthenticated: context.auth?.isAuthenticated || false,
    user: context.auth?.user || {},
    setAuth: context.setAuth
  };
};

export const AuthWrapper = (props) => {
  // Load auth data from localStorage if available
  const savedAuth = localStorage.getItem('auth');
  const initialAuth = savedAuth ? JSON.parse(savedAuth) : {
    isAuthenticated: false,
    user: {
      email: "",
      name: "",
      phone: "",
      id: "",
      image: "",
      role: "",
    },
  };
  
  const [auth, setAuthState] = useState(initialAuth);
  
  // Custom setAuth that also saves to localStorage
  const setAuth = (newAuth) => {
    localStorage.setItem('auth', JSON.stringify(newAuth));
    setAuthState(newAuth);
  };

  return (
    <AuthContext.Provider value={{ setAuth, auth }}>
      {props.children}
    </AuthContext.Provider>
  );
};
