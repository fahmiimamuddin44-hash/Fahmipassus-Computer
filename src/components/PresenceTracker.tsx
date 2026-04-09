import { useEffect, useRef } from "react";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function PresenceTracker() {
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(2, 15));
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updatePresence = async (uid?: string | null) => {
      try {
        const sessionRef = doc(db, "active_sessions", sessionIdRef.current);
        await setDoc(sessionRef, {
          lastSeen: serverTimestamp(),
          userId: uid || null,
          isAnonymous: !uid
        }, { merge: true });
      } catch (error) {
        // Silently fail for presence updates to avoid cluttering logs
        console.debug("Presence update failed", error);
      }
    };

    const cleanup = async () => {
      try {
        const sessionRef = doc(db, "active_sessions", sessionIdRef.current);
        await deleteDoc(sessionRef);
      } catch (error) {
        console.debug("Presence cleanup failed", error);
      }
    };

    // Initial update
    updatePresence(auth.currentUser?.uid);

    // Set up heartbeat every 60 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      updatePresence(auth.currentUser?.uid);
    }, 60000);

    // Listen for auth changes to update presence with UID
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      updatePresence(user?.uid);
    });

    // Cleanup on unmount or tab close
    window.addEventListener("beforeunload", cleanup);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      unsubscribeAuth();
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, []);

  return null;
}
