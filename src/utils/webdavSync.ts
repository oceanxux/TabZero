import { createClient } from "webdav";
import { useBookmarkStore } from "../stores";

// 定义 WebDAV 配置接口
export interface WebDavConfig {
    url: string;
    username: string;
    password: string;
}

// ✅ 关键修改：将文件名更改为 TabZero
const SYNC_FILE_NAME = "TabZero_bookmarks.json";

// 获取 WebDAV 客户端实例
const getClient = (config: WebDavConfig) => {
    return createClient(config.url, {
        username: config.username,
        password: config.password,
    });
};

// 📤 上传备份 (Upload)
export const uploadBookmarks = async (config: WebDavConfig) => {
    const client = getClient(config);

    // 获取当前 Zustand Store 中的所有数据
    const state = useBookmarkStore.getState();

    const dataToSync = {
        bookmarks: state.bookmarks,
        categories: state.categories,
        version: "1.0",
        updatedAt: Date.now(),
        device: "chrome-extension"
    };

    try {
        console.log("正在连接 WebDAV 上传...");
        // 写入文件，使用新的文件名
        await client.putFileContents(`/${SYNC_FILE_NAME}`, JSON.stringify(dataToSync, null, 2));
        return { success: true, message: `✅ 备份成功！文件: ${SYNC_FILE_NAME} 时间: ${new Date().toLocaleString()}` };
    } catch (error) {
        console.error("WebDAV Upload Error:", error);
        return { success: false, message: "❌ 上传失败: 请检查地址/账号/密码或跨域权限。" };
    }
};

// 📥 下载恢复 (Download)
export const downloadBookmarks = async (config: WebDavConfig) => {
    const client = getClient(config);

    try {
        console.log("正在连接 WebDAV 下载...");

        // 检查文件是否存在
        const exists = await client.exists(`/${SYNC_FILE_NAME}`);
        if (!exists) {
            return { success: false, message: `⚠️ 云端未找到备份文件 (${SYNC_FILE_NAME})` };
        }

        // 读取文件内容
        const contents = await client.getFileContents(`/${SYNC_FILE_NAME}`, { format: "text" });
        const data = JSON.parse(contents as string);

        // 简单校验数据格式
        if (Array.isArray(data.bookmarks) && Array.isArray(data.categories)) {
            // 直接更新 Store，覆盖本地数据
            useBookmarkStore.setState({
                bookmarks: data.bookmarks,
                categories: data.categories
            });
            return { success: true, message: `✅ 同步成功！恢复了 ${data.bookmarks.length} 个书签。` };
        }

        return { success: false, message: "❌ 云端文件格式错误，无法恢复。" };
    } catch (error) {
        console.error("WebDAV Download Error:", error);
        return { success: false, message: "❌ 下载失败: 请检查网络配置。" };
    }
};