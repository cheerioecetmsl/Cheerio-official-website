"use client";

import { useEffect } from "react";
import { runPulseScan } from "@/lib/pulse";
import { auth } from "@/lib/firebase";

export const BackgroundScanner = () => {
  useEffect(() => {
    const initiateBackgroundPulse = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const result = await runPulseScan();
      if (result.success) {
        console.log(`[Neural Worker] Discovery finalized. Match count: ${result.count}`);
      } else {
        // Silent log for background failures
        if (!result.error?.includes("IDENT_MISSING")) {
          console.debug("[Neural Worker] Background session paused:", result.error);
        }
      }
    };

    // Run after a short delay to let the UI settle
    const timer = setTimeout(initiateBackgroundPulse, 8000);
    return () => clearTimeout(timer);
  }, []);

  return null; // Invisible cinematic worker
};
