"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, setDoc, query, where, orderBy, limit } from "firebase/firestore";
import * as faceapi from "face-api.js";

const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

export const BackgroundScanner = () => {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const runBackgroundScan = async () => {
      const user = auth.currentUser;
      if (!user || isScanning) return;

      try {
        // 1. Check if scan is needed
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        
        const userData = userSnap.data();
        const lastScanAt = userData.lastScanAt || "1970-01-01T00:00:00Z";
        
        // Only scan if profile photo exists
        if (!userData.photoURL) return;

        setIsScanning(true);
        console.log("[Neural Worker] Initiating background discovery session...");

        // 2. Load Models
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        // 3. Get Reference Descriptor
        const refImg = await faceapi.fetchImage(userData.photoURL);
        const refDetection = await faceapi.detectSingleFace(refImg).withFaceLandmarks().withFaceDescriptor();
        
        if (!refDetection) {
          console.warn("[Neural Worker] Reference identity extraction failed.");
          setIsScanning(false);
          return;
        }
        
        const faceMatcher = new faceapi.FaceMatcher(refDetection);

        // 4. Fetch New Archive Images (Since lastScanAt)
        const archiveQuery = query(
          collection(db, "archive"), 
          where("type", "==", "image"),
          where("createdAt", ">", lastScanAt),
          limit(20) // Process in small batches to avoid blocking
        );
        const archiveSnap = await getDocs(archiveQuery);
        
        if (archiveSnap.empty) {
          console.log("[Neural Worker] Archive synchronized. No new frames to analyze.");
          setIsScanning(false);
          return;
        }

        console.log(`[Neural Worker] Analyzing ${archiveSnap.size} new multimedia frames...`);

        // 5. Scan and Update
        for (const archiveDoc of archiveSnap.docs) {
          const item = archiveDoc.data();
          try {
            const img = await faceapi.fetchImage(item.url);
            const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
            const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
            const isMe = results.some(r => r.label !== 'unknown' && r.distance < 0.6);

            if (isMe) {
              const matchId = btoa(item.url).replace(/[^a-zA-Z0-9]/g, "");
              const memoryRef = doc(db, "users", user.uid, "found_memories", matchId);
              await setDoc(memoryRef, {
                ...item,
                detectedAt: new Date().toISOString(),
                isVerified: true
              });
              console.log("[Neural Worker] Verified match discovered and sealed in ledger.");
            }
          } catch (err) {
            console.warn("[Neural Worker] Frame analysis disruption:", item.url);
          }
        }

        // 6. Update lastScanAt
        await updateDoc(userRef, {
          lastScanAt: new Date().toISOString()
        });

        console.log("[Neural Worker] Background discovery finalized.");
      } catch (err) {
        console.error("[Neural Worker] Critical failure:", err);
      } finally {
        setIsScanning(false);
      }
    };

    // Run after a short delay to let the UI settle
    const timer = setTimeout(runBackgroundScan, 5000);
    return () => clearTimeout(timer);
  }, []);

  return null; // Invisible component
};
