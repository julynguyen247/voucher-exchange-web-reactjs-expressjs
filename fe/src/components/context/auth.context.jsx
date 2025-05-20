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
  const [fetchCount, setFetchCount] = useState(0);
  
  // Custom setAuth that also saves to localStorage
  const setAuth = (newAuth) => {
    // Prevent unnecessary rerenders by doing deep comparison
    const isSameAuth = 
      newAuth.isAuthenticated === auth.isAuthenticated &&
      newAuth.user.email === auth.user.email &&
      newAuth.user.name === auth.user.name &&
      newAuth.user.id === auth.user.id &&
      newAuth.user.role === auth.user.role;
      
    // Only update if something actually changed
    if (!isSameAuth) {
      console.log("Auth state updated:", {
        isAuthenticated: newAuth.isAuthenticated,
        email: newAuth.user.email,
        role: newAuth.user.role
      });
      
      localStorage.setItem('auth', JSON.stringify(newAuth));
      setAuthState(newAuth);
      setFetchCount(prev => prev + 1);
    }
  };

  return (
    <AuthContext.Provider value={{ setAuth, auth }}>
      {props.children}
    </AuthContext.Provider>
  );
};
