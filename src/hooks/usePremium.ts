'use client';

import { useState, useEffect } from 'react';

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState<Date | null>(null);

  useEffect(() => {
    const checkPremiumStatus = () => {
      const expiryTimestamp = localStorage.getItem('premiumExpiry');
      if (!expiryTimestamp) {
        setIsPremium(false);
        setPremiumExpiry(null);
        return;
      }

      const expiry = new Date(parseInt(expiryTimestamp));
      const now = new Date();
      
      if (now < expiry) {
        setIsPremium(true);
        setPremiumExpiry(expiry);
      } else {
        setIsPremium(false);
        setPremiumExpiry(null);
        localStorage.removeItem('premiumExpiry');
      }
    };

    checkPremiumStatus();

    // Check every minute
    const interval = setInterval(checkPremiumStatus, 60000);

    // Listen for premium status changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'premiumExpiry') {
        checkPremiumStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const grantPremium = (durationHours = 24) => {
    const expiry = Date.now() + (durationHours * 60 * 60 * 1000);
    localStorage.setItem('premiumExpiry', expiry.toString());
    setIsPremium(true);
    setPremiumExpiry(new Date(expiry));
  };

  const revokePremium = () => {
    localStorage.removeItem('premiumExpiry');
    setIsPremium(false);
    setPremiumExpiry(null);
  };

  const getRemainingTime = () => {
    if (!premiumExpiry) return null;
    
    const now = new Date();
    const diff = premiumExpiry.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  return {
    isPremium,
    premiumExpiry,
    grantPremium,
    revokePremium,
    getRemainingTime,
  };
};