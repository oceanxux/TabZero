import { useState, useEffect, useRef } from 'react';
import { Modal } from '../Modal';
import { Input, Button, Select, type SelectOption } from '../ui';
import { useTranslation } from '../../i18n';
import styles from './EditModal.module.css';

export interface EditModalField {
  key: string;
  label: string;
  type: 'text' | 'url' | 'select';
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: EditModalField[];
  initialValues?: Record<string, string>;
  onSave: (values: Record<string, string>) => void;
  onDelete?: () => void;
}

export function EditModal({
  isOpen,
  onClose,
  title,
  fields,
  initialValues = {},
  onSave,
  onDelete,
}: EditModalProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loadingTitle, setLoadingTitle] = useState(false);
  const prevIsOpen = useRef(false);

  // 只在 isOpen 从 false 变为 true 时初始化
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      const defaultValues: Record<string, string> = {};
      fields.forEach(f => {
        defaultValues[f.key] = initialValues[f.key] || '';
      });
      setValues(defaultValues);
      setLoadingTitle(false);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, fields, initialValues]);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const autoFetchTitle = async (rawUrl: string) => {
    if (!rawUrl || !rawUrl.trim()) return;
    if (values['title']?.trim()) return;

    let targetUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    let fallback = '';
    try {
      fallback = new URL(targetUrl).hostname.replace(/^www\./, '');
    } catch {
      return;
    }

    setLoadingTitle(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: { Accept: 'text/html,application/xhtml+xml' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const match =
          text.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ||
          text.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        if (match && match[1]) {
          const parsedTitle = match[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          if (parsedTitle) {
            setValues(prev => (prev.title?.trim() ? prev : { ...prev, title: parsedTitle }));
            setLoadingTitle(false);
            return;
          }
        }
      }
    } catch {
      // 忽略网络或跨域错误，平滑降级
    }

    setValues(prev => (prev.title?.trim() ? prev : { ...prev, title: fallback }));
    setLoadingTitle(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    for (const field of fields) {
      if (field.required && !values[field.key]?.trim()) {
        return;
      }
    }

    const submitData = { ...values };
    if (!submitData.title?.trim() && submitData.url) {
      try {
        const u = submitData.url.startsWith('http') ? submitData.url : `https://${submitData.url}`;
        submitData.title = new URL(u).hostname.replace(/^www\./, '');
      } catch {
        submitData.title = submitData.url;
      }
    }

    onSave(submitData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <form onSubmit={handleSubmit} className={styles.form}>
        {fields.map(field => (
          <div key={field.key} className={styles.field}>
            <label className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            {field.type === 'select' && field.options ? (
              <Select
                value={values[field.key] || ''}
                options={field.options}
                onChange={value => handleChange(field.key, value)}
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                type={field.type === 'url' ? 'url' : 'text'}
                value={values[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                onPaste={
                  field.key === 'url'
                    ? e => {
                        const pasted = e.clipboardData?.getData('text');
                        if (pasted) autoFetchTitle(pasted);
                      }
                    : undefined
                }
                onBlur={
                  field.key === 'url'
                    ? e => autoFetchTitle(e.target.value)
                    : undefined
                }
                placeholder={
                  field.key === 'title'
                    ? loadingTitle
                      ? '正在自动获取网站标题...'
                      : field.placeholder + (field.required ? '' : '（可选）')
                    : field.placeholder
                }
                fullWidth
              />
            )}
          </div>
        ))}

        <div className={styles.actions}>
          {onDelete && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onDelete();
                onClose();
              }}
              className={styles.deleteButton}
            >
              {t.common.delete}
            </Button>
          )}
          <div className={styles.rightActions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary">
              {t.common.save}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
