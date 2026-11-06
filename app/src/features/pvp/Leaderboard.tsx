import { Room } from './api';
import { useLayoutEffect, useRef } from 'react';

export const AVATARS = [
  ['fox', '🦊', 'Cáo'], ['cat', '🐱', 'Mèo'], ['panda', '🐼', 'Gấu trúc'],
  ['rabbit', '🐰', 'Thỏ'], ['frog', '🐸', 'Ếch'], ['tiger', '🐯', 'Hổ'],
  ['bear', '🐻', 'Gấu'], ['penguin', '🐧', 'Chim cánh cụt'], ['owl', '🦉', 'Cú'],
  ['dragon', '🐲', 'Rồng'], ['dog', '🐶', 'Chó'], ['koala', '🐨', 'Koala'],
] as const;
export function avatarIcon(id: string) { return AVATARS.find(a => a[0] === id)?.[1] || '🦊'; }
export function rankedPlayers(room: Room) {
  return [...room.players].sort((a, b) => b.score - a.score || a.id - b.id);
}
export function Leaderboard({ room, results = false }: { room: Room; results?: boolean }) {
  const players = rankedPlayers(room);
  const race = useRef<HTMLDivElement>(null);
  const positions = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const next = new Map<string, number>();
    race.current?.querySelectorAll<HTMLElement>('[data-player]').forEach(node => {
      const id = node.dataset.player!;
      const left = node.offsetLeft;
      const previous = positions.current.get(id);
      next.set(id, left);
      if (previous !== undefined && previous !== left && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        node.animate([{ transform: `translateX(${previous - left}px)` }, { transform: 'translateX(0)' }], { duration: 500, easing: 'ease-out' });
      }
    });
    positions.current = next;
  });
  const revealed = ['REVEAL', 'RANKING', 'FINISHED'].includes(room.phase);
  const rank = (score: number) => players.findIndex(p => p.score === score) + 1;
  return <section className="pvp-card quiz-leaderboard" aria-label="Bảng xếp hạng">
    <div className="quiz-section-heading"><h2>{results ? 'Bảng xếp hạng' : 'Đường đua từ vựng'}</h2><small>{players.length} người chơi · Điểm cao nhất bên trái</small></div>
    {players.length === 0 ? <p>Chưa có người chơi. Chia sẻ mã phòng để mời bạn bè!</p> : <>
      <div className="quiz-race" role="list" ref={race}>{players.map(p => <div role="listitem" data-player={p.id} className={`quiz-racer ${p.id === room.you ? 'is-me' : ''}`} key={p.id}>
        <span className="quiz-rank">#{rank(p.score)}</span><span className="quiz-avatar" role="img" aria-label={p.avatar}>{avatarIcon(p.avatar)}</span>
        <strong title={p.name}>{p.name}{p.id === room.you ? ' · Bạn' : ''}</strong><b>{p.score.toLocaleString()} đ</b>
        <small>{revealed ? `+${p.earned} · ${p.elapsedMs === null ? 'Không trả lời' : `${(p.elapsedMs / 1000).toFixed(1)}s`}` : p.answered ? '✓ Đã trả lời' : room.phase === 'WAITING' ? 'Sẵn sàng' : 'Đang suy nghĩ…'}</small>
      </div>)}</div>
      {results && <ol className="quiz-ranking-list">{players.map(p => <li key={p.id} className={p.id === room.you ? 'is-me' : ''}><b>#{rank(p.score)}</b><span className="quiz-list-avatar">{avatarIcon(p.avatar)}</span><span>{p.name}{p.id === room.you && ' · Bạn'}</span><strong>{p.score.toLocaleString()} đ</strong><small>+{p.earned}</small></li>)}</ol>}
    </>}
  </section>;
}
