import type { Bookmark, QuickLink } from '../types';

const generateId = () => {
    return '_' + Math.random().toString(36).slice(2, 9);
};
// 空的书签数据
export const MOCK_BOOKMARKS: Bookmark[] = [
    { id: generateId(), title: 'Chrome 应用商店', url: 'https://chromewebstore.google.com/?hl=zh-CN', color: '#333333', categoryId: 'dev', createdAt: Date.now(), visitCount: 15 },
    { id: generateId(), title: 'Gmail', url: 'https://workspace.google.com/intl/zh-CN/gmail/', color: '#f48024', categoryId: 'dev', createdAt: Date.now(), visitCount: 12 },
    { id: generateId(), title: 'YouTube', url: 'https://www.youtube.com/', color: '#000000', categoryId: 'dev', createdAt: Date.now(), visitCount: 8 },
];

// 空的快捷访问数据
export const MOCK_QUICKLINKS: QuickLink[] = [
    { id: generateId(), title: 'GitHub', url: 'https://github.com', color: '#333333', order: 0 },
    { id: generateId(), title: 'Google', url: 'https://www.google.com', color: '#4285f4', order: 1 },
    { id: generateId(), title: 'ChatGPT', url: 'https://chat.openai.com', color: '#10a37f', order: 2 },
    { id: generateId(), title: 'Notion', url: 'https://www.notion.so', color: '#000000', order: 3 },
    { id: generateId(), title: 'YouTube', url: 'https://www.youtube.com', color: '#ff0000', order: 4 },
    { id: generateId(), title: 'Twitter', url: 'https://twitter.com', color: '#1da1f2', order: 5 },
    { id: generateId(), title: 'Figma', url: 'https://www.figma.com', color: '#f24e1e', order: 6 },
    { id: generateId(), title: 'Bilibili', url: 'https://www.bilibili.com', color: '#00a1d6', order: 7 },
];