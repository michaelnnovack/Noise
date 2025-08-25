'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
    gtag: (...args: unknown[]) => void;
    rewardedAdComplete: () => void;
  }
}

interface AdManagerProps {
  onAdComplete?: () => void;
}

export default function AdManager({ onAdComplete }: AdManagerProps) {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [showRewardedAdButton, setShowRewardedAdButton] = useState(false);

  useEffect(() => {
    // Load Google AdSense script
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      
      script.onload = () => {
        setIsAdLoaded(true);
      };
    } else {
      setIsAdLoaded(true);
    }

    // Show rewarded ad button after user has been active for 2 minutes
    const timer = setTimeout(() => {
      setShowRewardedAdButton(true);
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, []);

  const showInterstitialAd = () => {
    if (!isAdLoaded || !window.adsbygoogle) return;

    try {
      // Create interstitial ad placeholder
      const adElement = document.createElement('div');
      adElement.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 90%; position: relative;">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: #666; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">×</button>
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_ID}"
                 data-ad-slot="1234567890"
                 data-ad-format="interstitial"
                 data-full-width-responsive="true"></ins>
          </div>
        </div>
      `;
      
      document.body.appendChild(adElement);
      
      // Initialize the ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense error:', e);
      }

      // Remove ad after 10 seconds if user doesn't close it
      setTimeout(() => {
        if (adElement && adElement.parentNode) {
          adElement.parentNode.removeChild(adElement);
        }
      }, 10000);
      
    } catch (error) {
      console.warn('Failed to show interstitial ad:', error);
    }
  };

  const showRewardedAd = () => {
    if (!isAdLoaded || !window.adsbygoogle) return;

    try {
      // Create rewarded ad interface
      const adElement = document.createElement('div');
      adElement.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center;">
          <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center; position: relative;">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 15px; background: #666; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">×</button>
            <h3 style="margin-bottom: 15px; color: #333;">Watch Ad for Premium Features</h3>
            <p style="margin-bottom: 20px; color: #666; font-size: 14px;">Watch this short ad to unlock extended measurement history and advanced analytics for 24 hours!</p>
            <ins class="adsbygoogle"
                 style="display:block; margin-bottom: 20px;"
                 data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_ID}"
                 data-ad-slot="0987654321"
                 data-ad-format="rectangle"></ins>
            <button onclick="window.rewardedAdComplete()" style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600;">Claim Reward</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(adElement);
      
      // Set up reward completion handler
      window.rewardedAdComplete = () => {
        if (adElement && adElement.parentNode) {
          adElement.parentNode.removeChild(adElement);
        }
        
        // Grant 24-hour premium access
        const premiumExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('premiumExpiry', premiumExpiry.toString());
        
        onAdComplete?.();
        
        // Show success message
        alert('🎉 Premium features unlocked for 24 hours! Enjoy extended history and advanced analytics.');
      };
      
      // Initialize the ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense error:', e);
      }
      
    } catch (error) {
      console.warn('Failed to show rewarded ad:', error);
    }
  };

  // Check if user has premium access
  const hasPremiumAccess = () => {
    const premiumExpiry = localStorage.getItem('premiumExpiry');
    if (!premiumExpiry) return false;
    return Date.now() < parseInt(premiumExpiry);
  };

  // Automatically show interstitial ad after certain actions
  useEffect(() => {
    const handleMeasurementComplete = () => {
      // Show interstitial ad every 10th measurement
      const measurementCount = parseInt(localStorage.getItem('measurementCount') || '0') + 1;
      localStorage.setItem('measurementCount', measurementCount.toString());
      
      if (measurementCount % 10 === 0) {
        setTimeout(() => showInterstitialAd(), 2000); // Show after 2 seconds
      }
    };

    // Listen for measurement events
    document.addEventListener('measurementComplete', handleMeasurementComplete);
    
    return () => {
      document.removeEventListener('measurementComplete', handleMeasurementComplete);
    };
  }, [isAdLoaded, showInterstitialAd]);

  if (!isAdLoaded) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showRewardedAdButton && !hasPremiumAccess() && (
        <button
          onClick={showRewardedAd}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 mb-2 flex items-center space-x-2"
        >
          <span>🎁</span>
          <span>Free Premium</span>
        </button>
      )}
      
      {hasPremiumAccess() && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          ✨ Premium Active
        </div>
      )}
    </div>
  );
}