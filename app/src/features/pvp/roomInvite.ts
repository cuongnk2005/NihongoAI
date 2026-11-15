export interface RoomInvite { code: string; base: string }

function apiUrl(value: string, page: URL): string {
  const api = new URL(value, page);
  if (!['http:', 'https:'].includes(api.protocol) || api.username || api.password || api.search || api.hash)
    throw new Error('Địa chỉ máy chủ trong link mời không hợp lệ.');
  if (page.protocol === 'https:' && api.protocol !== 'https:') throw new Error('Link mời cần dùng máy chủ HTTPS.');
  return api.href.replace(/\/$/, '');
}
export function readRoomInvite(href: string, defaultBase: string): { invite: RoomInvite | null; error: string } {
  try {
    const page = new URL(href); const code = page.searchParams.get('room');
    if (code === null) return { invite: null, error: '' };
    if (!/^[A-Z0-9]{6}$/i.test(code)) throw new Error('Mã phòng trong link mời không hợp lệ.');
    return { invite: { code: code.toUpperCase(), base: apiUrl(page.searchParams.get('api') || defaultBase, page) }, error: '' };
  } catch (e) { return { invite: null, error: e instanceof Error ? e.message : 'Link mời không hợp lệ.' }; }
}
export function buildRoomInvite(href: string, code: string, base: string, defaultBase: string): string {
  if (!/^[A-Z0-9]{6}$/i.test(code)) throw new Error('Mã phòng không hợp lệ.');
  const page = new URL(href); const api = apiUrl(base, page);
  page.search = ''; page.hash = ''; page.searchParams.set('room', code.toUpperCase());
  if (api !== apiUrl(defaultBase, page)) page.searchParams.set('api', api);
  return page.href;
}
