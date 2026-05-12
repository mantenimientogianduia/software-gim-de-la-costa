'use client'

import React, { useState } from 'react';
import { Shell } from '@/components/Shell';
import { Overview } from '@/components/dashboards/Overview';
import { Community } from '@/components/dashboards/Community';
import { TimerPro } from '@/components/dashboards/TimerPro';
import { AdminDashboard } from '@/components/dashboards/Admin';
import { AccessControl } from '@/components/dashboards/Access';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'community': return <Community />;
      case 'timer': return <TimerPro />;
      case 'admin': return <AdminDashboard />;
      case 'access': return <AccessControl />;
      default: return <Overview />;
    }
  };

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Shell>
  );
}
