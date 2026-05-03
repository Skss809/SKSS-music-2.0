import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthButton() {
  const [user, setUser] = useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    
    // Handle redirect result for mobile/redirect login flow
    const handleRedirect = async () => {
      try {
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (error: any) {
        console.error("Redirect login result failed", error);
        if (error.message?.includes('missing initial state')) {
          alert('Authentication error: Missing initial state. This usually happens if third-party cookies are blocked or if you are in Incognito mode.');
        }
      }
    };
    handleRedirect();

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    // Force select account to prevent "autoback" issues with cached sessions
    provider.setCustomParameters({ prompt: 'select_account' });
    
    // Detect mobile to decide between popup and redirect
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        // Redirect often works better on mobile browsers with strict storage partitioning
        const { signInWithRedirect } = await import('firebase/auth');
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      console.error("Login failed", error);
      
      // Handle the specific "missing initial state" error or generic initialization errors
      if (error.message?.includes('missing initial state') || error.code === 'auth/internal-error') {
        alert('Authentication error: Missing initial state. This usually happens if third-party cookies are blocked or if you are in Incognito mode. Please try enabling cross-site tracking/cookies in your browser settings or use a non-incognito tab.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert(`This domain is not authorized in Firebase. Please add your Vercel domain to the "Authorized domains" list in the Firebase Console (Authentication > Settings).`);
      } else if (error.code === 'auth/popup-blocked') {
        alert('The login popup was blocked by your browser. Please allow popups for this site or try logging in again.');
      } else {
        alert(`Login failed: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-zinc-700" />
        <div className="hidden md:block text-sm">
          <p className="font-medium text-zinc-200">{user.displayName}</p>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors"
    >
      <LogIn size={18} />
      <span>Sign In</span>
    </button>
  );
}
