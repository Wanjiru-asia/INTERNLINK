import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { userId } = useAuth();

    if (!userId) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
