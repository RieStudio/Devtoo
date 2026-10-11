import React from 'react';
import { 
  Gamepad2, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import type { PrivacyPolicyConfig, ThirdPartyServiceId } from '../../types/privacyPolicy';
import { THIRD_PARTY_SERVICES } from '../../constants/privacyPolicyPresets';

interface PolicyConfigPanelProps {
  config: PrivacyPolicyConfig;
  onChange: (updated: Partial<PrivacyPolicyConfig>) => void;
}

export const PolicyConfigPanel: React.FC<PolicyConfigPanelProps> = ({
  config,
  onChange,
}) => {
  const handleToggleService = (serviceId: ThirdPartyServiceId) => {
    onChange({
      services: {
        ...config.services,
        [serviceId]: !config.services[serviceId],
      },
    });
  };

  const handleUpdateFeature = (key: keyof PrivacyPolicyConfig['features'], val: boolean | string) => {
    onChange({
      features: {
        ...config.features,
        [key]: val,
      },
    });
  };

  return (
    <div className="policy-config-panel" style={{
      width: '420px',
      minWidth: '380px',
      height: '100%',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      zIndex: 5,
    }}>
      {/* Panel Başlığı */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #EDF2F7',
        backgroundColor: '#FAFAFA',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#D90429" />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            Politika & Veri Ayarları
          </h2>
        </div>
        <p style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
          Bilgileri doldurun; politika ve Play Store Veri Güvenliği formu anında güncellensin.
        </p>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Bölüm 1: Temel Bilgiler */}
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Temel Bilgiler
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Uygulama / Oyun Adı
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={config.appName}
                  onChange={(e) => onChange({ appName: e.target.value })}
                  placeholder="Örn: Flappy Bird"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Geliştirici / Şirket Adı
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => onChange({ companyName: e.target.value })}
                  placeholder="Örn: RieStudio veya Ad Soyad"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                İletişim / Destek E-postası
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => onChange({ contactEmail: e.target.value })}
                  placeholder="support@riestudio.com.tr"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Tür: Oyun mu Uygulama mı? */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => onChange({ appType: 'game' })}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: config.appType === 'game' ? '1.5px solid #D90429' : '1px solid #CBD5E1',
                  backgroundColor: config.appType === 'game' ? '#FFF5F5' : '#FFFFFF',
                  color: config.appType === 'game' ? '#D90429' : '#334155',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Gamepad2 size={14} />
                <span>Mobil Oyun</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ appType: 'app' })}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: config.appType === 'app' ? '1.5px solid #D90429' : '1px solid #CBD5E1',
                  backgroundColor: config.appType === 'app' ? '#FFF5F5' : '#FFFFFF',
                  color: config.appType === 'app' ? '#D90429' : '#334155',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Smartphone size={14} />
                <span>Mobil Uygulama</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bölüm 2: Kullanılan SDK'lar ve Servisler */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Entegre Edilen SDK'lar
            </span>
            <span style={{ fontSize: '10.5px', color: '#D90429', fontWeight: 600 }}>
              Kritik
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px' }}>
            Oyununuzda/uygulamanızda aktif olan kütüphaneleri seçin:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {THIRD_PARTY_SERVICES.map((srv) => {
              const isChecked = !!config.services[srv.id];
              return (
                <div
                  key={srv.id}
                  onClick={() => handleToggleService(srv.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isChecked ? '1px solid #D90429' : '1px solid #E2E8F0',
                    backgroundColor: isChecked ? '#FFF5F5' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: isChecked ? 'none' : '1.5px solid #CBD5E1',
                      backgroundColor: isChecked ? '#D90429' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: isChecked ? '#0F172A' : '#334155' }}>
                        {srv.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>
                        {srv.category === 'ads' ? 'Reklam' : srv.category === 'analytics' ? 'Analitik / Çökme' : srv.category === 'iap' ? 'Ödeme / Satın Alma' : 'Oyun Servisi'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bölüm 3: Kullanıcı ve Mağaza Kuralları */}
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Kullanıcı & İzin Kuralları
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Hesap Oluşturma */}
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                  Kullanıcı Kaydı / Hesap Var mı?
                </span>
                <input
                  type="checkbox"
                  checked={config.features.hasUserAccounts}
                  onChange={(e) => handleUpdateFeature('hasUserAccounts', e.target.checked)}
                  style={{ accentColor: '#D90429', width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </label>

              {config.features.hasUserAccounts && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#B91C1C', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                    <AlertTriangle size={13} />
                    <span>Google Play Şartı: Hesap Silme URL'i Zorunludur!</span>
                  </div>
                  <input
                    type="url"
                    value={config.features.accountDeletionUrl || ''}
                    onChange={(e) => handleUpdateFeature('accountDeletionUrl', e.target.value)}
                    placeholder="https://siteniz.com/delete-account"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '11.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Çocuk / Aile Politikası */}
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                    Çocuklara / Ailelere Yönelik mi?
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                    13 yaş altı kitle (COPPA & Aileler Politikası)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.features.isTargetingChildren}
                  onChange={(e) => handleUpdateFeature('isTargetingChildren', e.target.checked)}
                  style={{ accentColor: '#D90429', width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </label>
            </div>

            {/* Dil Seçeneği */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>
                Politika Dili
              </span>
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '6px' }}>
                <button
                  type="button"
                  onClick={() => onChange({ language: 'tr' })}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: config.language === 'tr' ? '#FFFFFF' : 'transparent',
                    color: config.language === 'tr' ? '#D90429' : '#64748B',
                    boxShadow: config.language === 'tr' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Türkçe
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ language: 'en' })}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: config.language === 'en' ? '#FFFFFF' : 'transparent',
                    color: config.language === 'en' ? '#D90429' : '#64748B',
                    boxShadow: config.language === 'en' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
