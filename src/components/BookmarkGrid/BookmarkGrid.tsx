import { useState, useMemo, useCallback, useRef, type SyntheticEvent } from 'react';
import { useBookmarkStore, useTrashStore } from '../../stores';
import { getDomain } from '../../utils'; // ✅ 修复 TS6133：删除了未使用的 getFaviconUrl 导入
import { ContextMenu, ConfirmDialog, type ContextMenuItem } from '../ui';
import { EditModal, type EditModalField } from '../EditModal';
import { useTranslation } from '../../i18n';
import styles from './BookmarkGrid.module.css';

// -------------------------------------------------------------------
// ✅ 关键添加：Favicon 错误处理函数 (必须定义，用于 onError 回退)
// -------------------------------------------------------------------
const handleFaviconError = (e: SyntheticEvent<HTMLImageElement, Event>, siteUrl: string) => {
    const img = e.currentTarget;
    // 阻止无限循环报错，只执行一次回退
    img.onerror = null; 
    
    const currentSrc = img.src;
    
    // 1. 如果当前 URL 包含 chrome-extension://_favicon (即 Chrome 内部 API 失败)
    if (currentSrc.includes('chrome-extension://_favicon')) {
        // 切换到 Google S2 API (Fallback 1)
        img.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(siteUrl)}`;
    } 
    // 2. 如果是 Google S2 API 失败了
    else if (currentSrc.includes('google.com/s2/favicons')) {
        try {
            // 切换到网站根目录 /favicon.ico (Fallback 2 - 可能会有 CORS 限制)
            const origin = new URL(siteUrl).origin;
            img.src = `${origin}/favicon.ico`;
        } catch {
            // URL解析失败，忽略
        }
    }
    // 3. 如果以上都失败，使用一个空白占位符
    else {
        img.style.display = 'none'; 
    }
};
// -------------------------------------------------------------------

export function BookmarkGrid() {
  const {
    bookmarks,
    categories,
    activeCategory,
    setActiveCategory,
    incrementVisitCount,
    updateBookmark,
    deleteBookmark,
    reorderBookmarks,
    deleteCategory,
    reorderCategories,
  } = useBookmarkStore();
  const { addToTrash } = useTrashStore();
  const { t } = useTranslation();

  // ❌ 彻底移除了 searchQuery 状态
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // 删除确认弹窗状态
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{
    categoryId: string;
    bookmarkCount: number;
  } | null>(null);

  // 分类拖拽状态
  const [catDragIndex, setCatDragIndex] = useState<number | null>(null);
  const [catOverIndex, setCatOverIndex] = useState<number | null>(null);

  // 书签拖拽状态
  const [bookmarkDragIndex, setBookmarkDragIndex] = useState<number | null>(null);
  const [bookmarkOverIndex, setBookmarkOverIndex] = useState<number | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const dragBookmarkRef = useRef<string | null>(null);

  // 过滤书签 (❌ 移除了搜索词过滤逻辑，只保留分类过滤)
  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;

    if (activeCategory !== 'all') {
      result = result.filter((b) => b.categoryId === activeCategory);
    }

    // 搜索过滤逻辑已删除

    return result;
  }, [bookmarks, activeCategory]);

  const handleBookmarkClick = (id: string) => {
    incrementVisitCount(id);
  };

  // 书签表单字段 (✅ 新增自定义图标 URL 字段)
  const bookmarkFields: EditModalField[] = [
    {
      key: 'title',
      label: t.bookmarks.form.title,
      type: 'text',
      placeholder: t.bookmarks.form.title,
      required: true,
    },
    {
      key: 'url',
      label: t.bookmarks.form.url,
      type: 'url',
      placeholder: t.bookmarks.form.url,
      required: true,
    },
    {
      key: 'categoryId',
      label: t.bookmarks.form.category,
      type: 'select',
      options: categories
        .filter((c) => c.id !== 'all')
        .map((c) => ({ value: c.id, label: c.name })),
      required: true,
    },
    {
      key: 'customIconUrl', 
      label: '自定义图标 URL',
      type: 'url',
      placeholder: '粘贴图标 PNG/SVG 链接',
      required: false,
    },
  ];

  // 分类表单字段
  const categoryFields: EditModalField[] = [
    {
      key: 'name',
      label: t.bookmarks.form.title,
      type: 'text',
      placeholder: t.bookmarks.form.title,
      required: true,
    },
  ];

  // ✅ 关键修改：handleEditBookmark - 保存 customIconUrl
  const handleEditBookmark = (values: Record<string, string>) => {
    if (!editingBookmark) return;
    updateBookmark(editingBookmark, {
      title: values.title,
      url: values.url.startsWith('http') ? values.url : `https://${values.url}`,
      categoryId: values.categoryId,
      customIconUrl: values.customIconUrl || '', // 👈 保存新字段
    });
  };

  const handleDeleteBookmark = () => {
    if (editingBookmark) {
      const bookmark = bookmarks.find(b => b.id === editingBookmark);
      if (bookmark) {
        addToTrash({
          id: `trash-${Date.now()}`,
          type: 'bookmark',
          data: bookmark,
          deletedAt: Date.now(),
        });
      }
      deleteBookmark(editingBookmark);
    }
  };

  const handleDeleteBookmarkById = (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      addToTrash({
        id: `trash-${Date.now()}`,
        type: 'bookmark',
        data: bookmark,
        deletedAt: Date.now(),
      });
    }
    deleteBookmark(bookmarkId);
  };

  const handleEditCategory = (values: Record<string, string>) => {
    if (!editingCategory) return;
    const state = useBookmarkStore.getState();
    state.updateCategory(editingCategory, { name: values.name });
  };

  const handleDeleteCategory = () => {
    if (editingCategory) {
      performDeleteCategory(editingCategory);
    }
  };

  const tryDeleteCategory = (categoryId: string) => {
    const categoryBookmarks = bookmarks.filter(b => b.categoryId === categoryId);
    if (categoryBookmarks.length > 0) {
      setDeleteCategoryConfirm({
        categoryId,
        bookmarkCount: categoryBookmarks.length,
      });
    } else {
      performDeleteCategory(categoryId);
    }
  };

  const performDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const categoryBookmarks = bookmarks.filter(b => b.categoryId === categoryId);

    if (category) {
      addToTrash({
        id: `trash-${Date.now()}`,
        type: 'category',
        data: category,
        deletedAt: Date.now(),
        relatedBookmarks: categoryBookmarks,
      });
    }

    deleteCategory(categoryId);

    if (activeCategory === categoryId) {
      setActiveCategory('all');
    }
  };

  const currentBookmark = editingBookmark
    ? bookmarks.find((b) => b.id === editingBookmark)
    : null;

  const currentCategory = editingCategory
    ? categories.find((c) => c.id === editingCategory)
    : null;

  // ========== 拖拽逻辑 (保持不变) ==========
  const handleCatDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    const visibleCategories = categories.filter(c => c.id !== 'all');
    if (visibleCategories[index]) {
       e.dataTransfer.setData('text/plain', `category:${visibleCategories[index].id}`);
       setTimeout(() => setCatDragIndex(index), 0);
    }
  }, [categories]);

  const handleCatDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    const data = e.dataTransfer.types.includes('text/plain');
    if (data && catDragIndex !== null && catDragIndex !== index) {
      setCatOverIndex(index);
    }
    
    const visibleCategories = categories.filter(c => c.id !== 'all');
    const targetCategory = visibleCategories[index];

    if (dragBookmarkRef.current && targetCategory) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverCategoryId(targetCategory.id);
    }
  }, [catDragIndex, categories]);

  const handleCatDragLeave = useCallback(() => {
    setCatOverIndex(null);
    setDragOverCategoryId(null);
  }, []);

  const handleCatDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const visibleCategories = categories.filter(c => c.id !== 'all');
    const targetCategory = visibleCategories[dropIndex];
    
    if (!targetCategory) return;

    if (data.startsWith('bookmark:')) {
      const bookmarkId = data.replace('bookmark:', '');
      updateBookmark(bookmarkId, { categoryId: targetCategory.id });
      setDragOverCategoryId(null);
      return;
    }

    if (catDragIndex === null || catDragIndex === dropIndex) return;

    const draggedCatId = visibleCategories[catDragIndex].id;
    const targetCatId = visibleCategories[dropIndex].id;
    
    const oldIndex = categories.findIndex(c => c.id === draggedCatId);
    const newIndex = categories.findIndex(c => c.id === targetCatId);

    const newCategories = [...categories];
    const [draggedItem] = newCategories.splice(oldIndex, 1);
    newCategories.splice(newIndex, 0, draggedItem);
    reorderCategories(newCategories);

    setCatDragIndex(null);
    setCatOverIndex(null);
  }, [categories, catDragIndex, reorderCategories, updateBookmark]);

  const handleCatDragEnd = useCallback(() => {
    setCatDragIndex(null);
    setCatOverIndex(null);
    setDragOverCategoryId(null);
  }, []);

  const handleBookmarkDragStart = useCallback((e: React.DragEvent, index: number, id: string) => {
    dragBookmarkRef.current = id;
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', `bookmark:${id}`);
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      e.dataTransfer.setData('text/plain', `external:${JSON.stringify({
        title: bookmark.title,
        url: bookmark.url
      })}`);
    }
    setTimeout(() => setBookmarkDragIndex(index), 0);
  }, [bookmarks]);

  const handleBookmarkDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (bookmarkDragIndex !== index) {
      setBookmarkOverIndex(index);
    }
  }, [bookmarkDragIndex]);

  const handleBookmarkDragLeave = useCallback(() => {
    setBookmarkOverIndex(null);
  }, []);

  const handleBookmarkDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (bookmarkDragIndex === null || bookmarkDragIndex === dropIndex) {
      setBookmarkDragIndex(null);
      setBookmarkOverIndex(null);
      return;
    }
    const draggedBookmark = filteredBookmarks[bookmarkDragIndex];
    const targetBookmark = filteredBookmarks[dropIndex];
    const fullDragIndex = bookmarks.findIndex(b => b.id === draggedBookmark.id);
    const fullDropIndex = bookmarks.findIndex(b => b.id === targetBookmark.id);
    const newBookmarks = [...bookmarks];
    const [draggedItem] = newBookmarks.splice(fullDragIndex, 1);
    newBookmarks.splice(fullDropIndex, 0, draggedItem);
    reorderBookmarks(newBookmarks);
    setBookmarkDragIndex(null);
    setBookmarkOverIndex(null);
  }, [bookmarks, filteredBookmarks, bookmarkDragIndex, reorderBookmarks]);

  const handleBookmarkDragEnd = useCallback(() => {
    setBookmarkDragIndex(null);
    setBookmarkOverIndex(null);
    dragBookmarkRef.current = null;
  }, []);

  const getBookmarkContextMenuItems = (bookmarkId: string): ContextMenuItem[] => [
    {
      id: 'edit',
      label: t.common.edit,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
      onClick: () => setEditingBookmark(bookmarkId),
    },
    {
      id: 'open-new-tab',
      label: '新标签页打开',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
      onClick: () => {
        const bookmark = bookmarks.find(b => b.id === bookmarkId);
        if (bookmark) window.open(bookmark.url, '_blank');
      },
    },
    { id: 'divider', label: '', divider: true },
    {
      id: 'delete',
      label: t.common.delete,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
      danger: true,
      onClick: () => handleDeleteBookmarkById(bookmarkId),
    },
  ];

  const getCategoryContextMenuItems = (categoryId: string): ContextMenuItem[] => [
    {
      id: 'edit',
      label: t.common.edit,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
      onClick: () => setEditingCategory(categoryId),
    },
    { id: 'divider', label: '', divider: true },
    {
      id: 'delete',
      label: t.common.delete,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
      danger: true,
      onClick: () => tryDeleteCategory(categoryId),
    },
  ];

  return (
    <div className={styles.container}>
      {/* 头部：仅保留分类标签 */}
      <div className={styles.header}>
        <div 
          className={styles.categories}
          style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}
        >
          {categories
            .filter(category => category.id !== 'all')
            .map((category, index) => {
            const isDragging = catDragIndex === index;
            const isDragOver = catOverIndex === index || dragOverCategoryId === category.id;

            const categoryButton = (
              <button
                key={category.id}
                className={`${styles.categoryTab} ${
                  activeCategory === category.id ? styles.active : ''
                } ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
                onClick={() => setActiveCategory(category.id)}
                draggable
                onDragStart={(e) => handleCatDragStart(e, index)}
                onDragOver={(e) => handleCatDragOver(e, index)}
                onDragLeave={handleCatDragLeave}
                onDrop={(e) => handleCatDrop(e, index)}
                onDragEnd={handleCatDragEnd}
              >
                {category.name}
              </button>
            );

            return (
              <ContextMenu key={category.id} items={getCategoryContextMenuItems(category.id)}>
                {categoryButton}
              </ContextMenu>
            );
          })}
        </div>
        
        {/* ❌ 搜索框和动作栏已彻底移除 */}
      </div>

      {/* 书签网格 */}
      <div className={styles.gridWrapper}>
        <div className={styles.grid}>
          {filteredBookmarks.length === 0 ? (
            <div className={styles.empty}>
              <p>{t.common.noData}</p>
            </div>
          ) : (
            filteredBookmarks.map((bookmark, index) => (
              <ContextMenu key={bookmark.id} items={getBookmarkContextMenuItems(bookmark.id)}>
                <a
                  href={bookmark.url}
                  className={`${styles.card} ${bookmarkDragIndex === index ? styles.dragging : ''} ${bookmarkOverIndex === index ? styles.dragOver : ''}`}
                  onClick={() => handleBookmarkClick(bookmark.id)}
                  title={bookmark.title}
                  draggable
                  onDragStart={(e) => handleBookmarkDragStart(e, index, bookmark.id)}
                  onDragOver={(e) => handleBookmarkDragOver(e, index)}
                  onDragLeave={handleBookmarkDragLeave}
                  onDrop={(e) => handleBookmarkDrop(e, index)}
                  onDragEnd={handleBookmarkDragEnd}
                >
                  <div
                    className={styles.icon}
                    style={{ backgroundColor: bookmark.color }}
                  >
                    {/* ✅ 关键修复点：整合 Favicon 回退逻辑 */}
                    <img 
                      src={bookmark.customIconUrl || bookmark.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(bookmark.url)}`}
                      alt="" 
                      onError={(e) => handleFaviconError(e, bookmark.url)} // 👈 新增
                    />
                  </div>
                  <div className={styles.info}>
                    <span className={styles.title}>{bookmark.title}</span>
                    <span className={styles.domain}>{getDomain(bookmark.url)}</span>
                  </div>
                </a>
              </ContextMenu>
            ))
          )}
        </div>
      </div>

      <EditModal
        isOpen={!!editingBookmark}
        onClose={() => setEditingBookmark(null)}
        title={t.bookmarks.editBookmark}
        fields={bookmarkFields}
        initialValues={
          currentBookmark
            ? {
                title: currentBookmark.title,
                url: currentBookmark.url,
                categoryId: currentBookmark.categoryId,
                customIconUrl: currentBookmark.customIconUrl || '', // 👈 初始化时带上 customIconUrl
              }
            : {}
        }
        onSave={handleEditBookmark}
        onDelete={handleDeleteBookmark}
      />

      <EditModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title={t.bookmarks.editCategory}
        fields={categoryFields}
        initialValues={currentCategory ? { name: currentCategory.name } : {}}
        onSave={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      <ConfirmDialog
        isOpen={!!deleteCategoryConfirm}
        onClose={() => setDeleteCategoryConfirm(null)}
        onConfirm={() => {
          if (deleteCategoryConfirm) {
            performDeleteCategory(deleteCategoryConfirm.categoryId);
          }
        }}
        title="删除分类"
        message={`该分类下有 ${deleteCategoryConfirm?.bookmarkCount || 0} 个书签，删除后书签也会被移入回收站。确定要删除吗？`}
        confirmText="删除"
        cancelText="取消"
        danger
      />
    </div >
  );
}