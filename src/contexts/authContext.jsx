import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";


const AuthContext = createContext(null);


export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (token) {
            try {
                setToken(token);
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error("Invalid token");
                localStorage.removeItem("authToken");
            }
        }
    }, []);
    
    const login = (newToken) => {
        localStorage.setItem("authToken", newToken);
        setToken(newToken);
        try {
            const decoded = jwtDecode(newToken);
            setUser(decoded);
        } catch (err) {
            console.error("Invalid token on login");
        }
    };

    const value = {
        token,
        user,
        login,
        logout: () => {
            localStorage.removeItem("authToken");
            setToken(null);
            setUser(null);
        },
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};