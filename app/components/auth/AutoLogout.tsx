"use client";
import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';

/**
 * Component that automatically logs out users after 1 hour of inactivity
 * Tracks mouse movements, clicks, keyboard input, and touch events
 */
export default function AutoLogout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

  useEffect(() => {
    let isActive = true;

    const handleLogout = async () => {
      try {
        const session = await authClient.getSession();
        
        // Only logout if user is actually logged in
        if (session.data?.user) {
          await authClient.signOut();
          
          toast.error('Sessão expirada por inatividade. Faça login novamente.', {
            duration: 6000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          });
        }
      } catch (error) {
        console.error('Erro ao fazer logout automático:', error);
      }
    };

    const resetTimer = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (isActive) {
          handleLogout();
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Activity event handlers
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners for user activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup function
    return () => {
      isActive = false;
      
      // Remove all event listeners
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
