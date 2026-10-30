import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if already running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // 2. Check if user previously dismissed prompt
    const dismissed = localStorage.getItem('pwa_install_dismissed') === 'true';
    setIsDismissed(dismissed);

    // 3. Detect iOS / iPadOS devices (including iPad with desktop user agent)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.maxTouchPoints > 1 && /macintosh/.test(ua));
    setIsIOS(isIOSDevice);

    // 4. Handle Chromium / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Install prompt error:', err);
      return false;
    }
  };

  const dismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  const resetDismiss = () => {
    setIsDismissed(false);
    localStorage.removeItem('pwa_install_dismissed');
  };

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOS: isIOS && !isInstalled,
    isDismissed,
    install,
    dismiss,
    resetDismiss,
  };
}
