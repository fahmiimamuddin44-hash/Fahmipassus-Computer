import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function WhatsAppButton() {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().storePhone) {
          setPhone(docSnap.data().storePhone);
        }
      } catch (error) {
        console.error("Error fetching phone:", error);
      }
    };
    fetchPhone();
  }, []);

  if (!phone) return null;

  return (
    <a
      href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all hover:scale-110"
      title="Chat via WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  );
}
