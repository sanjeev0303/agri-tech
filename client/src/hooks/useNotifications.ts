import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { apiClient } from '../api/axios';

const STORAGE_KEY = 'agro-tech-last-booking-id';

export function useNotifications() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const pollInterval = useRef<any>(null);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const showNotification = async (title: string, body: string) => {
    // If browser is active, we can show standard notification or use SW
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body,
        icon: '/favicon.ico', // Adjust path if needed
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'new-booking',
        renotify: true,
        data: { url: '/dashboard/provider/bookings' }
      } as any);
    } else {
      new Notification(title, { body });
    }
  };

  const checkNewBookings = async () => {
    if (!token || (user?.role !== 'provider' && user?.role !== 'labour')) return;

    try {
      const res = await apiClient.get('/provider/bookings');
      const bookings = res.data;
      
      if (!bookings || bookings.length === 0) return;

      const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed');
      if (confirmedBookings.length === 0) return;

      // Get latest ID
      const latestId = Math.max(...confirmedBookings.map((b: any) => b.id));
      const lastSeenId = parseInt(localStorage.getItem(STORAGE_KEY) || '0');

      if (latestId > lastSeenId) {
        const newBooking = confirmedBookings.find((b: any) => b.id === latestId);
        showNotification(
          '🚨 New Field Assignment',
          `New mission detected: ${newBooking.resource_name || 'Agro-Resource'}. Initialize deployment now.`
        );
        localStorage.setItem(STORAGE_KEY, latestId.toString());
      }
    } catch (error) {
      console.error("Notification polling failed", error);
    }
  };

  useEffect(() => {
    if ((user?.role === 'provider' || user?.role === 'labour') && token) {
      requestPermission();
      
      // Initial check
      checkNewBookings();

      // Start polling every 45 seconds
      pollInterval.current = setInterval(checkNewBookings, 45000);
    }

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [user?.role, token]);

  return { requestPermission };
}
