import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Info 
} from 'lucide-react';
import type { PrivacyPolicyConfig } from '../../types/privacyPolicy';
import { 
  generatePolicyMarkdown, 
  generatePolicyHtml, 
  generateDataSafetyCheatSheet 
} from '../../utils/policyGenerator';

interface PolicyPreviewPaneProps {
  config: PrivacyPolicyConfig;
  onShowToast?: (message: string) => void;
}

export const PolicyPreviewPane: React.FC<PolicyPreviewPaneProps> = ({
  config,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'data-safety' | 'hosting'>('preview');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const markdownContent = generatePolicyMarkdown(config);
  const htmlContent = generatePolicyHtml(config);
  const dataSafetyItems = generateDataSafetyCheatSheet(config);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setIsCopied(true);
      if (onShowToast) onShowToast('Gizlilik politikası panoya kopyalandı.');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      if (onShowToast) onShowToast('Kopyalama başarısız oldu.');
    }
  };

  const handleDownloadHtml = () => {
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
    if (onShowToast) onShowToast('HTML dosyası indirildi.');
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `privacy-policy.md`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('Markdown dosyası indirildi.');
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Üst Sekme Çubuğu */}
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
          {[
            { id: 'preview' as const, label: 'Politika Önizlemesi' },
            { id: 'data-safety' as const, label: 'Play Store Veri Güvenliği', badge: 'Kopya Kağıdı' },
            { id: 'hosting' as const, label: 'Canlı Link & Hosting' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? '#0F172A' : '#64748B',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    backgroundColor: isSelected ? '#D90429' : '#E2E8F0',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginLeft: '6px',
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hızlı Aksiyon Butonları */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyMarkdown}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {isCopied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
            <span>{isCopied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: '820px' }}>
          {/* ========================================================================= */}
          {/* TAB 1: POLİTİKA ÖNİZLEMESİ                                                */}
          {/* ========================================================================= */}
          {activeTab === 'preview' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '36px 40px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)',
            }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                {config.appName} {config.language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
              </h1>

              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                {config.language === 'tr' ? 'Son Güncelleme' : 'Last Updated'}: <strong>{config.effectiveDate}</strong> • {config.language === 'tr' ? 'Geliştirici' : 'Developer'}: <strong>{config.companyName}</strong>
              </div>

              {/* Politika Metni Blokları */}
              <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p>
                  {config.language === 'tr' 
                    ? `Bu Gizlilik Politikası, ${config.companyName} tarafından geliştirilen ${config.appName} ${config.appType === 'game' ? 'mobil oyunu' : 'mobil uygulaması'} için geçerlidir. Kullanıcılarımızın gizliliğini korumak en yüksek önceliğimizdir.`
                    : `This Privacy Policy governs your use of the application ${config.appName} developed by ${config.companyName}. Protecting user data is our top priority.`}
                </p>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
                  1. {config.language === 'tr' ? 'Toplanan Veriler ve Cihaz Tanımlayıcıları' : 'Data Collection and Device Identifiers'}
                </h3>
                <p>
                  {config.features.hasUserAccounts 
                    ? (config.language === 'tr' ? 'Uygulamamız kullanıcı hesabı oluşturulmasına olanak tanır. Profil kaydı sırasında e-posta ve kullanıcı adı gibi temel bilgiler işlenebilir.' : 'Our application supports user registration. Basic credentials like username and email may be processed.')
                    : (config.language === 'tr' ? 'Uygulamamız doğrudan kullanıcı kaydı gerektirmez ve kişisel kimlik bilgilerini (ad, soyad vb.) toplamaz.' : 'Our application does not require user accounts and does not store personal identification information.')}
                </p>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>{config.language === 'tr' ? 'Cihaz modeli, işletim sistemi sürümü ve dil ayarları' : 'Device model, OS version, and language settings'}</li>
                  <li>{config.language === 'tr' ? 'Google Reklam Kimliği (AAID) veya Apple Reklam Kimliği (IDFA)' : 'Google Advertising ID (AAID) or Apple IDFA'}</li>
                  <li>{config.language === 'tr' ? 'Uygulama içi etkileşimler ve oturum istatistikleri' : 'In-app interactions and telemetry'}</li>
                  {config.services['firebase-crashlytics'] && (
                    <li>{config.language === 'tr' ? 'Hata tespiti için anonim çökme raporları (Crashlytics)' : 'Crash logs and system diagnostics'}</li>
                  )}
                </ul>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
                  2. {config.language === 'tr' ? 'Üçüncü Taraf Kütüphaneler ve Ortaklar' : 'Third-Party SDKs'}
                </h3>
                <p>
                  {config.language === 'tr' 
                    ? 'Uygulamamızın çalışması, analitik ölçümler ve gelir modelleri için aşağıdaki üçüncü taraf hizmet sağlayıcılar kullanılmaktadır:'
                    : 'The application integrates vetted third-party SDKs to facilitate core features and analytics:'}
                </p>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 18px' }}>
                  {Object.entries(config.services).filter(([, val]) => val).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(config.services)
                        .filter(([, val]) => val)
                        .map(([id]) => (
                          <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>• {id.replace('-', ' ').toUpperCase()}</span>
                            <span style={{ color: '#D90429', fontSize: '11.5px', fontWeight: 600 }}>Entegre Edildi</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={{ color: '#64748B', fontSize: '12px' }}>
                      {config.language === 'tr' ? 'Harici üçüncü taraf kütüphane seçilmedi.' : 'No third-party SDKs selected.'}
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
                  3. {config.language === 'tr' ? 'Çocukların Gizliliği (COPPA)' : "Children's Privacy"}
                </h3>
                <p>
                  {config.features.isTargetingChildren
                    ? (config.language === 'tr' ? 'Uygulamamız çocuklara ve ailelere uygundur. 13 yaşından küçük çocukların kişisel kimlik verileri bilerek toplanmamaktadır. Tüm servisler COPPA kurallarına uygun olarak sınırlandırılmıştır.' : 'Our application complies with COPPA and Google Play Families Policies.')
                    : (config.language === 'tr' ? 'Uygulamamız 13 yaşın altındaki çocuklara doğrudan hitap etmemektedir. Bilerek 13 yaşından küçük çocuklardan kişisel veri toplamıyoruz.' : 'We do not knowingly collect personal data from children under 13.')}
                </p>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
                  4. {config.language === 'tr' ? 'İletişim ve Veri Talepleri' : 'Contact Us'}
                </h3>
                <p>
                  {config.language === 'tr' ? 'Gizlilik politikamız veya veri silme talepleriniz için bize ulaşabilirsiniz:' : 'For any privacy inquiries or data requests, please reach out:'}<br />
                  <strong>{config.companyName}</strong> — <a href={`mailto:${config.contactEmail}`} style={{ color: '#D90429', textDecoration: 'none', fontWeight: 600 }}>{config.contactEmail}</a>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PLAY STORE VERİ GÜVENLİĞİ KOPYA KAĞIDI                             */}
          {/* ========================================================================= */}
          {activeTab === 'data-safety' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Bilgilendirme Başlığı */}
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                <Info size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E3A8A', marginBottom: '2px' }}>
                    Google Play Console "Veri Güvenliği" (Data Safety) Form Rehberi
                  </div>
                  <div style={{ fontSize: '12px', color: '#1E40AF', lineHeight: '1.5' }}>
                    Google Play Console'daki Veri Güvenliği formunu doldururken aşağıdaki sorulara birebir bu yanıtları verin. Bu sayede politikanız ile mağaza anketiniz %100 uyuşur ve mağaza reddi (rejection) yaşamazsınız.
                  </div>
                </div>
              </div>

              {/* Soru Kartları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dataSafetyItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                        {item.question}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          backgroundColor: item.badgeType === 'yes' ? '#DCFCE7' : '#F1F5F9',
                          color: item.badgeType === 'yes' ? '#166534' : '#475569',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {item.answer}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', marginBottom: item.details ? '10px' : '0' }}>
                      {item.explanation}
                    </div>

                    {item.details && (
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        border: '1px solid #EDF2F7',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}>
                        {item.details.map((detail, idx) => (
                          <div key={idx} style={{ fontSize: '11.5px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#D90429', fontWeight: 700 }}>›</span>
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CANLI LİNK & HOSTING REHBERİ                                       */}
          {/* ========================================================================= */}
          {activeTab === 'hosting' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Giriş Kartı */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={18} color="#D90429" />
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    1 Dakikada Ücretsiz Canlı Gizlilik Politikası URL'i Alma
                  </div>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: '1.5' }}>
                  Google Play ve App Store, gizlilik politikasının <strong>HTTPS://</strong> ile başlayan canlı bir web linkinde barındırılmasını zorunlu tutar. Alan adınız (domain) olmasa dahi aşağıdaki 2 ücretsiz yöntemle anında canlı URL edinebilirsiniz:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '18px' }}>
                  {/* Yöntem 1: GitHub Pages */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Yöntem 1: GitHub Pages (En Çok Tercih Edilen)
                    </div>
                    <ol style={{ fontSize: '11.5px', color: '#475569', paddingLeft: '18px', lineHeight: '1.6', margin: 0 }}>
                      <li>Yukarıdaki <strong>"HTML İndir"</strong> butonuyla dosyayı indirin.</li>
                      <li>Dosya adını <code>index.html</code> yapın.</li>
                      <li>GitHub'da <code>privacy-policy</code> adında genel (public) bir repo açıp dosyayı yükleyin.</li>
                      <li>Repo Ayarları (Settings) ➔ <strong>Pages</strong> sekmesinden Branch'i <code>main</code> seçip kaydedin.</li>
                      <li>URL'iniz hazır: <code>https://kullaniciadi.github.io/privacy-policy/</code></li>
                    </ol>
                  </div>

                  {/* Yöntem 2: Netlify Drop */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Yöntem 2: Netlify Drop (Sürükle & Bırak)
                    </div>
                    <ol style={{ fontSize: '11.5px', color: '#475569', paddingLeft: '18px', lineHeight: '1.6', margin: 0 }}>
                      <li>İndirdiğiniz HTML dosyasını bir klasöre koyun (adı <code>index.html</code> olsun).</li>
                      <li><strong>app.netlify.com/drop</strong> adresine gidin.</li>
                      <li>Klasörü ekrana sürükleyip bırakın.</li>
                      <li>3 saniye içinde kalıcı ve ücretsiz <code>https://...netlify.app</code> canlı linkiniz oluşur.</li>
                    </ol>
                  </div>
                </div>

                {/* Butonlar */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-chili"
                    onClick={handleDownloadHtml}
                    style={{ padding: '8px 18px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={15} />
                    <span>Hazır "privacy-policy.html" İndir</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleDownloadMarkdown}
                    style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={15} />
                    <span>Markdown (.md) Olarak İndir</span>
                  </button>
                </div>
              </div>

              {/* Mağaza Konsollarına Ekleme İpucu */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px 24px',
              }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Bu URL Mağazada Nereye Girilir?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
                  <div>
                    <strong>Google Play Console:</strong> Sol menüden <em>Politika ve programlar ➔ Uygulama içeriği ➔ Gizlilik Politikası</em> alanına URL'i yapıştırıp kaydedin.
                  </div>
                  <div>
                    <strong>App Store Connect:</strong> Uygulama sekmesinde <em>Genel ➔ Uygulama Bilgileri ➔ Gizlilik Politikası URL'si</em> alanına yapıştırın.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
