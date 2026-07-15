import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserProfile {
    email: string;
    role?: string;
}

interface AuthContextType {
    token: string | null;
    user: UserProfile | null;
    isLoading: boolean;
    loginUser: (token: string, user: UserProfile) => void;
    logoutUser: () => void; // ensure logout takes NO arguments
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    isLoading: true,
    loginUser: () => { },
    logoutUser: () => { }, // Matches signature perfectly
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const loginUser = (newToken: string, currentUser: UserProfile) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(currentUser));
        setToken(newToken);
        setUser(currentUser);
    };

    const logoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);