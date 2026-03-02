'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { gamificationService } from '@/services/gamification.service';
import { ApiUserPointsSummary } from '@/types/api.types';
import { Pencil } from 'lucide-react';
import { ParticipantJourneysSection } from './components/ParticipantJourneysSection';
import { ResourcesFeedWidget } from './components/ResourcesFeedWidget';
import { AdminDashboardPanel } from './components/AdminDashboardPanel';

/* ─── Level progress from real API data ──────────────── */
function getLevelProgress(s: ApiUserPointsSummary) {
  const curMin  = s.current_level?.min_points ?? 0;
  const nextMin = s.next_level?.min_points;
  if (!nextMin) return { pct: 100, needed: 0, next: null };
  const range = nextMin - curMin;
  const pct   = range > 0 ? Math.round(((s.total_points - curMin) / range) * 100) : 100;
  return {
    pct:    Math.max(0, Math.min(100, pct)),
    needed: s.points_to_next_level ?? nextMin - s.total_points,
    next:   s.next_level?.name ?? null,
  };
}

const ROLE_LABELS: Record<string, string> = {
  Participant: 'Participante',
  Admin:       'Administrador',
  SuperAdmin:  'Super Admin',
  Subscriber:  'Suscriptor',
};

/* ─── Dashboard ──────────────────────────────────────── */
export function Dashboard() {
  const { user, viewMode } = useAuthStore();
  const [gamSummary, setGamSummary] = useState<ApiUserPointsSummary | null>(null);

  useEffect(() => {
    gamificationService.getUserSummary()
      .then(setGamSummary)
      .catch(() => setGamSummary(null));
  }, []);

  if (!user) return (
    <div className="flex flex-col items-center justify-center p-10">
      <p className="text-slate-500 mb-4">No hay sesión activa.</p>
      <Link href="/login" className="text-fuchsia-600 font-semibold underline">Ir al Login</Link>
    </div>
  );

  const initials      = user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const isParticipant = user.role === 'Participant';
  const isAdmin       = user.role === 'Admin' || user.role === 'SuperAdmin';
  const isSubscriber  = user.role === 'Subscriber';
  const isParticipantView = isParticipant || (isAdmin && viewMode === 'participant');

  // Hero card color tokens — participant vs admin
  const heroGradient   = isParticipantView ? 'from-sky-500 to-teal-600'                      : 'from-fuchsia-500 to-purple-700';
  const levelBadge     = isParticipantView ? 'bg-sky-50 text-sky-700 border-sky-100'          : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100';
  const progressBar    = isParticipantView ? 'from-sky-500 to-teal-500'                       : 'from-fuchsia-500 to-purple-600';
  const maxLevelText   = isParticipantView ? 'text-teal-600'                                  : 'text-fuchsia-600';
  const cardHoverBorder = isParticipantView ? 'hover:border-sky-200'                          : 'hover:border-fuchsia-200';

  const displayPts    = gamSummary?.total_points   ?? user.oasisScore;
  const levelName     = gamSummary?.current_level?.name ?? user.rank ?? '—';
  const levelProgress = gamSummary ? getLevelProgress(gamSummary) : null;

  return (
    <div className="flex flex-col gap-6">

      {/* ══════════════════════════════════════════════════
          PROFILE HERO CARD — full-width, prominent
      ══════════════════════════════════════════════════ */}
      <Link href="/profile">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden
                        cursor-pointer hover:shadow-lg ${cardHoverBorder} transition-shadow group relative`}
        >
          <div className="flex flex-col sm:flex-row">

            {/* Left gradient panel — avatar + score */}
            <div className={`bg-gradient-to-br ${heroGradient}
                            sm:w-52 p-6 flex flex-col items-center justify-center gap-4`}>
              {/* Avatar */}
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="relative w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30
                               flex items-center justify-center text-white font-bold text-3xl
                               overflow-hidden"
              >
                {user.avatarUrl
                  ? <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" sizes="80px" />
                  : initials}
              </motion.div>
              {/* Score */}
              <div className="text-center">
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-white tabular-nums block leading-none"
                >
                  {displayPts}
                </motion.span>
                <span className="text-white/60 text-xs mt-1 block">Oasis Score</span>
              </div>
            </div>

            {/* Right info panel */}
            <div className="p-6 flex flex-col justify-between flex-1 gap-4 min-w-0">
              {/* Name + role + level badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-800 leading-tight truncate">
                    {user.name}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">{ROLE_LABELS[user.role]}</p>
                </div>
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className={`px-3 py-1 ${levelBadge} text-xs font-semibold
                                   rounded-full whitespace-nowrap shrink-0 border`}
                >
                  {levelName}
                </motion.span>
              </div>

              {/* Progress bar */}
              <div>
                {levelProgress ? (
                  <>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Progreso al siguiente nivel</span>
                      <span className="font-medium tabular-nums">{levelProgress.pct}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress.pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                        className={`h-full bg-gradient-to-r ${progressBar}
                                   rounded-full`}
                      />
                    </div>
                    {levelProgress.next ? (
                      <p className="text-xs text-slate-400 mt-1.5">
                        <span className="tabular-nums">{levelProgress.needed}</span> pts para{' '}
                        <strong className="text-slate-600">{levelProgress.next}</strong>
                      </p>
                    ) : (
                      <p className={`text-xs ${maxLevelText} font-semibold mt-1.5`}>
                        Nivel máximo alcanzado
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-slate-200 animate-pulse rounded-full" />
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5">Cargando progreso...</p>
                  </>
                )}
              </div>

              {/* Hint */}
              <p className={`text-[11px] text-slate-300 ${isParticipantView ? 'group-hover:text-sky-400' : 'group-hover:text-fuchsia-400'} transition-colors
                            flex items-center gap-1`}>
                <Pencil size={10} /> Ver y editar perfil
              </p>
            </div>

          </div>
        </motion.div>
      </Link>

      {/* ══════════════════════════════════════════════════
          CTA BANNER — solo Admin / Subscriber
          (Participants see the banner inside ParticipantJourneysSection)
      ══════════════════════════════════════════════════ */}
      {isSubscriber && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-fuchsia-600 via-purple-500 to-fuchsia-400
                        rounded-2xl p-6 text-white shadow-sm overflow-hidden relative"
        >
          <div className="relative z-10">
            <h2 className="font-bold text-lg">Explora el contenido disponible</h2>
            <p className="text-white/80 text-sm mt-1">Accede a recursos y actividades abiertas.</p>
            <Link href="/resources">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-white/20 backdrop-blur-sm text-white
                               text-sm font-semibold px-4 py-2 rounded-xl border border-white/30
                               transition-colors"
              >
                Ver recursos
              </motion.button>
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-300/20 rounded-full blur-3xl" />
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════
          ROLE-SPECIFIC CONTENT
      ══════════════════════════════════════════════════ */}
      {isParticipantView && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <ParticipantJourneysSection />
          <ResourcesFeedWidget />
        </div>
      )}

      {isAdmin && viewMode === 'admin' && <AdminDashboardPanel user={user} />}

      {isSubscriber && <ResourcesFeedWidget />}

    </div>
  );
}
