import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc,
  orderBy,
  addDoc
} from 'firebase/firestore';
import { z } from 'zod';

// --- SCHEMAS PRO ---

export const PrescribedExerciseSchema = z.object({
  name: z.string().min(1),
  prescribed: z.object({
    sets: z.number().min(1),
    reps: z.string().min(1),
    load: z.string().optional(),
    rpe: z.number().min(1).max(10).optional(),
    rest: z.string().optional(),
  }),
  notes: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

export const DaySchema = z.object({
  order: z.number(),
  name: z.string(),
  blocks: z.array(z.object({
    type: z.enum(['warmup', 'main', 'accessory', 'finisher']),
    exercises: z.array(PrescribedExerciseSchema),
  })),
});

export const TrainingWeekSchema = z.object({
  id: z.string().optional(),
  planId: z.string(),
  order: z.number(),
  type: z.enum(['base', 'deload', 'peak', 'test']).default('base'),
  goal: z.string().optional(),
  days: z.array(DaySchema),
});

export const TrainingPlanSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(['template', 'assignment']),
  userId: z.string().optional(), // Socio email si es assignment
  instructorId: z.string(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  weeksCount: z.number().default(4),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  startDate: z.any().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const SetRecordSchema = z.object({
  reps: z.number(),
  weight: z.number(),
  rpe: z.number().min(1).max(10).optional(),
  rest: z.string().optional(),
});

export const WorkoutSessionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  planId: z.string(),
  weekOrder: z.number(),
  dayOrder: z.number(),
  date: z.any(),
  duration: z.number().optional(), // minutes
  feeling: z.enum(['tired', 'good', 'great', 'injured']).optional(),
  energy: z.number().min(1).max(10).optional(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.array(SetRecordSchema),
  })),
  notes: z.string().optional(),
});

export type TrainingPlan = z.infer<typeof TrainingPlanSchema>;
export type TrainingWeek = z.infer<typeof TrainingWeekSchema>;
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;
export type Exercise = z.infer<typeof PrescribedExerciseSchema>;

export class RoutineService {
  private plansRef = collection(db, 'training_plans');
  private weeksRef = collection(db, 'training_weeks');
  private sessionsRef = collection(db, 'workout_sessions');

  // --- PLANS ---
  async createPlan(planData: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const validated = TrainingPlanSchema.parse(planData);
    // Firestore does not allow undefined. Filter them out.
    const cleanData = Object.fromEntries(
      Object.entries(validated).filter(([_, v]) => v !== undefined)
    );
    const docRef = await addDoc(this.plansRef, {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async getPlanTemplates(): Promise<TrainingPlan[]> {
    const q = query(this.plansRef, where('type', '==', 'template'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingPlan));
  }

  async getUserActivePlan(userId: string): Promise<TrainingPlan | null> {
    const q = query(this.plansRef, where('userId', '==', userId), where('status', '==', 'active'));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as TrainingPlan;
  }

  // --- WEEKS ---
  async saveWeek(weekData: Omit<TrainingWeek, 'id'>): Promise<string> {
    const validated = TrainingWeekSchema.parse(weekData);
    // Filter undefined
    const cleanData = Object.fromEntries(
      Object.entries(validated).filter(([_, v]) => v !== undefined)
    );
    const newDocRef = doc(this.weeksRef);
    await setDoc(newDocRef, cleanData);
    return newDocRef.id;
  }

  async getPlanWeeks(planId: string): Promise<TrainingWeek[]> {
    const q = query(this.weeksRef, where('planId', '==', planId));
    const snap = await getDocs(q);
    // Sort in memory to avoid complex index requirements
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as TrainingWeek))
      .sort((a, b) => a.order - b.order);
  }

  // --- ASSIGNMENT (CLONING) ---
  async assignPlanToUser(templateId: string, userId: string, instructorId: string): Promise<string> {
    const templateSnap = await getDoc(doc(this.plansRef, templateId));
    if (!templateSnap.exists()) throw new Error('Template not found');
    
    const template = templateSnap.data() as TrainingPlan;
    
    // 1. Create assigned plan
    const assignedPlanId = await this.createPlan({
      ...template,
      type: 'assignment',
      userId,
      instructorId,
      status: 'active',
      startDate: serverTimestamp(),
    });

    // 2. Clone all weeks
    const weeks = await this.getPlanWeeks(templateId);
    for (const week of weeks) {
      const { id, ...weekContent } = week;
      await this.saveWeek({
        ...weekContent,
        planId: assignedPlanId
      });
    }

    return assignedPlanId;
  }

  // --- SESSIONS (EXECUTION) ---
  async recordSession(sessionData: Omit<WorkoutSession, 'id'>): Promise<string> {
    const validated = WorkoutSessionSchema.parse(sessionData);
    const cleanData = Object.fromEntries(
      Object.entries(validated).filter(([_, v]) => v !== undefined)
    );
    const docRef = await addDoc(this.sessionsRef, {
      ...cleanData,
      date: serverTimestamp(),
    });
    return docRef.id;
  }

  async getUserSessions(userId: string): Promise<WorkoutSession[]> {
    const q = query(this.sessionsRef, where('userId', '==', userId), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutSession));
  }

  // --- MASTER EXERCISES ---
  async getMasterExercises(): Promise<Exercise[]> {
    const exRef = collection(db, 'exercises');
    const snap = await getDocs(query(exRef, orderBy('name', 'asc')));
    return snap.docs.map(d => d.data() as Exercise);
  }

  async addMasterExercise(ex: Exercise): Promise<void> {
    const exRef = doc(collection(db, 'exercises'), ex.name.toLowerCase().replace(/\s+/g, '_'));
    await setDoc(exRef, ex);
  }

  // Updated to combine master and discovered exercises
  async getAllExercises(): Promise<Exercise[]> {
    const master = await this.getMasterExercises();
    
    // Discover from plans (legacy/dynamic)
    const snap = await getDocs(this.weeksRef);
    const discovered: Map<string, Exercise> = new Map();

    snap.docs.forEach(doc => {
      const week = doc.data() as TrainingWeek;
      week.days.forEach(day => {
        day.blocks.forEach(block => {
          block.exercises.forEach(ex => {
            if (!discovered.has(ex.name.toLowerCase())) {
              discovered.set(ex.name.toLowerCase(), ex);
            }
          });
        });
      });
    });

    // Merge: Master takes priority or just combine unique names
    const final: Map<string, Exercise> = new Map();
    master.forEach(ex => final.set(ex.name.toLowerCase(), ex));
    discovered.forEach((ex, name) => {
      if (!final.has(name)) final.set(name, ex);
    });

    return Array.from(final.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const routineService = new RoutineService();
