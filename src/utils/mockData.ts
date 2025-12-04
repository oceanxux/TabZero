import type { Bookmark, QuickLink } from '../types';

const generateId = () => {
    return '_' + Math.random().toString(36).slice(2, 9);
};
// 空的书签数据
export const MOCK_BOOKMARKS: Bookmark[] = [
    { id: generateId(), title: 'Chrome 应用商店', url: 'https://chromewebstore.google.com/?hl=zh-CN', color: '#333333', categoryId: 'dev', createdAt: Date.now(), visitCount: 15 },
    { id: generateId(), title: 'Gmail', url: 'https://mail.google.com/mail/u/0/?pli=1#inbox', color: '#f48024', categoryId: 'dev', createdAt: Date.now(), visitCount: 12 },
    { id: generateId(), title: 'YouTube', url: 'https://www.youtube.com/', color: '#000000', categoryId: 'dev', createdAt: Date.now(), visitCount: 8 },
];

// 空的快捷访问数据
export const MOCK_QUICKLINKS: QuickLink[] = [
];