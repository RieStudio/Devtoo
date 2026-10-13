import React, { useState, useEffect, useCallback } from 'react';
import type { PrivacyPolicyConfig } from '../../types/privacyPolicy';
import { DEFAULT_PRIVACY_CONFIG } from '../../constants/privacyPolicyPresets';
import { PolicyConfigPanel } from './PolicyConfigPanel';
import { PolicyPreviewPane } from './PolicyPreviewPane';
import { generatePolicyHtml } from '../../utils/policyGenerator';

interface PrivacyPolicyStudioProps {
  isVisible?: boolean;
  onRegisterExport?: (exportFn: () => void) => void;
  onRegisterGetData?: (getDataFn: () => PrivacyPolicyConfig) => void;
  onRegisterLoadData?: (loadDataFn: (data: PrivacyPolicyConfig) => void) => void;
  onShowToast?: (message: string) => void;
}

export const PrivacyPolicyStudio: React.FC<PrivacyPolicyStudioProps> = ({
  isVisible = true,
  onRegisterExport,
  onRegisterGetData,
  onRegisterLoadData,
  onShowToast,
}) => {
  const [config, setConfig] = useState<PrivacyPolicyConfig>(() => {
    // LocalStorage'dan son çalışma durumunu geri yükle
    try {
      const saved = localStorage.getItem('devtoo_privacy_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_PRIVACY_CONFIG;
  });

  const handleUpdateConfig = useCallback((updated: Partial<PrivacyPolicyConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('devtoo_privacy_config', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Header "İndir" butonuna basıldığında HTML indirme işlevi
  const handlePerformExport = useCallback(() => {
    const htmlContent = generatePolicyHtml(config);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (config.appName || 'privacy-policy')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    link.download = `${safeTitle}-privacy-policy.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [config]);

  useEffect(() => {
    if (isVisible && onRegisterExport) {
      onRegisterExport(handlePerformExport);
    }
  }, [isVisible, onRegisterExport, handlePerformExport]);

  useEffect(() => {
    onRegisterGetData?.(() => config);
  }, [config, onRegisterGetData]);

  useEffect(() => {
    onRegisterLoadData?.((data: PrivacyPolicyConfig) => {
      setConfig(data);
      try {
        localStorage.setItem('devtoo_privacy_config', JSON.stringify(data));
      } catch {
        // Ignore
      }
    });
  }, [onRegisterLoadData]);

  if (!isVisible) return null;

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 56px)',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-app)',
    }}>
      {/* Sol Ayarlar Paneli */}
      <PolicyConfigPanel
        config={config}
        onChange={handleUpdateConfig}
      />

      {/* Sağ Önizleme & Data Safety & Hosting Paneli */}
      <PolicyPreviewPane
        config={config}
        onShowToast={onShowToast}
      />
    </div>
  );
};
