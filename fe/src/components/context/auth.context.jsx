import { createContext, useState, useContext } from "react";

// Default user template
const defaultUser = {
  email: "",
  name: "",
  phone: "",
  id: "",
  image: "",
  role: "",
  bank: "",
  accountNumber: "",
};

export const AuthContext = createContext({
  isAuthenticated: false,
  user: defaultUser,
  setAuth: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthWrapper");
  }

  return {
    isAuthenticated: context.auth?.isAuthenticated || false,
    user: context.auth?.user || defaultUser,
    setAuth: context.setAuth,
  };
};

export const AuthWrapper = (props) => {
  // Load auth data from localStorage if available
  const savedAuth = localStorage.getItem("auth");
  const initialAuth = savedAuth
    ? JSON.parse(savedAuth)
    : {
        isAuthenticated: false,
        user: defaultUser,
      };

  const [auth, setAuthState] = useState(initialAuth);
  const [fetchCount, setFetchCount] = useState(0);

  const setAuth = (newAuth) => {
    if (!newAuth || !newAuth.user) return;

    const isSameAuth =
      newAuth.isAuthenticated === auth.isAuthenticated &&
      newAuth.user.email === auth.user.email &&
      newAuth.user.name === auth.user.name &&
      newAuth.user.id === auth.user.id &&
      newAuth.user.role === auth.user.role &&
      newAuth.user.bank === auth.user.bank &&
      newAuth.user.accountNumber === auth.user.accountNumber;

    if (!isSameAuth) {
      console.log(" Auth state updated:", {
        isAuthenticated: newAuth.isAuthenticated,
        email: newAuth.user.email,
        role: newAuth.user.role,
        bank: newAuth.user.bank,
        accountNumber: newAuth.user.accountNumber,
      });

      localStorage.setItem("auth", JSON.stringify(newAuth));
      setAuthState(newAuth);
      setFetchCount((prev) => prev + 1);
    }
  };

  return (
    <AuthContext.Provider value={{ setAuth, auth }}>
      {props.children}
    </AuthContext.Provider>
  );
};
