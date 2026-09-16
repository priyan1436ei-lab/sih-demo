/**
 * Firebase Realtime Database & Storage Client
 * Handles persistence for Animals, Health Records, Vet Alerts, and Storage URLs.
 * 
 * Firebase Realtime Database Schema:
 * - animals/{animalId}/ (species, breed, age, vaccination, previousDiseases)
 * - healthRecords/{animalId}/{recordId}/ (imageUrl, predictedDisease, confidence, riskScore, severity, symptoms, recommendation, timestamp)
 * - users/{userId}/ (name, role, phone, district, state)
 * - vetAlerts/{alertId}/ (animalId, disease, riskScore, location, status, timestamp)
 * 
 * Storage:
 * - user_images/{animalId}/{timestamp}.jpg
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getDatabase,
  ref as dbRef,
  set,
  push,
  get,
  child,
  Database
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage
} from "firebase/storage";

// Load configuration from Vite client environment
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: metaEnv.VITE_FIREBASE_DATABASE_URL || "",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: metaEnv.VITE_FIREBASE_APP_ID || ""
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  (firebaseConfig.databaseURL || firebaseConfig.projectId)
);

let db: Database | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
    storage = getStorage(app);
    console.info("[Firebase] Realtime Database & Storage connected successfully.");
  } catch (err) {
    console.warn("[Firebase] Initialization error. Using local fallback cache:", err);
  }
} else {
  console.info("[Firebase] Firebase credentials not yet specified in .env. Running with local offline store.");
}

// Local Storage Fallback Keys
const LOCAL_ANIMALS_KEY = "pashuraksha_rt_animals";
const LOCAL_HEALTH_RECORDS_KEY = "pashuraksha_rt_health_records";
const LOCAL_VET_ALERTS_KEY = "pashuraksha_rt_vet_alerts";

export interface FirebaseAnimal {
  animalId: string;
  tagId?: string;
  species: string;
  breed?: string;
  age?: number;
  vaccination?: Array<{ name: string; date: string; nextDueDate?: string }> | string[];
  previousDiseases?: string[];
  ownerName?: string;
  ownerPhone?: string;
  village?: string;
  district?: string;
  updatedAt?: string;
}

export interface FirebaseHealthRecord {
  recordId?: string;
  animalId: string;
  imageUrl?: string;
  predictedDisease: string;
  confidence: number;
  riskScore: number;
  severity: "Low" | "Medium" | "High" | "Critical" | string;
  symptoms: string[];
  recommendation: string;
  timestamp: string;
  quarantineRequired?: boolean;
  modelSource?: string;
}

export interface FirebaseVetAlert {
  alertId?: string;
  animalId: string;
  disease: string;
  riskScore: number;
  location: string;
  status: "Pending" | "Dispatched" | "Resolved";
  timestamp: string;
  severity: string;
}

/**
 * 1. Store Animal Data in Firebase: animals/{animalId}
 */
export async function saveAnimalToFirebase(animal: FirebaseAnimal): Promise<boolean> {
  const animalId = animal.animalId || animal.tagId || `ANM-${Date.now()}`;
  const payload = {
    ...animal,
    animalId,
    updatedAt: new Date().toISOString()
  };

  // If real Firebase connected
  if (db) {
    try {
      const targetRef = dbRef(db, `animals/${animalId}`);
      await set(targetRef, payload);
      return true;
    } catch (err) {
      console.warn("[Firebase] Failed to write animal to Realtime Database:", err);
    }
  }

  // Fallback / Local mirror
  try {
    const raw = localStorage.getItem(LOCAL_ANIMALS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[animalId] = payload;
    localStorage.setItem(LOCAL_ANIMALS_KEY, JSON.stringify(store));
    return true;
  } catch (e) {
    console.error("Local storage error:", e);
    return false;
  }
}

/**
 * Fetch animal from Firebase: animals/{animalId}
 */
export async function getAnimalFromFirebase(animalId: string): Promise<FirebaseAnimal | null> {
  if (db) {
    try {
      const snap = await get(child(dbRef(db), `animals/${animalId}`));
      if (snap.exists()) {
        return snap.val() as FirebaseAnimal;
      }
    } catch (err) {
      console.warn("[Firebase] Error reading animal from DB:", err);
    }
  }

  // Fallback
  try {
    const raw = localStorage.getItem(LOCAL_ANIMALS_KEY);
    if (raw) {
      const store = JSON.parse(raw);
      return store[animalId] || null;
    }
  } catch {}
  return null;
}

/**
 * 2. Store Health Record in Firebase: healthRecords/{animalId}/{recordId}
 */
export async function saveHealthRecordToFirebase(
  record: FirebaseHealthRecord
): Promise<{ success: boolean; recordId: string }> {
  const recordId = record.recordId || `REC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const payload: FirebaseHealthRecord = {
    ...record,
    recordId,
    timestamp: record.timestamp || new Date().toISOString()
  };

  if (db) {
    try {
      const recordPathRef = dbRef(db, `healthRecords/${record.animalId}/${recordId}`);
      await set(recordPathRef, payload);

      // Also create Vet Alert automatically if high severity or risk score >= 70
      if (payload.riskScore >= 70 || payload.severity === "High" || payload.severity === "Critical") {
        await createVetAlertInFirebase({
          animalId: payload.animalId,
          disease: payload.predictedDisease,
          riskScore: payload.riskScore,
          location: "Field Station / Farm",
          status: "Pending",
          timestamp: payload.timestamp,
          severity: payload.severity
        });
      }

      return { success: true, recordId };
    } catch (err) {
      console.warn("[Firebase] Failed to write health record to Realtime DB:", err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_HEALTH_RECORDS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[record.animalId]) store[record.animalId] = {};
    store[record.animalId][recordId] = payload;
    localStorage.setItem(LOCAL_HEALTH_RECORDS_KEY, JSON.stringify(store));

    if (payload.riskScore >= 70 || payload.severity === "High" || payload.severity === "Critical") {
      await createVetAlertInFirebase({
        animalId: payload.animalId,
        disease: payload.predictedDisease,
        riskScore: payload.riskScore,
        location: "Local Farm",
        status: "Pending",
        timestamp: payload.timestamp,
        severity: payload.severity
      });
    }

    return { success: true, recordId };
  } catch (e) {
    return { success: false, recordId };
  }
}

/**
 * Fetch health records for animal: healthRecords/{animalId}
 */
export async function getAnimalHealthRecordsFromFirebase(
  animalId: string
): Promise<FirebaseHealthRecord[]> {
  if (db) {
    try {
      const snap = await get(child(dbRef(db), `healthRecords/${animalId}`));
      if (snap.exists()) {
        const val = snap.val();
        return Object.values(val) as FirebaseHealthRecord[];
      }
    } catch (err) {
      console.warn("[Firebase] Error fetching health records:", err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_HEALTH_RECORDS_KEY);
    if (raw) {
      const store = JSON.parse(raw);
      if (store[animalId]) {
        return Object.values(store[animalId]) as FirebaseHealthRecord[];
      }
    }
  } catch {}
  return [];
}

/**
 * 3. Store Vet Alert in Firebase: vetAlerts/{alertId}
 */
export async function createVetAlertInFirebase(
  alertData: Omit<FirebaseVetAlert, "alertId">
): Promise<string> {
  const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const payload: FirebaseVetAlert = {
    ...alertData,
    alertId,
    timestamp: alertData.timestamp || new Date().toISOString()
  };

  if (db) {
    try {
      const alertRef = dbRef(db, `vetAlerts/${alertId}`);
      await set(alertRef, payload);
      return alertId;
    } catch (err) {
      console.warn("[Firebase] Error creating vet alert:", err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_VET_ALERTS_KEY);
    const store = raw ? JSON.parse(raw) : [];
    store.unshift(payload);
    localStorage.setItem(LOCAL_VET_ALERTS_KEY, JSON.stringify(store));
  } catch {}
  return alertId;
}

/**
 * 4. Upload Captured/Uploaded Animal Image to Firebase Storage
 * Stores only image URL/reference in Realtime Database.
 */
export async function uploadAnimalImageToStorage(
  imageBlobOrBase64: Blob | string,
  animalId: string
): Promise<string> {
  const filename = `scan-${Date.now()}.jpg`;
  const storagePath = `user_images/${animalId || "unregistered"}/${filename}`;

  if (storage) {
    try {
      let blob: Blob;
      if (typeof imageBlobOrBase64 === "string") {
        const base64Data = imageBlobOrBase64.includes("base64,")
          ? imageBlobOrBase64.split("base64,")[1]
          : imageBlobOrBase64;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: "image/jpeg" });
      } else {
        blob = imageBlobOrBase64;
      }

      const fileRef = storageRef(storage, storagePath);
      const snapshot = await uploadBytes(fileRef, blob, {
        contentType: "image/jpeg",
        customMetadata: { animalId, capturedAt: new Date().toISOString() }
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn("[Firebase Storage] Upload error, falling back to data URL reference:", err);
    }
  }

  // If storage is not yet connected or offline, use base64 data URL
  if (typeof imageBlobOrBase64 === "string") {
    return imageBlobOrBase64.startsWith("data:")
      ? imageBlobOrBase64
      : `data:image/jpeg;base64,${imageBlobOrBase64}`;
  }
  return URL.createObjectURL(imageBlobOrBase64);
}
