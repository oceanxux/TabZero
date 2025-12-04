import { useState, useRef, useEffect } from 'react';
import { getEnabledEngines, getAllEngines } from '../../types';
import { useSettingsStore } from '../../stores'; // ❌ 移除了 useSearchHistoryStore
import { SearchEngineModal } from '../SearchEngineModal';
import { useTranslation } from '../../i18n';
import styles from './SearchBar.module.css';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ❌ 移除了历史记录相关的 state (isHistoryOpen, isHistoryClosing)

  const { settings, updateSettings } = useSettingsStore();
  // ❌ 移除了 history store 的解构

  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取所有引擎（包含自定义）
  const allEngines = getAllEngines(settings.customSearchEngines);

  // 获取启用的搜索引擎
  const enabledEngines = getEnabledEngines(settings.enabledSearchEngines, settings.customSearchEngines);

  const currentEngine = allEngines.find(
    (e) => e.id === settings.defaultSearchEngine
  ) || enabledEngines[0] || allEngines[0];

  // 页面加载时自动聚焦
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ❌ 移除了 filteredHistory 计算逻辑

  // 关闭面板（带动画）
  const closePanel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsPanelOpen(false);
      setIsClosing(false);
    }, 150);
  };

  // ❌ 移除了 closeHistory 函数

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isPanelOpen && !isClosing) {
          closePanel();
        }
        // ❌ 移除了关闭历史面板的逻辑
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen, isClosing]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // ❌ 移除了 addHistory 调用，不再记录历史
      window.location.href = currentEngine.url + encodeURIComponent(query.trim());
    }
  };

  // ❌ 移除了 handleHistoryClick (点击历史记录)
  // ❌ 移除了 handleDeleteHistory (删除历史记录)
  // ❌ 移除了 handleInputFocus (聚焦显示历史)

  // 输入框内容变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // ❌ 移除了触发历史面板显示的逻辑
  };

  const handleEngineSelect = (engineId: string) => {
    updateSettings({ defaultSearchEngine: engineId });
    closePanel();
    inputRef.current?.focus();
  };

  const togglePanel = () => {
    if (isPanelOpen) {
      closePanel();
    } else {
      setIsPanelOpen(true);
      // ❌ 移除了关闭历史面板的逻辑
    }
  };

  const handleAddClick = () => {
    closePanel();
    setIsModalOpen(true);
  };

  const handleDeleteEngine = (e: React.MouseEvent, engineId: string) => {
    e.stopPropagation();
    if (enabledEngines.length <= 1) return;

    const newIds = settings.enabledSearchEngines.filter(id => id !== engineId);
    updateSettings({ enabledSearchEngines: newIds });

    // 如果删除的是当前选中的引擎，切换到第一个
    if (settings.defaultSearchEngine === engineId) {
      updateSettings({ defaultSearchEngine: newIds[0] });
    }
  };

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      <form className={styles.searchBar} onSubmit={handleSearch}>
        <button
          type="button"
          className={styles.engineButton}
          onClick={togglePanel}
        >
          {currentEngine.icon && (
            <img src={currentEngine.icon} alt={currentEngine.name} className={styles.currentEngineIcon} />
          )}
          <svg
            className={`${styles.chevron} ${isPanelOpen ? styles.open : ''}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={t.search.placeholder}
          value={query}
          onChange={handleInputChange}
          // ❌ 移除了 onFocus 事件
        />
        <button type="submit" className={styles.submitButton}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>

      {isPanelOpen && (
        <div className={`${styles.enginePanel} ${isClosing ? styles.closing : ''}`}>
          {enabledEngines.map((engine) => (
            <div
              key={engine.id}
              className={`${styles.engineItem} ${engine.id === currentEngine.id ? styles.active : ''}`}
              onClick={() => handleEngineSelect(engine.id)}
            >
              <div className={styles.engineIconWrapper}>
                {engine.icon && (
                  <img src={engine.icon} alt={engine.name} className={styles.engineIcon} />
                )}
              </div>
              <span className={styles.engineName}>{engine.name}</span>
              {enabledEngines.length > 1 && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={(e) => handleDeleteEngine(e, engine.id)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button type="button" className={styles.addButton} onClick={handleAddClick}>
            <div className={styles.addIconWrapper}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span className={styles.addLabel}>{t.common.add}</span>
          </button>
        </div>
      )}

      {/* ❌ 彻底删除了搜索历史面板的 JSX 代码块 */}

      <SearchEngineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}