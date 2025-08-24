import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
} from "firebase/auth";
import type { User, UserCredential } from "firebase/auth";
import type { ReactNode } from "react";
import { auth } from "../services/firebase";
import { isCurrentUserAdmin } from "../services/admins";

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  lastRemovedDeleted: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<UserCredential | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastRemovedDeleted, setLastRemovedDeleted] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  async function evaluateAndEnforce(user: User) {
    // Check if user still has an admin doc
    const stillAdmin = await isCurrentUserAdmin();
    if (!stillAdmin) {
      try {
        // Hard delete the account (since removed from admins collection)
        await deleteUser(user);
        setLastRemovedDeleted(true);
        setCurrentUser(null);
        setIsAdmin(false);
      } catch {
        // Fallback: sign out if delete fails
        await signOut(auth);
      }
    } else {
      setIsAdmin(true);
      setLastRemovedDeleted(false);
    }
  }

  async function login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Immediately evaluate role; if removed, user will be deleted here
    await evaluateAndEnforce(cred.user);
    // If deleted, return null so caller can react if desired
    if (!auth.currentUser) return null;
    return cred;
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await evaluateAndEnforce(user);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const value: AuthContextType = {
    currentUser,
    isAdmin,
    lastRemovedDeleted,
    authLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
}
