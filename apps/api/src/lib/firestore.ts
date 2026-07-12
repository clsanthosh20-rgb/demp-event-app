import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let db: FirebaseFirestore.Firestore;
let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return;
  try {
    if (getApps().length === 0) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        initializeApp({
          credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_STORAGE_BUCKET) {
        initializeApp({ storageBucket: process.env.FIREBASE_STORAGE_BUCKET });
      } else {
        return;
      }
    }
    db = getFirestore();
    firebaseInitialized = true;
  } catch {
    // Firebase not configured — storage/firestore features unavailable
  }
}

function getDb() {
  if (!firebaseInitialized) initFirebase();
  if (!db) throw new Error('Firestore not available (no Firebase config)');
  return db;
}

function getBucket(): unknown {
  initFirebase();
  if (!firebaseInitialized) throw new Error('Firebase Storage not available (no Firebase config)');
  return getStorage().bucket();
}

function now(): Date {
  return new Date();
}

function docId(): string {
  return crypto.randomUUID();
}

function toPlainObject<T>(doc: FirebaseFirestore.DocumentSnapshot): T | null {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as T;
}

function toPlainObjects<T>(snapshot: FirebaseFirestore.QuerySnapshot): T[] {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
}

export type FirestoreDocument<T> = T & { id: string };

export const firestore = {
  initFirebase,
  getDb,
  getBucket,
  now,
  docId,
  toPlainObject,
  toPlainObjects,
  Timestamp,
  FieldValue,
};
