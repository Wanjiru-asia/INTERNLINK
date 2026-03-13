import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (userData) => {
        // Load additional profile data from localStorage to stay "realistic" without DB changes
        const extraData = JSON.parse(localStorage.getItem(`profile_${userData.id}`)) || {};
        const combinedData = { ...userData, ...extraData };
        setUser(combinedData);
        localStorage.setItem('user', JSON.stringify(combinedData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const refreshUser = async () => {
        if (!user?.id) return;
        try {
            const r = await fetch(`http://localhost:3000/api/user/${user.id}`);
            const d = await r.json();
            if (r.ok) {
                login(d.user);
            }
        } catch (err) {
            console.error('Failed to refresh user data:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            userName: user?.fullname, 
            userEmail: user?.email,
            userId: user?.id, 
            login, 
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
