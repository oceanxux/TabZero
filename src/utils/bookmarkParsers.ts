// src/utils/bookmarkParsers.ts

const parseLevel = (element: Element, categoryName: string | null = null, results: any[] = []) => {
    const dtElements = element.children;

    for (let i = 0; i < dtElements.length; i++) {
        const dt = dtElements[i];
        const h3 = dt.querySelector('H3');
        const a = dt.querySelector('A');

        if (h3) {
            const newCategory = h3.textContent?.trim() || 'Imported Folder';
            const dl = dt.querySelector('DL');
            if (dl) {
                parseLevel(dl, newCategory, results);
            }
        } else if (a && a.getAttribute('HREF')) {
            results.push({
                title: a.textContent?.trim() || a.getAttribute('HREF') || 'No Title',
                url: a.getAttribute('HREF'),
                category: categoryName || '未分类'
            });
        }
    }
    return results;
};

export const parseHtmlBookmarks = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const topDl = doc.querySelector('DL');

    if (!topDl) {
        throw new Error("HTML文件结构不正确，未找到书签列表 (DL)。");
    }

    const rawLinks = parseLevel(topDl);

    const importedBookmarks: any[] = [];
    const importedCategories: any[] = [];
    const categoryMap = new Map<string, string>();
    let categoryOrder = 100;

    rawLinks.forEach((link, index) => {
        if (!categoryMap.has(link.category)) {
            const newId = `cat-${Date.now()}-${categoryOrder}`;
            categoryMap.set(link.category, newId);
            importedCategories.push({
                id: newId,
                name: link.category,
                order: categoryOrder++,
            });
        }
        importedBookmarks.push({
            id: `bm-${Date.now()}-${index}`,
            title: link.title,
            url: link.url,
            categoryId: categoryMap.get(link.category),
            color: '#808080',
            createdAt: Date.now(),
            visitCount: 0,
        });
    });

    return {
        bookmarks: importedBookmarks,
        categories: importedCategories
    };
};