"use client";

import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function PresenceTracker() {
  useEffect(() => {
    console.log("PresenceTracker: Component mounted");
    console.log("PresenceTracker: Current Auth instance:", !!auth);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("PresenceTracker: Auth state changed. User:", user ? user.uid : "None");
      
      if (user) {
        const userRef = doc(db, "users", user.uid);
        console.log("PresenceTracker: Tracking presence for UID:", user.uid);
        
        // Initial mark as online
        const setOnline = () => {
          updateDoc(userRef, {
            status: 'online',
            onlineSince: serverTimestamp(),
            lastSeen: serverTimestamp()
          })
          .then(() => console.log("PresenceTracker: Successfully marked ONLINE"))
          .catch(err => console.error("Presence Error (Online):", err));
        };

        const setOffline = () => {
          updateDoc(userRef, {
            status: 'offline',
            lastSeen: serverTimestamp()
          })
          .then(() => console.log("PresenceTracker: Successfully marked OFFLINE"))
          .catch(err => console.error("Presence Error (Offline):", err));
        };

        // Mark as online on startup
        setOnline();

        // Heartbeat every 30 seconds to keep lastSeen fresh
        const heartbeat = setInterval(() => {
          if (document.visibilityState === 'visible') {
            updateDoc(userRef, {
              lastSeen: serverTimestamp()
            }).catch(err => console.error("Heartbeat Error:", err));
          }
        }, 30000);

        const handlePresence = () => {
          if (document.visibilityState === 'hidden') {
            setOffline();
          } else {
            setOnline();
          }
        };

        const handleUnload = () => {
          // Navigator.sendBeacon is better for unload but needs an API endpoint
          // For now, we rely on the hidden state trigger which fires before unload
          setOffline();
        };

        window.addEventListener("beforeunload", handleUnload);
        document.addEventListener("visibilitychange", handlePresence);
        window.addEventListener("focus", setOnline);
        window.addEventListener("blur", setOffline);

        return () => {
          clearInterval(heartbeat);
          window.removeEventListener("beforeunload", handleUnload);
          document.removeEventListener("visibilitychange", handlePresence);
          window.removeEventListener("focus", setOnline);
          window.removeEventListener("blur", setOffline);
          setOffline();
        };

      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
