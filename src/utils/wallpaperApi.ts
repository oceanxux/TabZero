// 壁纸源类型
export type WallpaperSource = 'bing';

export interface WallpaperInfo {
  url: string;
  source: WallpaperSource;
  title?: string;
}

// 洗牌算法
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 精选 120 张 100% 独立不重复 Bing 高清摄影大片（国内 CDN 秒开）
export async function fetchRandomWallpaper(): Promise<WallpaperInfo> {
  let list: Array<{ url: string; title?: string }> = [];
  try {
    const raw = localStorage.getItem('tabzero_wall_playlist');
    if (raw) list = JSON.parse(raw);
  } catch {}

  let pIdx = parseInt(localStorage.getItem('tabzero_wall_idx') || '0', 10);
  if (!Array.isArray(list) || list.length === 0 || pIdx >= list.length) {
    // 从全量池打乱洗牌
    const pool = (window as any).tzBingPool || [];
    list = shuffle(pool);
    const cur = localStorage.getItem('tabzero_wallpaper_data');
    if (list[0] && list[0].url === cur && list.length > 1) {
      [list[0], list[1]] = [list[1], list[0]];
    }
    pIdx = 0;
  }

  const picked = list[pIdx] || { url: 'https://cn.bing.com/th?id=OHR.TrianaSpain_ZH-CN6329291776_1920x1080.jpg', title: '艺术与韵律交汇之地' };
  pIdx++;

  try {
    localStorage.setItem('tabzero_wall_playlist', JSON.stringify(list));
    localStorage.setItem('tabzero_wall_idx', String(pIdx));
  } catch {}

  localStorage.setItem('tabzero_wallpaper_data', picked.url);
  return { url: picked.url, source: 'bing', title: picked.title };
}
