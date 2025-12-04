// src/utils/dataManager.ts

import { useBookmarkStore } from "../stores";
import { parseHtmlBookmarks } from './bookmarkParsers'; // 👈 导入上面创建的文件

export const importLocalData = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        const fileName = file.name.toLowerCase();
        const isHtml = fileName.endsWith('.html') || fileName.endsWith('.htm');

        reader.onload = (event) => {
            try {
                const contents = event.target?.result as string;
                let data: { bookmarks: any[], categories: any[] };

                if (isHtml) {
                    data = parseHtmlBookmarks(contents);
                } else {
                    data = JSON.parse(contents);
                }

                if (Array.isArray(data.bookmarks) && Array.isArray(data.categories)) {
                    useBookmarkStore.setState({
                        bookmarks: data.bookmarks,
                        categories: data.categories
                    });
                    resolve(`✅ 导入成功！(格式: ${isHtml ? 'HTML' : 'JSON'}) 恢复了 ${data.bookmarks.length} 个书签。`);
                } else {
                    reject("❌ 文件结构不正确，请确保是浏览器导出的 HTML 或 TabZero 备份 JSON。");
                }
            } catch (e: any) {
                reject(`❌ 读取或解析失败: ${e.message || '文件结构错误'}`);
            }
        };

        reader.onerror = () => reject("❌ 读取文件失败。");

        reader.readAsText(file);
    });
};