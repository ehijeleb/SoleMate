import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Adjust the import path as needed
import { useRouter } from 'next/router'; // Use Next.js router

const LogOut = () => {
    const router = useRouter(); // Initialize the Next.js router

    useEffect(() => {
        const logOutUser = async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error logging out:', error.message);
            } else {
                router.push('/'); // Redirect to the login page after logout
            }
        };

        logOutUser();
    }, [router]);

    return null; // This component doesn't need to render anything
};

export default LogOut;
