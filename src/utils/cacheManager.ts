// src/utils/cacheManager.ts

const WALLPAPER_CACHE_NAME = 'tabzero-wallpaper-v1';

/**
 * 将新的壁纸 URL 存入浏览器缓存 (Cache API)，并删除旧的壁纸缓存。
 * 浏览器加载时会优先从 Cache API 中获取，实现即时显示。
 * @param newUrl - 新壁纸的 URL
 * @param oldUrl - 旧壁纸的 URL (可选)
 */
export const cacheAndCleanupWallpaper = async (newUrl: string, oldUrl?: string) => {
    if (!newUrl) return;

    try {
        // 确保 Cache API 可用
        if (!('caches' in window)) {
            console.warn('[Cache] Cache API 不可用，跳过缓存。');
            return;
        }

        const cache = await caches.open(WALLPAPER_CACHE_NAME);

        // 1. 缓存新的图片 (cache.add 会同时 fetch 并存储)
        // ⚠️ 注意：如果新 URL 没有 CORS 头部，可能会导致缓存失败，但图片仍然会直接加载。
        await cache.add(newUrl);
        console.log(`[Cache] 缓存新壁纸成功: ${newUrl}`);

        // 2. 删除旧的图片
        if (oldUrl && oldUrl !== newUrl) {
            // 创建一个 Request 对象来匹配缓存中的 URL
            const oldUrlAsRequest = new Request(oldUrl);
            const deleted = await cache.delete(oldUrlAsRequest);
            if (deleted) {
                console.log(`[Cache] 移除旧壁纸成功: ${oldUrl}`);
            }
        }

    } catch (e) {
        console.error('[Cache Error] 壁纸缓存失败 (可能与 CORS 有关):', e);
    }
};