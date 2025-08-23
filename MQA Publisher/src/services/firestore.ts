import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Quiz {
  id?: string;
  title: string;
  month: string;
  year: number;
  createdAt: Timestamp;
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  answer: string;
}

// Get all quizzes
export const getQuizzes = async () => {
  const quizzesRef = collection(db, "quizzes");
  const q = query(quizzesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Quiz[];
};

// Get a single quiz
export const getQuiz = async (id: string) => {
  const docRef = doc(db, "quizzes", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Quiz;
  }
  return null;
};

// Add a new quiz
export const addQuiz = async (quiz: Omit<Quiz, "id" | "createdAt">) => {
  return await addDoc(collection(db, "quizzes"), {
    ...quiz,
    createdAt: Timestamp.now(),
  });
};

// Update a quiz
export const updateQuiz = async (id: string, data: Partial<Quiz>) => {
  const quizRef = doc(db, "quizzes", id);
  return await updateDoc(quizRef, data);
};

// Delete a quiz
export const deleteQuiz = async (id: string) => {
  const quizRef = doc(db, "quizzes", id);
  return await deleteDoc(quizRef);
};
