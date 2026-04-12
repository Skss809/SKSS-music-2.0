import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthButton() {
  const [user, setUser] = useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    // Force select account to prevent "autoback" issues with cached sessions
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert(`This domain is not authorized in Firebase. Please add your Vercel domain to the "Authorized domains" list in the Firebase Console (Authentication > Settings).`);
      } else if (error.code === 'auth/popup-blocked') {
        alert('The login popup was blocked by your browser. Please allow popups for this site.');
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
