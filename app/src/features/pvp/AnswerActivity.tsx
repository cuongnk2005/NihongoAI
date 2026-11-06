import { Room } from './api';
import { avatarIcon } from './Leaderboard';

export function AnswerActivity({ room }: { room: Room }) {
  const players = room.players.filter(p => p.answered);
  return <div className="quiz-answer-activity" aria-label="Người đã trả lời">
    {players.length === 0 ? <span className="quiz-awaiting">Đang chờ câu trả lời đầu tiên…</span>
      : <div className="quiz-answer-track" role="list">{players.map(player => <div
        className={`quiz-answer-chip ${player.id === room.you ? 'is-me' : ''}`}
        key={`${room.code}-${room.round}-${player.id}`} role="listitem" title={`${player.name} đã trả lời`}>
        <span className="quiz-avatar-orbit"><span className="quiz-chip-avatar" role="img" aria-label={player.avatar}>{avatarIcon(player.avatar)}</span><span className="quiz-chip-check" aria-label="Đã trả lời">✓</span></span>
        <span className="quiz-chip-name">{player.name}</span>
      </div>)}</div>}
  </div>;
}
