"use client";

import React, { useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'

const PushProfil = () => {
    const router = useRouter();

    useEffect(() => {
        const checkuser = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/`, { withCredentials: true });
                router.push(`/profil/${response.data.check.username}`);
            } catch (error) {
                console.error('Error checking session:', error);
            }
        }
        checkuser();
    }, [router]);

    return (
        <div>
        </div>
    );
}


export default PushProfil;