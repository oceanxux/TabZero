import { useState, useEffect, type ReactNode, useRef } from 'react'; // ✅ 确保引入了 useRef
import { useSettingsStore, useBookmarkStore, useTrashStore } from '../../stores';
import { ACCENT_COLORS, COLORS } from '../../types';
import { ColorPicker } from '../ColorPicker';
import { Switch, Slider, Button, Input, Select } from '../ui';
import { TrashPanel } from '../TrashPanel';
import { EditModal, type EditModalField } from '../EditModal';
import { useTranslation } from '../../i18n';
import styles from './SettingsDrawer.module.css';
// 👇 引入 WebDAV 同步逻辑
import { uploadBookmarks, downloadBookmarks, type WebDavConfig } from '../../utils/webdavSync';
// 引入本地导入逻辑 (依赖于 src/utils/dataManager.ts 文件)
import { importLocalData } from '../../utils/dataManager'; 

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ 包含 'sync' 的菜单定义
type MenuKey = 'theme' | 'bookmarks' | 'categories' | 'trash' | 'sync' | 'system';

// --- 图标组件 ---
const ThemeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const SystemIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const CategoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
  </svg>
);

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { settings, updateSettings } = useSettingsStore();
  const { categories, addCategory, deleteCategory, bookmarks, activeCategory, setActiveCategory, addBookmark } = useBookmarkStore();
  const { addToTrash } = useTrashStore();
  const { t, locale, setLocale, supportedLocales } = useTranslation();
  const [activeMenu, setActiveMenu] = useState<MenuKey>('theme');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // 添加书签弹窗状态
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);

  // 👇 关键：本地文件导入 Ref
  const fileInputRef = useRef<HTMLInputElement>(null); 

  // --- WebDAV 状态 ---
  const [webdavUrl, setWebdavUrl] = useState('');
  const [webdavUser, setWebdavUser] = useState('');
  const [webdavPass, setWebdavPass] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false); // 修复 TS6133 错误 

  // 初始化加载 WebDAV 配置
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('webdav_config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          setWebdavUrl(config.url || '');
          setWebdavUser(config.username || '');
          setWebdavPass(config.password || '');
        } catch (e) { console.error(e); }
      }
    }
  }, [isOpen]);

  const handleSync = async (type: 'upload' | 'download') => { // 修复 TS6133 错误
    if (!webdavUrl || !webdavUser || !webdavPass) {
      setSyncStatus('⚠️ 请填写完整的 WebDAV 信息');
      return;
    }

    setIsSyncing(true);
    setSyncStatus(type === 'upload' ? '⏳ 正在上传备份...' : '⏳ 正在下载恢复...');

    const config: WebDavConfig = {
      url: webdavUrl,
      username: webdavUser,
      password: webdavPass
    };

    localStorage.setItem('webdav_config', JSON.stringify(config));

    const result = type === 'upload' 
      ? await uploadBookmarks(config) 
      : await downloadBookmarks(config);

    setSyncStatus(result.message);
    setIsSyncing(false);
    
    if (type === 'download' && result.success) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };
  
  const handleImportClick = () => { // 修复 TS6133 错误
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { // 修复 TS6133 错误
    const file = e.target.files?.[0];
    if (file) {
      setIsSyncing(true);
      setSyncStatus(`⏳ 正在导入文件: ${file.name}...`);
      
      try {
        const resultMessage = await importLocalData(file);
        setSyncStatus(resultMessage);
        setTimeout(() => window.location.reload(), 1500); // 导入成功后刷新页面
      } catch (error: any) {
        setSyncStatus(error);
      } finally {
        setIsSyncing(false);
        // 清空文件输入框，以便再次选择同一文件
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };
  // --------------------------

  // 菜单项配置
  const menuItems: { key: MenuKey; label: string; icon: ReactNode }[] = [
    { key: 'theme', label: t.settings.theme.title, icon: <ThemeIcon /> },
    { key: 'bookmarks', label: t.bookmarks.addBookmark, icon: <BookmarkIcon /> },
    { key: 'categories', label: t.bookmarks.form.category, icon: <CategoryIcon /> },
    { key: 'sync', label: '云同步', icon: <CloudIcon /> },
    { key: 'trash', label: t.settings.trash.title, icon: <TrashIcon /> },
    { key: 'system', label: t.settings.system.title, icon: <SystemIcon /> },
  ];

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
  ];

  const handleAddBookmark = (values: Record<string, string>) => {
    const newBookmark = {
      id: `bm-${Date.now()}`,
      title: values.title,
      url: values.url.startsWith('http') ? values.url : `https://${values.url}`,
      categoryId: values.categoryId || (categories.find(c => c.id !== 'all')?.id || 'dev'),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now(),
      visitCount: 0,
    };
    addBookmark(newBookmark);
  };

  const languageOptions = supportedLocales.map(loc => ({
    value: loc.code,
    label: loc.name,
  }));

  const darkWallpaperInput = settings.customBackgroundImage || '';
  const lightWallpaperInput = settings.customBackgroundImageLight || '';

  const setDarkWallpaperInput = (value: string) => {
    updateSettings({ customBackgroundImage: value });
  };

  const setLightWallpaperInput = (value: string) => {
    updateSettings({ customBackgroundImageLight: value });
  };

  const handleColorSelect = (color: string) => {
    updateSettings({ accentColor: color });
  };

  const handleResetWallpaper = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      updateSettings({
        customBackgroundImage: '',
        randomWallpaperImage: '',
      });
    } else {
      updateSettings({
        customBackgroundImageLight: '',
        randomWallpaperImageLight: '',
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory({
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      order: categories.length,
    });
    setNewCategoryName('');
  };

  const handleDeleteCategory = (categoryId: string) => {
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

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
      />

      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>{t.settings.title}</span>
          </div>
          <nav className={styles.menu}>
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`${styles.menuItem} ${activeMenu === item.key ? styles.active : ''}`}
                onClick={() => setActiveMenu(item.key)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>
              {menuItems.find((item) => item.key === activeMenu)?.label}
            </h2>
            <button className={styles.closeButton} onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className={styles.contentBody}>
            {activeMenu === 'theme' && (
              <>
                <div className={styles.section}>
                  <div className={styles.settingRow}>
                    <span className={styles.settingLabel}>{t.settings.theme.darkMode}</span>
                    <Switch
                      checked={settings.themeMode === 'dark'}
                      onChange={(checked) => updateSettings({ themeMode: checked ? 'dark' : 'light' })}
                    />
                  </div>
                </div>
                
                <div className={styles.section}>
                  <div className={styles.settingRow}>
                    <span className={styles.settingLabel}>{t.settings.theme.showThemeToggle}</span>
                    <Switch
                      checked={settings.showThemeToggle}
                      onChange={(checked) => updateSettings({ showThemeToggle: checked })}
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <div className={styles.settingRow}>
                    <span className={styles.settingLabel}>{t.settings.theme.borderRadius}</span>
                    <div className={styles.radiusOptions}>
                      {(['none', 'small', 'medium', 'large', 'xlarge'] as const).map((radius) => {
                        const radiusStyle = { none: '0', small: '4px', medium: '8px', large: '12px', xlarge: '16px' }[radius];
                        return (
                          <button
                            key={radius}
                            className={`${styles.radiusButton} ${settings.borderRadius === radius ? styles.active : ''}`}
                            onClick={() => updateSettings({ borderRadius: radius })}
                            style={{ borderRadius: radiusStyle }}
                          >
                            {t.settings.theme[`radius${radius.charAt(0).toUpperCase() + radius.slice(1)}` as keyof typeof t.settings.theme]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.settings.theme.accentColor}</h3>
                  <div className={styles.colorGrid}>
                    {ACCENT_COLORS.map((item) => (
                      <button
                        key={item.id}
                        className={`${styles.colorButton} ${
                          settings.accentColor === item.color ? styles.active : ''
                        }`}
                        style={{ backgroundColor: item.color }}
                        onClick={() => handleColorSelect(item.color)}
                        title={item.name}
                      >
                        {settings.accentColor === item.color && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className={styles.customColorRow}>
                    <span className={styles.customColorLabel}>{t.settings.theme.customColor}</span>
                    <ColorPicker
                      value={settings.accentColor}
                      onChange={handleColorSelect}
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <div className={styles.settingRow}>
                    <span className={styles.settingLabel}>{t.settings.wallpaper.showRandomButton}</span>
                    <Switch
                      checked={settings.showWallpaperButton}
                      onChange={(checked) => updateSettings({ showWallpaperButton: checked })}
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.settings.wallpaper.customWallpaper}</h3>
                  <div className={styles.wallpaperGroup}>
                    <label className={styles.wallpaperLabel}>{t.settings.wallpaper.darkModeWallpaper}</label>
                    <div className={styles.wallpaperInputRow}>
                      <Input
                        type="text"
                        placeholder={t.settings.wallpaper.inputPlaceholder}
                        value={darkWallpaperInput}
                        onChange={(e) => setDarkWallpaperInput(e.target.value)}
                        fullWidth
                      />
                      <Button variant="secondary" onClick={() => handleResetWallpaper('dark')}>
                        {t.common.reset}
                      </Button>
                    </div>
                  </div>
                  <div className={styles.wallpaperGroup}>
                    <label className={styles.wallpaperLabel}>{t.settings.wallpaper.lightModeWallpaper}</label>
                    <div className={styles.wallpaperInputRow}>
                      <Input
                        type="text"
                        placeholder={t.settings.wallpaper.inputPlaceholder}
                        value={lightWallpaperInput}
                        onChange={(e) => setLightWallpaperInput(e.target.value)}
                        fullWidth
                      />
                      <Button variant="secondary" onClick={() => handleResetWallpaper('light')}>
                        {t.common.reset}
                      </Button>
                    </div>
                  </div>
                </div>
                 
                 <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.settings.overlay.title}</h3>
                  <Slider
                    label={t.settings.overlay.darkMode}
                    displayValue={`${Math.round(settings.backgroundOverlayDark * 100)}%`}
                    min={0}
                    max={100}
                    step={5}
                    value={settings.backgroundOverlayDark * 100}
                    onChange={(v) => updateSettings({ backgroundOverlayDark: v / 100 })}
                  />
                  <Slider
                    label={t.settings.overlay.lightMode}
                    displayValue={`${Math.round(settings.backgroundOverlayLight * 100)}%`}
                    min={0}
                    max={100}
                    step={5}
                    value={settings.backgroundOverlayLight * 100}
                    onChange={(v) => updateSettings({ backgroundOverlayLight: v / 100 })}
                  />
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.settings.blur.title}</h3>
                  <Slider
                    label={t.settings.blur.darkMode}
                    displayValue={`${settings.backgroundBlurDark}px`}
                    min={0}
                    max={20}
                    step={1}
                    value={settings.backgroundBlurDark}
                    onChange={(v) => updateSettings({ backgroundBlurDark: v })}
                  />
                  <Slider
                    label={t.settings.blur.lightMode}
                    displayValue={`${settings.backgroundBlurLight}px`}
                    min={0}
                    max={20}
                    step={1}
                    value={settings.backgroundBlurLight}
                    onChange={(v) => updateSettings({ backgroundBlurLight: v })}
                  />
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.settings.clock.title}</h3>
                  <div className={styles.optionList}>
                    <div className={styles.settingRow}>
                      <span className={styles.settingLabel}>{t.settings.clock.showSeconds}</span>
                      <Switch
                        checked={settings.showSeconds}
                        onChange={(checked) => updateSettings({ showSeconds: checked })}
                      />
                    </div>
                    <div className={styles.settingRow}>
                      <span className={styles.settingLabel}>{t.settings.clock.clockColor}</span>
                      <ColorPicker
                        value={settings.clockColor}
                        onChange={(color) => updateSettings({ clockColor: color })}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t.settings.display.title}</h3>
                  <div className={styles.optionList}>
                    <div className={styles.settingRow}>
                      <span className={styles.settingLabel}>{t.settings.display.showClock}</span>
                      <Switch
                        checked={settings.showClock}
                        onChange={(checked) => updateSettings({ showClock: checked })}
                      />
                    </div>
                    {/* 已删除: 每日一言 & 最近访问 */}
                    <div className={styles.settingRow}>
                      <span className={styles.settingLabel}>{t.settings.display.showQuickLinks}</span>
                      <Switch
                        checked={settings.showQuickLinks}
                        onChange={(checked) => updateSettings({ showQuickLinks: checked })}
                      />
                    </div>
                    <div className={styles.settingRow}>
                      <span className={styles.settingLabel}>{t.settings.display.showBookmarks}</span>
                      <Switch
                        checked={settings.showBookmarks}
                        onChange={(checked) => updateSettings({ showBookmarks: checked })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeMenu === 'bookmarks' && (
              <div className={styles.section}>
                 <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>{t.bookmarks.addBookmark}</h3>
                 <div style={{ padding: '0 4px' }}>
                   <Button onClick={() => setIsAddBookmarkModalOpen(true)} style={{ width: '100%' }}>
                     + {t.bookmarks.addBookmark}
                   </Button>
                   <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                     {t.common.noData ? "提示：您也可以在主页右键点击书签进行编辑或删除。" : "Tip: You can also right-click bookmarks on the home page to edit or delete them."}
                   </p>
                 </div>
              </div>
            )}

            {activeMenu === 'categories' && (
              <div className={styles.section}>
                <div className={styles.wallpaperGroup}>
                  <label className={styles.wallpaperLabel}>{t.bookmarks.addCategory}</label>
                  <div className={styles.wallpaperInputRow}>
                    <Input
                      type="text"
                      placeholder={t.bookmarks.form.title}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      fullWidth
                    />
                    <Button onClick={handleAddCategory}>
                      {t.common.add}
                    </Button>
                  </div>
                </div>

                <h3 className={styles.sectionTitle} style={{ marginTop: '24px' }}>{t.bookmarks.form.category}</h3>
                <div className={styles.optionList}>
                  {categories.map((category) => (
                    <div key={category.id} className={styles.settingRow}>
                      <span className={styles.settingLabel}>{category.name}</span>
                      {category.id !== 'all' && (
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDeleteCategory(category.id)}
                          style={{ color: '#ff4d4f' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}
                  {categories.length <= 1 && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '8px 0' }}>
                      {t.common.noData}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ 关键修复：WebDAV 同步面板 (解决了所有 TS6133 错误) */}
           {activeMenu === 'sync' && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>☁️ WebDAV 云同步</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px' }}>
                  
                  {/* 1. HIDDEN INPUT (支持 JSON 和 HTML 格式) */}
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept=".json,.html,.htm" // ✅ 关键修改：支持 HTML 格式
                      style={{ display: 'none' }}
                  />
                  
                  {/* 2. 服务器地址输入框 (新增 UX 提示) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', opacity: 0.7 }}>服务器地址</label>
                    <Input
                      placeholder="https://dav.jianguoyun.com/dav/"
                      value={webdavUrl}
                      onChange={(e) => setWebdavUrl(e.target.value)}
                      fullWidth
                    />
                    {/* ✅ 登录 UX 提示 */}
                    <p style={{ fontSize: '10px', color: 'var(--accent-primary)', marginTop: '-8px' }}>
                        * 首次使用请填写完整，点击上传/下载后自动保存凭证。
                    </p>
                  </div>

                  {/* 3. 账户/密码字段 */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', opacity: 0.7 }}>账号</label>
                      <Input
                        placeholder="用户名/邮箱"
                        value={webdavUser}
                        onChange={(e) => setWebdavUser(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', opacity: 0.7 }}>密码</label>
                      <Input
                        type="password"
                        placeholder="应用密码"
                        value={webdavPass}
                        onChange={(e) => setWebdavPass(e.target.value)}
                        fullWidth
                      />
                    </div>
                  </div>

                  {/* 4. 导入本地按钮 */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', marginBottom: '8px' }}>
                    <Button 
                        onClick={handleImportClick} 
                        style={{ flex: 1, width: '100%' }}
                        disabled={isSyncing}
                    >
                        💾 导入本地
                    </Button>
                  </div>
                  
                  {/* 5. WEB/DAV 按钮 (上传/下载) */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button 
                      onClick={() => handleSync('upload')} 
                      style={{ flex: 1, width: '100%' }}
                      disabled={isSyncing}
                    >
                      {isSyncing ? '同步中...' : '⬆️ 上传备份'}
                    </Button>
                    <Button 
                      onClick={() => handleSync('download')} 
                      style={{ flex: 1, width: '100%' }}
                      disabled={isSyncing}
                    >
                      {isSyncing ? '同步中...' : '⬇️ 恢复云端'}
                    </Button>
                  </div>

                  {/* 6. STATUS MESSAGE */}
                  {syncStatus && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px', 
                      background: 'rgba(125,125,125,0.1)', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      lineHeight: '1.4'
                    }}>
                      {syncStatus}
                    </div>
                  )}
                  
                  {/* 7. Final Note */}
                  <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                     注意：首次使用请先确保服务器支持 WebDAV。
                  </p>
                </div>
              </div>
            )}

            {activeMenu === 'trash' && (
              <TrashPanel />
            )}

            {activeMenu === 'system' && (
              <>
                <div className={styles.section}>
                  <div className={styles.settingRow}>
                    <span className={styles.settingLabel}>{t.settings.system.language}</span>
                    <div className={styles.selectWrapper}>
                      <Select
                        value={locale}
                        options={languageOptions}
                        onChange={(value) => setLocale(value as typeof locale)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <EditModal
        isOpen={isAddBookmarkModalOpen}
        onClose={() => setIsAddBookmarkModalOpen(false)}
        title={t.bookmarks.addBookmark}
        fields={bookmarkFields}
        initialValues={{ categoryId: activeCategory === 'all' ? (categories.find(c => c.id !== 'all')?.id || 'dev') : activeCategory }}
        onSave={handleAddBookmark}
      />
    </>
  );
}