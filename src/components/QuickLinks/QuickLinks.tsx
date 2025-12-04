import { useState, useRef, useCallback, type SyntheticEvent } from 'react';
import { useQuickLinkStore } from '../../stores';
import { useTranslation } from '../../i18n';
import { EditModal, type EditModalField } from '../EditModal';
import { ContextMenu, type ContextMenuItem } from '../ui';
import { COLORS } from '../../types';
import styles from './QuickLinks.module.css';

// -------------------------------------------------------------------
// Favicon 错误处理函数 (保持不变)
// -------------------------------------------------------------------
const handleFaviconError = (e: SyntheticEvent<HTMLImageElement, Event>, siteUrl: string) => {
    const img = e.currentTarget;
    img.onerror = null; 
    
    const currentSrc = img.src;
    
    // 1. 如果当前是 Chrome 内部 API (初始加载)
    if (currentSrc.includes('chrome-extension://_favicon')) {
        // 切换到 Google S2 API (Fallback 1)
        img.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(siteUrl)}`;
    } 
    // 2. 如果是 Google S2 API
    else if (currentSrc.includes('google.com/s2/favicons')) {
        try {
            // 切换到网站根目录 /favicon.ico (Fallback 2)
            const origin = new URL(siteUrl).origin;
            img.src = `${origin}/favicon.ico`;
        } catch {
            // URL解析失败，忽略
        }
    }
    // 3. 彻底失败，隐藏图标
    else {
        img.style.display = 'none'; 
    }
};


export function QuickLinks() {
  const { quickLinks, addQuickLink, updateQuickLink, deleteQuickLink, reorderQuickLinks } = useQuickLinkStore();
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);

  // 拖拽状态
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const dragItemRef = useRef<string | null>(null);

  // ✅ 关键修改 1：新增自定义图标 URL 字段
  const fields: EditModalField[] = [
    {
      key: 'title',
      label: t.quickLinks.name,
      type: 'text',
      placeholder: t.quickLinks.namePlaceholder,
      required: true,
    },
    {
      key: 'url',
      label: t.quickLinks.url,
      type: 'url',
      placeholder: t.quickLinks.urlPlaceholder,
      required: true,
    },
    {
        key: 'customIconUrl',
        label: '自定义图标 URL',
        type: 'url',
        placeholder: '粘贴 PNG/SVG/ICO 链接',
        required: false,
    },
  ];

  // ✅ 关键修改 2：handleAdd - 保存 customIconUrl
  const handleAdd = (values: Record<string, string>) => {
    const newLink = {
      id: `ql-${Date.now()}`,
      title: values.title,
      url: values.url.startsWith('http') ? values.url : `https://${values.url}`,
      customIconUrl: values.customIconUrl || '', // 👈 保存自定义 URL
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      order: quickLinks.length,
    };
    addQuickLink(newLink);
  };

  // ✅ 关键修改 3：handleEdit - 更新 customIconUrl
  const handleEdit = (values: Record<string, string>) => {
    if (!editingLink) return;
    updateQuickLink(editingLink, {
      title: values.title,
      url: values.url.startsWith('http') ? values.url : `https://${values.url}`,
      customIconUrl: values.customIconUrl || '', // 👈 更新自定义 URL
    });
  };

  const handleDelete = () => {
    if (editingLink) {
      deleteQuickLink(editingLink);
    }
  };

  const currentLink = editingLink
    ? quickLinks.find((l) => l.id === editingLink)
    : null;

  // 拖拽处理
  const handleDragStart = useCallback((e: React.DragEvent, index: number, id: string) => {
    dragItemRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setTimeout(() => setDragIndex(index), 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex !== index) {
      setOverIndex(index);
    }
  }, [dragIndex]);

  const handleDragLeave = useCallback(() => {
    setOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const newLinks = [...quickLinks];
    const [draggedItem] = newLinks.splice(dragIndex, 1);
    newLinks.splice(dropIndex, 0, draggedItem);
    reorderQuickLinks(newLinks);

    setDragIndex(null);
    setOverIndex(null);
  }, [quickLinks, dragIndex, reorderQuickLinks]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
    dragItemRef.current = null;
  }, []);

  // 处理外部拖入（书签/最近访问）
  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    // 检查是否是外部拖入（书签或最近访问）
    const data = e.dataTransfer.types.includes('text/plain');
    if (data && dragItemRef.current === null) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDropZoneActive(true);
    }
  }, []);

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    // 确保只在离开容器时才关闭
    const relatedTarget = e.relatedTarget as Node | null;
    const container = e.currentTarget;
    if (!container.contains(relatedTarget)) {
      setIsDropZoneActive(false);
    }
  }, []);

  const handleContainerDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(false);

    const data = e.dataTransfer.getData('text/plain');

    // 处理外部拖入的数据
    if (data.startsWith('external:')) {
      try {
        const jsonStr = data.replace('external:', '');
        const itemData = JSON.parse(jsonStr);

        // 检查是否已存在相同URL
        const exists = quickLinks.some(link => link.url === itemData.url);
        if (exists) return;

        // 添加到快捷访问
        const newLink = {
          id: `ql-${Date.now()}`,
          title: itemData.title,
          url: itemData.url,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          order: quickLinks.length,
        };
        addQuickLink(newLink);
      } catch {
        // 解析失败，忽略
      }
    }
  }, [quickLinks, addQuickLink]);

  // 右键菜单项
  const getContextMenuItems = (linkId: string): ContextMenuItem[] => [
    {
      id: 'edit',
      label: t.common.edit,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      onClick: () => setEditingLink(linkId),
    },
    {
      id: 'open-new-tab',
      label: '新标签页打开',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      ),
      onClick: () => {
        const link = quickLinks.find(l => l.id === linkId);
        if (link) window.open(link.url, '_blank');
      },
    },
    { id: 'divider', label: '', divider: true },
    {
      id: 'delete',
      label: t.common.delete,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
      danger: true,
      onClick: () => deleteQuickLink(linkId),
    },
  ];

  return (
    <div
      className={`${styles.container} ${isDropZoneActive ? styles.dropZoneActive : ''}`}
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
    >
      {/* ❌ 标题已被移除 */}
      <div className={styles.list}>
        {quickLinks.map((link, index) => (
          <ContextMenu key={link.id} items={getContextMenuItems(link.id)}>
            <a
              href={link.url}
              className={`${styles.link} ${dragIndex === index ? styles.dragging : ''} ${overIndex === index ? styles.dragOver : ''}`}
              title={link.title}
              draggable
              onDragStart={(e) => handleDragStart(e, index, link.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.icon}>
                {/* 关键修改 4：优先显示自定义图标，否则进入回退链 */}
                <img 
                  src={link.customIconUrl || link.icon || `chrome-extension://_favicon/?pageUrl=${encodeURIComponent(link.url)}&size=32`}
                  alt="" 
                  onError={(e) => handleFaviconError(e, link.url)} 
                />
              </div>
              <span className={styles.name}>{link.title}</span>
            </a>
          </ContextMenu>
        ))}
        <button
          className={styles.addButton}
          onClick={() => setIsAddModalOpen(true)}
        >
          + {t.common.add}
        </button>
      </div>

      {/* 添加快捷访问弹窗 */}
      <EditModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t.quickLinks.addTitle}
        fields={fields}
        onSave={handleAdd}
      />

      {/* 编辑快捷访问弹窗 */}
      <EditModal
        isOpen={!!editingLink}
        onClose={() => setEditingLink(null)}
        title={t.quickLinks.editTitle}
        fields={fields}
        initialValues={
          currentLink
            ? { title: currentLink.title, url: currentLink.url, customIconUrl: currentLink.customIconUrl || '' } // 👈 初始化时带上 customIconUrl
            : {}
        }
        onSave={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}