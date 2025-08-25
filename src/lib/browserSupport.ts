export const checkBrowserSupport = () => {
  const support = {
    webAudio: false,
    mediaDevices: false,
    https: false,
    modernBrowser: false
  };

  // Check HTTPS requirement
  support.https = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  // Check Web Audio API support
  support.webAudio = !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);

  // Check MediaDevices API support
  support.mediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  // Check for modern browser features
  support.modernBrowser = !!(
    typeof window.Promise !== 'undefined' &&
    typeof window.fetch !== 'undefined' &&
    typeof Object.assign !== 'undefined' &&
    typeof Array.from !== 'undefined'
  );

  return support;
};

export const getBrowserCompatibilityMessage = () => {
  const support = checkBrowserSupport();
  const issues: string[] = [];

  if (!support.https) {
    issues.push('HTTPS is required for microphone access');
  }

  if (!support.webAudio) {
    issues.push('Web Audio API is not supported');
  }

  if (!support.mediaDevices) {
    issues.push('Media devices API is not supported');
  }

  if (!support.modernBrowser) {
    issues.push('Some modern JavaScript features are not available');
  }

  return {
    isSupported: issues.length === 0,
    issues,
    recommendations: issues.length > 0 ? [
      'Try using a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)',
      'Ensure you\'re accessing the site via HTTPS',
      'Check that your browser permissions allow microphone access'
    ] : []
  };
};