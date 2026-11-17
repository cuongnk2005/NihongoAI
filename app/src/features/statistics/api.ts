import { BASE_URL } from '../../services/apiConfig';
export interface StudyStatistics {
  todayReviews: number;
  totalReviews: number;
  retentionPercent: number | null;
  streakDays: number;
  averageSeconds: number | null;
  timedReviews: number;
  days: { date: string; count: number }[];
  ratings: Record<string, number>;
}
async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}/statistics${path}`, options);
  if (!response.ok) throw new Error('Không kết nối được dữ liệu học tập. Vui lòng thử lại.');
  return response;
}
export async function getStatistics(): Promise<StudyStatistics> {
  return (await request('')).json();
}
export async function recordReview(id: string, cardKey: string, rating: string, durationMs: number) {
  await request('/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, cardKey, rating: rating.toUpperCase(), durationMs: Math.min(86400000, Math.max(0, Math.round(durationMs))) }) });
}
export async function undoReview(id: string) {
  await request(`/activities/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
