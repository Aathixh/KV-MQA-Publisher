import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth, getSecondaryAuth } from "./firebase";

export interface Admin {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  createdBy?: string;
}

interface FirestoreAdminDoc {
  email: string;
  displayName?: string;
  createdAt?: Timestamp;
  createdBy?: string;
}

// Collection reference
const adminsRef = collection(db, "admins");

// Get all admins (convert Firestore Timestamp -> Date)
export const getAdmins = async (): Promise<Admin[]> => {
  const snapshot = await getDocs(adminsRef);
  return snapshot.docs.map((d) => {
    const data = d.data() as FirestoreAdminDoc;
    const createdAtDate = data.createdAt?.toDate() ?? new Date(); // fallback ensures Date
    return {
      uid: d.id,
      email: data.email,
      displayName: data.displayName,
      createdAt: createdAtDate,
      createdBy: data.createdBy,
    };
  });
};

// Check if a user is an admin
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  const ref = doc(db, "admins", uid);
  const snap = await getDoc(ref);
  return snap.exists();
};

// Add a new admin WITHOUT switching current user (secondary auth)
export const addAdmin = async (
  email: string,
  password: string,
  displayName?: string
): Promise<Admin> => {
  if (!auth.currentUser) throw new Error("Not authenticated.");

  const creatorUid = auth.currentUser.uid;
  const secondary = getSecondaryAuth();

  // Create user on secondary auth instance
  const cred = await createUserWithEmailAndPassword(secondary, email, password);

  // Write admin doc with server timestamp
  const adminRef = doc(db, "admins", cred.user.uid);
  await setDoc(adminRef, {
    email: cred.user.email || email,
    displayName: displayName || "",
    createdAt: serverTimestamp(),
    createdBy: creatorUid,
  });

  // Read back to resolve timestamp
  const written = await getDoc(adminRef);
  let createdAt: Date = new Date();
  const data = written.data() as FirestoreAdminDoc | undefined;
  if (data?.createdAt) {
    createdAt = data.createdAt.toDate();
  }

  // Clean up secondary session (does not affect primary)
  secondary.signOut().catch(() => {});

  return {
    uid: cred.user.uid,
    email: cred.user.email || email,
    displayName: displayName || "",
    createdAt,
    createdBy: creatorUid,
  };
};

// Delete an admin
export const removeAdmin = async (uid: string): Promise<void> => {
  if (!auth.currentUser) throw new Error("Not authenticated.");
  await deleteDoc(doc(db, "admins", uid));
};

export const isCurrentUserAdmin = async (): Promise<boolean> => {
  if (!auth.currentUser) return false;
  try {
    const ref = doc(db, "admins", auth.currentUser.uid);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch {
    return false;
  }
};
