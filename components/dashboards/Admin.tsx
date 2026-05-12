'use client'

import React from 'react';
import { 
  Users, 
  Trash2, 
  ShieldCheck, 
  CreditCard,
  Search,
  MoreVertical,
  Activity
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui/Base';
import { useAdmin } from '@/hooks/useAdmin.hooks';
import { motion } from 'framer-motion';

export function AdminDashboard() {
  const { users, loading, deleteUser, updatePlan } = useAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-white">
            Commander <span className="text-brand-orange">Panel</span>
          </h2>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] mt-2">Gestión de Socios y Plataforma</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input className="pl-11 w-64" placeholder="Buscar socio..." />
          </div>
          <Button variant="primary">Nuevo Registro</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Socios Activos', value: '1,248', icon: Users, color: 'brand-orange' },
          { label: 'Uso Hoy', value: '86%', icon: Activity, color: 'green-500' },
          { label: 'Retención', value: '94%', icon: ShieldCheck, color: 'blue-500' }
        ].map((stat, i) => (
          <Card key={i} className="p-8 border-zinc-900 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-${stat.color}/5 text-${stat.color} border border-${stat.color}/10`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-900">
                <th className="p-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Socio</th>
                <th className="p-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Plan</th>
                <th className="p-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Estado</th>
                <th className="p-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Actividad</th>
                <th className="p-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 overflow-hidden border border-zinc-800">
                        <img src={user.avatarUrl} alt={user.name} />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{user.name}</p>
                        <p className="text-[10px] text-zinc-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3 h-3 text-zinc-600" />
                      <span className="text-xs font-bold text-zinc-400">{user.plan}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{user.lastActivity}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
