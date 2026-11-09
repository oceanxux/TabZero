// 壁纸源类型
export type WallpaperSource = 'bing';

export interface WallpaperInfo {
  url: string;
  source: WallpaperSource;
  title?: string;
}

const tzMarkets = ['zh-CN', 'en-US', 'ja-JP', 'de-DE', 'en-GB', 'fr-FR', 'en-CA', 'en-AU'];

export const tzBingPool = [
  { url: 'https://cn.bing.com/th?id=OHR.TrianaSpain_ZH-CN6329291776_1920x1080.jpg', title: '艺术与韵律交汇之地' },
  { url: 'https://cn.bing.com/th?id=OHR.DiwaliLamps_ZH-CN2462894749_1920x1080.jpg', title: '光芒四射的节日' },
  { url: 'https://cn.bing.com/th?id=OHR.DakotaBison_ZH-CN2302503868_1920x1080.jpg', title: '归来的草原巨兽' },
  { url: 'https://cn.bing.com/th?id=OHR.PipiwaiTrail_ZH-CN1811194311_1920x1080.jpg', title: '穿越毛伊岛的绿色隧道' },
  { url: 'https://cn.bing.com/th?id=OHR.StileCrossing_ZH-CN9811465935_1920x1080.jpg', title: '向山巅再迈一步' },
  { url: 'https://cn.bing.com/th?id=OHR.HudsonBear_ZH-CN6630706907_1920x1080.jpg', title: '写在冰上的未来' },
  { url: 'https://cn.bing.com/th?id=OHR.SchwarzwaldAutumn_ZH-CN6323627599_1920x1080.jpg', title: '林间迷雾' },
  { url: 'https://cn.bing.com/th?id=OHR.AutumnChina_ZH-CN7665959692_1920x1080.jpg', title: '秋意浓郁' },
  { url: 'https://cn.bing.com/th?id=OHR.AlpineBraies_ZH-CN7307997866_1920x1080.jpg', title: '高山湖泊' }
];

// 多国家全球 Bing 官方极速 CDN 壁纸获取
export async function fetchRandomWallpaper(): Promise<WallpaperInfo> {
  let pool: Array<{ url: string; title?: string }> = [];
  try {
    const raw = localStorage.getItem('tabzero_bing_cache');
    if (raw) pool = JSON.parse(raw);
  } catch {}
  if (!Array.isArray(pool) || pool.length === 0) {
    pool = [...tzBingPool];
  }

  try {
    const mIdx = parseInt(localStorage.getItem('tabzero_mkt_idx') || '0', 10);
    const mkt = tzMarkets[mIdx % tzMarkets.length];
    localStorage.setItem('tabzero_mkt_idx', String((mIdx + 1) % tzMarkets.length));

    const resp = await fetch(`https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=${mkt}`);
    const data = await resp.json();
    if (data && Array.isArray(data.images)) {
      const currentUrls = new Set(pool.map(x => x.url));
      for (const img of data.images) {
        if (img.urlbase) {
          const full = `https://cn.bing.com${img.urlbase}_1920x1080.jpg`;
          if (!currentUrls.has(full)) {
            pool.push({ url: full, title: img.title || '' });
            currentUrls.add(full);
          }
        }
      }
      try {
        localStorage.setItem('tabzero_bing_cache', JSON.stringify(pool));
      } catch {}
    }
  } catch (err) {
    console.warn('Rotating Bing multi-market:', err);
  }

  const cur = localStorage.getItem('tabzero_wallpaper_data');
  const candidates = pool.filter(x => x.url !== cur);
  const picked = candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : pool[Math.floor(Math.random() * pool.length)];

  localStorage.setItem('tabzero_wallpaper_data', picked.url);
  return { url: picked.url, source: 'bing', title: picked.title };
}
