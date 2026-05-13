"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { LogIn, Trophy, Timer, Flame, ArrowRight, Target } from "lucide-react";
import { motion } from "motion/react";
import { StreakWidget } from "@/components/StreakWidget";
import { TimerTools } from "@/components/TimerTools";
import { StreakService, TrainingDay } from "@/services/StreakService";

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [history, setHistory] = useState<TrainingDay[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to user data
    const unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (ds) => {
      if (ds.exists()) {
        setUserData(ds.data());
      } else {
        // Initialize user
        const initial = {
          userId: user.uid,
          displayName: user.displayName || "Socio",
          currentStreak: 0,
          maxStreak: 0,
          lastActivityDate: null
        };
        setDoc(doc(db, "users", user.uid), initial);
      }
    });

    // Listen to history
    const unsubscribeHistory = onSnapshot(collection(db, "users", user.uid, "history"), (qs) => {
      const h: TrainingDay[] = [];
      qs.forEach(doc => h.push(doc.data() as TrainingDay));
      setHistory(h);
    });

    return () => {
      unsubscribeUser();
      unsubscribeHistory();
    };
  }, [user]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const streakService = new StreakService(history);
  const currentStreak = streakService.calculateCurrentStreak();
  const lastDays = streakService.getStatusForLastDays(7);

  const markDay = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    
    // Check if yesterday was missed to reset streak in main doc
    // But calculateCurrentStreak handles it.
    
    await setDoc(doc(db, "users", user.uid, "history", today), {
      date: today,
      timestamp: new Date().toISOString(),
      type: "training"
    });

    // Update main streak data
    const newStreak = currentStreak + 1; // Simplification
    const newMax = Math.max(userData?.maxStreak || 0, newStreak);

    await setDoc(doc(db, "users", user.uid), {
      currentStreak: newStreak,
      maxStreak: newMax,
      lastActivityDate: new Date().toISOString()
    }, { merge: true });
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-24 h-24 bg-gray-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Flame className="w-12 h-12 text-white fill-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter italic">GYM DE LA COSTA</h1>
            <p className="text-gray-500 mb-12 max-w-xs mx-auto font-medium">Entrena con las mejores herramientas. Sigue tu racha y alcanza tus metas.</p>
            <button onClick={login} className="bg-gray-900 text-white px-12 py-5 rounded-3xl font-bold hover:shadow-xl transition-all flex items-center gap-4 mx-auto group">
                Empieza Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 lg:p-12 pb-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header Section */}
        <div className="lg:col-span-12 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                Hola, {user.displayName?.split(" ")[0]} 🚀
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Nivel Socio Élite</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
            <img src={user.photoURL || ""} alt="Avatar" referrerPolicy="no-referrer" />
          </div>
        </div>

        {/* Left Column: Streaks & Stats */}
        <div className="lg:col-span-4 space-y-8">
          <StreakWidget 
            streak={currentStreak} 
            maxStreak={userData?.maxStreak || 0} 
            history={lastDays} 
            onManualMark={markDay}
          />
          
          <div className="bg-gray-900 p-8 rounded-3xl text-white relative overflow-hidden group">
            <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Desafío Semanal</p>
            <h4 className="text-xl font-black mb-4">5 Días de Fuego</h4>
            <div className="w-full bg-white/20 h-2 rounded-full mb-2">
                <div className="bg-white h-full rounded-full" style={{ width: `${(currentStreak/5)*100}%` }}></div>
            </div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                ¡Mantén el ritmo! Faltan {Math.max(0, 5 - currentStreak)} sesiones para el bonus.
            </p>
          </div>
        </div>

        {/* Right Column: Timer Tools */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight italic">Panel de Entrenamiento</h2>
           </div>
           <TimerTools />
           
           <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Entrenado</p>
                        <p className="text-xl font-black text-gray-900">{history.length} Veces</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-2xl">
                        <Target className="w-6 h-6 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Próxima Meta</p>
                        <p className="text-xl font-black text-gray-900">10 Días</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-500">
                        <LogIn className="w-6 h-6" />
                    </div>
                </div>
           </div>
        </div>

      </div>
    </main>
  );
}
