'use client';
import { UserProfile } from '@/services/user.service';
import PersonalInfo from '@/components/profile/PersonalInfo';
import StreakDisplay from '@/components/training/StreakDisplay';

export default function SocioDashboard({ profile }: { profile: UserProfile & { id: string } }) {
  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header>
          <h1 className="font-headline font-black italic text-4xl text-primary uppercase tracking-tighter">Hola, {profile.firstName}!</h1>
          <p className="font-body text-tertiary">Bienvenido de vuelta a Gym de la Costa.</p>
        </header>

        <StreakDisplay userId={profile.email} weeklyTrainingGoal={profile.weeklyTrainingGoal} />
        
        <PersonalInfo profile={profile} />
      </div>
    </div>
  );
}
