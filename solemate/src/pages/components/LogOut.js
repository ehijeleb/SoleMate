import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; 
import { useRouter } from 'next/router'; 

const LogOut = () => {
    const router = useRouter(); 

    useEffect(() => {
        const logOutUser = async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error logging out:', error.message);
            } else {
                router.push('/'); 
            }
        };

        logOutUser();
    }, [router]);

    return null; 
};

export default LogOut;
