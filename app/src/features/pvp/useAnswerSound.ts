import { useCallback, useEffect, useRef, useState } from 'react';
import type { Room } from './api';

/** Local synthesized sound: no download, microphone permission, or external audio service. */
export function useAnswerSound(room: Room | null) {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem('quiz-answer-sound') !== 'off'; } catch { return true; }
  });
  const context = useRef<AudioContext | null>(null);
  const seen = useRef<{ round: string; ids: Set<number> } | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const unlock = useCallback(() => {
    if (!enabledRef.current || typeof AudioContext === 'undefined') return;
    try {
      const audio = context.current ?? new AudioContext(); context.current = audio;
      if (audio.state === 'suspended') void audio.resume().catch(() => {});
    } catch { /* Browsers without audio support still allow normal play. */ }
  }, []);
  useEffect(() => {
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock);
      const audio = context.current; context.current = null;
      if (audio && audio.state !== 'closed') void audio.close().catch(() => {});
    };
  }, [unlock]);

  useEffect(() => {
    if (!room) { seen.current = null; return; }
    const round = `${room.code}:${room.round}`;
    const answered = room.players.filter(p => p.answered);
    // On reconnect, establish a baseline rather than replaying every old answer.
    if (!seen.current) { seen.current = { round, ids: new Set(answered.map(p => p.id)) }; return; }
    if (seen.current.round !== round) seen.current = { round, ids: new Set() };
    const arrivals = answered.filter(p => !seen.current!.ids.has(p.id));
    answered.forEach(p => seen.current!.ids.add(p.id));
    const audio = context.current;
    if (!arrivals.length || !enabled || !audio || audio.state !== 'running') return;
    // Coalesce bursts of simultaneous replies so a large room stays comfortable to hear.
    try {
      const start = audio.currentTime;
      const oscillator = audio.createOscillator(); const volume = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(780, start);
      oscillator.frequency.exponentialRampToValueAtTime(1180, start + 0.045);
      oscillator.frequency.exponentialRampToValueAtTime(640, start + 0.13);
      volume.gain.setValueAtTime(0.001, start);
      volume.gain.exponentialRampToValueAtTime(0.075, start + 0.012);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
      oscillator.connect(volume); volume.connect(audio.destination);
      oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
      oscillator.start(start); oscillator.stop(start + 0.17);
    } catch { /* Sound must never interrupt answer submission. */ }
  }, [room, enabled]);

  const toggle = () => {
    const next = !enabled; enabledRef.current = next; setEnabled(next);
    try { localStorage.setItem('quiz-answer-sound', next ? 'on' : 'off'); } catch { /* optional preference */ }
    if (next) unlock();
  };
  return { soundEnabled: enabled, toggleSound: toggle };
}
