import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';

const LogOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const logOutUser = async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error logging out:', error.message);
            } else {
                navigate('/'); // Redirect to the login page after logout
            }
        };

        logOutUser();
    }, [navigate]);

    return null; // This component doesn't need to render anything
};

export default LogOut;
