import type { PrivacyPolicyConfig, DataSafetyCheckItem } from '../types/privacyPolicy';
import { THIRD_PARTY_SERVICES } from '../constants/privacyPolicyPresets';

/**
 * Generates Markdown text for the Privacy Policy
 */
export function generatePolicyMarkdown(config: PrivacyPolicyConfig): string {
  const isTr = config.language === 'tr';
  const selectedServices = THIRD_PARTY_SERVICES.filter((s) => config.services[s.id]);

  if (isTr) {
    let md = `# ${config.appName} Gizlilik Politikası

**Son Güncelleme:** ${config.effectiveDate}

Bu Gizlilik Politikası, **${config.companyName}** tarafından geliştirilen **${config.appName}** ${config.appType === 'game' ? 'mobil oyunu' : 'mobil uygulaması'} için geçerlidir.

Gizliliğinize son derece önem veriyoruz. Bu politika metni; ${config.appType === 'game' ? 'oyunu' : 'uygulamayı'} kullanırken hangi verilerin işlendiğini, üçüncü taraf servislerin rolünü ve haklarınızı açıklamaktadır.

---

## 1. Toplanan ve İşlenen Veriler

${config.features.hasUserAccounts 
  ? `### Hesap ve Kullanıcı Bilgileri
Uygulamamız kullanıcı hesabı oluşturulmasına olanak tanımaktadır. Kayıt esnasında ad/rumuz, e-posta adresi gibi temel kimlik bilgileri işlenebilir.`
  : `### Hesap Bilgileri
Uygulamamız herhangi bir kullanıcı hesabı açılmasını zorunlu kılmaz ve doğrudan ad, soyad gibi kişisel kimlik bilgilerini depolamaz.`}

### Cihaz ve Teknik Kullanım Verileri
Uygulama'nın düzgün çalışabilmesi, çökmelerin tespit edilmesi ve ${config.services.admob || config.services['unity-ads'] ? 'reklamların sunulabilmesi' : 'analitik ölçümleme'} amacıyla aşağıdaki anonim/teknik veriler işlenebilir:
- Cihaz modeli, işletim sistemi sürümü ve dil ayarları
- Benzersiz Cihaz Tanımlayıcıları (Örn: Google Reklam Kimliği - AAID, Apple IDFA)
- Uygulama içi etkileşimler, oyun oturum süreleri ve skorlar
${config.services['firebase-crashlytics'] ? '- Çökme anındaki sistem durumu ve hata günlükleri (Crash Logs)' : ''}

${config.features.hasLocationPermission ? `### Konum Bilgisi
Uygulama, size en uygun deneyimi sunabilmek için cihazınızdan yaklaşık/hassas konum bilgisine erişim talep edebilir.` : ''}

${config.features.hasCameraPermission ? `### Kamera İzni
Uygulama içerisindeki belirli işlevlerin (örneğin fotoğraf çekme veya profil güncelleme) çalışabilmesi için kamera izni talep edilebilir.` : ''}

---

## 2. Üçüncü Taraf Kütüphaneler ve Hizmet Sağlayıcılar

Uygulamamız, işlevselliği artırmak, analiz yapmak ve gelir modeli sağlamak amacıyla güvenilir üçüncü taraf kütüphaneler (SDK'lar) kullanmaktadır. Bu hizmet sağlayıcıların kendi gizlilik politikaları bulunmaktadır:

`;

    if (selectedServices.length > 0) {
      selectedServices.forEach((s) => {
        md += `- **${s.name}**: [Gizlilik Politikasını Oku](${s.privacyUrl})\n`;
      });
    } else {
      md += `*Uygulamamız herhangi bir üçüncü taraf reklam veya harici analitik SDK'sı içermemektedir.*\n`;
    }

    md += `
---

## 3. Çocukların Gizliliği (COPPA Uyumu)

${config.features.isTargetingChildren 
  ? `Uygulamamız ailelere ve çocuklara yönelik olarak tasarlanmıştır. 13 yaşından küçük çocukların kişisel kimlik bilgilerini bilerek ve isteyerek toplamıyoruz. Reklamlar ve üçüncü taraf servisler Google Play Aileler Politikası ve COPPA (Çocukların Çevrimiçi Gizliliğini Koruma Yasası) kurallarına uygun şekilde sınırlandırılmış ve filtrelenmiştir.`
  : `Uygulamamız 13 yaşın altındaki çocuklara doğrudan hitap etmemektedir. Bilerek 13 yaşından küçük çocuklardan kişisel veri toplamıyoruz. Çocuğunuzun bize kişisel bilgi verdiğini fark ederseniz lütfen bizimle iletişime geçiniz.`}

---

## 4. Veri Güvenliği ve Saklama

Toplanan tüm teknik veriler, aktarım esnasında endüstri standardı modern şifreleme protokolleri (HTTPS / TLS) ile korunmaktadır. Yetkisiz erişim, değiştirilme veya ifşaya karşı gerekli teknik ve idari güvenlik önlemleri uygulanmaktadır.

${config.features.hasUserAccounts ? `
---

## 5. Hesap ve Veri Silme Talepleri

Kullanıcılar diledikleri zaman hesaplarının ve ilişkili verilerinin silinmesini talep etme hakkına sahiptir. 
${config.features.accountDeletionUrl ? `Hesap silme talebinizi doğrudan şu adresten gerçekleştirebilirsiniz: [Hesap Silme Sayfası](${config.features.accountDeletionUrl})\n` : `Hesap ve veri silme talebiniz için lütfen **${config.contactEmail}** adresi üzerinden bizimle iletişime geçiniz.`}
` : ''}

---

## 6. Değişiklikler ve İletişim

Gizlilik politikamız zaman zaman güncellenebilir. Güncellenen politika bu sayfada yayımlandığı tarihten itibaren geçerlidir.

Sorularınız, geri bildirimleriniz veya veri talepleriniz için bize ulaşabilirsiniz:
- **Geliştirici:** ${config.companyName}
- **İletişim E-postası:** ${config.contactEmail}
`;

    return md;
  }

  // English fallback
  let md = `# ${config.appName} Privacy Policy

**Last Updated:** ${config.effectiveDate}

This Privacy Policy applies to the **${config.appName}** ${config.appType === 'game' ? 'mobile game' : 'mobile application'} ("Application") developed by **${config.companyName}** ("Developer", "we", "us", or "our").

Your privacy is paramount to us. This document explains what information is collected, how it is used, and the third-party services integrated within the Application.

---

## 1. Information Collection and Use

${config.features.hasUserAccounts 
  ? `### User Accounts
Our Application allows users to register an account. During registration, basic profile credentials such as username and email may be processed.`
  : `### Account Information
Our Application does not require account creation and does not directly store personal identification details such as your full name or physical address.`}

### Device and Diagnostic Data
For stability, performance monitoring, and ${config.services.admob || config.services['unity-ads'] ? 'ad delivery' : 'analytics'}, the Application may process the following non-personally identifiable technical information:
- Device model, operating system version, and language preferences
- Unique Device Identifiers (e.g., Google Advertising ID - AAID, Apple IDFA)
- In-app gameplay telemetry, session durations, and progression
${config.services['firebase-crashlytics'] ? '- Crash reports and system stack traces' : ''}

---

## 2. Third-Party Services

We integrate vetted third-party software development kits (SDKs) to provide core application features, analytics, and advertising. Please review their respective privacy policies:

`;

  if (selectedServices.length > 0) {
    selectedServices.forEach((s) => {
      md += `- **${s.name}**: [View Privacy Policy](${s.privacyUrl})\n`;
    });
  } else {
    md += `*No external third-party advertising or analytics SDKs are utilized in this Application.*\n`;
  }

  md += `
---

## 3. Children's Privacy (COPPA)

${config.features.isTargetingChildren
  ? `Our Application is designed for family/child audiences. We do not knowingly collect personal identifiable information from children under 13. All integrated ad networks and SDKs comply with COPPA and Google Play Families Policies.`
  : `We do not knowingly collect personal identifiable information from children under the age of 13. If you believe your child has provided us with personal information, please contact us immediately.`}

---

## 4. Security

We prioritize safeguarding your information. All transmitted diagnostic and service data utilizes industry-standard encryption protocols (HTTPS/TLS) in transit.

---

## 5. Contact Us

If you have any questions or requests regarding your data, please contact:
- **Developer:** ${config.companyName}
- **Email:** ${config.contactEmail}
`;

  return md;
}

/**
 * Generates a self-contained, standalone, beautifully styled HTML document
 * Ready to be deployed on GitHub Pages, Cloudflare Pages, Netlify or any web host.
 */
export function generatePolicyHtml(config: PrivacyPolicyConfig): string {
  const isTr = config.language === 'tr';
  const selectedServices = THIRD_PARTY_SERVICES.filter((s) => config.services[s.id]);

  return `<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.appName} - ${isTr ? 'Gizlilik Politikası' : 'Privacy Policy'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #D90429;
      --text-main: #0F172A;
      --text-muted: #64748B;
      --bg-page: #F8FAFC;
      --bg-card: #FFFFFF;
      --border-color: #E2E8F0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.65;
      padding: 40px 16px;
    }
    .container {
      max-width: 760px;
      margin: 0 auto;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 48px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }
    .badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--primary);
      background-color: rgba(217, 4, 41, 0.08);
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    .meta {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      margin-top: 36px;
      margin-bottom: 14px;
      letter-spacing: -0.3px;
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
      margin-top: 20px;
      margin-bottom: 8px;
    }
    p {
      margin-bottom: 16px;
      color: #334155;
      font-size: 15px;
    }
    ul {
      margin-bottom: 20px;
      padding-left: 24px;
    }
    li {
      margin-bottom: 8px;
      color: #334155;
      font-size: 15px;
    }
    a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    a:hover {
      text-decoration: underline;
    }
    .service-box {
      background-color: #F8FAFC;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px 20px;
      margin-top: 14px;
      margin-bottom: 24px;
    }
    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #EEF2F6;
    }
    .service-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
    }
    @media (max-width: 640px) {
      body { padding: 16px 8px; }
      .container { padding: 24px 20px; border-radius: 14px; }
      h1 { font-size: 26px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${config.appName} ${isTr ? 'Gizlilik Politikası' : 'Privacy Policy'}</h1>
    <div class="meta">
      ${isTr ? 'Son Güncelleme' : 'Last Updated'}: <strong>${config.effectiveDate}</strong> • ${isTr ? 'Geliştirici' : 'Developer'}: <strong>${config.companyName}</strong>
    </div>

    <p>
      ${isTr 
        ? `Bu Gizlilik Politikası, <strong>${config.companyName}</strong> tarafından geliştirilen <strong>${config.appName}</strong> ${config.appType === 'game' ? 'mobil oyunu' : 'mobil uygulaması'} için geçerlidir. Kullanıcılarımızın gizliliğini korumak en yüksek önceliğimizdir.`
        : `This Privacy Policy governs your use of the ${config.appType === 'game' ? 'mobile game' : 'mobile application'} <strong>${config.appName}</strong> developed by <strong>${config.companyName}</strong>. Protecting our users' data is our highest priority.`}
    </p>

    <h2>1. ${isTr ? 'Toplanan Bilgiler ve İzinler' : 'Information Collection and Permissions'}</h2>
    <p>
      ${config.features.hasUserAccounts 
        ? (isTr ? 'Uygulamamız kullanıcı hesabı oluşturulmasını destekler. Profil kaydı sırasında kullanıcı adı ve e-posta gibi temel kimlik bilgileri işlenebilir.' : 'Our application supports user registration. Basic credentials like username and email may be processed.')
        : (isTr ? 'Uygulamamız doğrudan kullanıcı hesabı gerektirmez ve ad, soyad gibi kişisel kimlik bilgilerini depolamaz.' : 'Our application does not require an account and does not store personal identification information.')}
    </p>
    <ul>
      <li>${isTr ? 'Cihaz modeli, işletim sistemi sürümü ve dil tercihleri' : 'Device model, OS version, and language preferences'}</li>
      <li>${isTr ? 'Google Reklam Kimliği (AAID) veya Apple Reklam Kimliği (IDFA)' : 'Google Advertising ID (AAID) or Apple IDFA'}</li>
      <li>${isTr ? 'Uygulama içi etkileşimler ve kullanım süreleri' : 'In-app telemetry and session analytics'}</li>
      ${config.services['firebase-crashlytics'] ? `<li>${isTr ? 'Hata tespiti için anonim çökme raporları (Crashlytics)' : 'Anonymous crash logs for stability monitoring'}</li>` : ''}
    </ul>

    <h2>2. ${isTr ? 'Üçüncü Taraf Kütüphaneler ve Ortaklar' : 'Third-Party Services'}</h2>
    <p>
      ${isTr 
        ? 'Uygulamanın çalışması, analitik ölçümler ve gelir modelleri için aşağıdaki üçüncü taraf hizmet sağlayıcılar kullanılmaktadır. Detaylı bilgi için sağlayıcıların kendi gizlilik politikalarını inceleyebilirsiniz:'
        : 'We partner with the following verified third-party SDK providers to facilitate core app features, analytics, and advertising:'}
    </p>

    <div class="service-box">
      ${selectedServices.length > 0 
        ? selectedServices.map((s) => `
          <div class="service-item">
            <div>
              <strong>${s.name}</strong>
              <div style="font-size: 12px; color: #64748B;">${s.description}</div>
            </div>
            <a href="${s.privacyUrl}" target="_blank" rel="noopener noreferrer">${isTr ? 'Politikayı Oku' : 'View Policy'}</a>
          </div>
        `).join('')
        : `<div style="color: #64748B; font-size: 14px;">${isTr ? 'Harici üçüncü taraf SDK kullanılmamaktadır.' : 'No third-party SDKs used.'}</div>`}
    </div>

    <h2>3. ${isTr ? 'Çocukların Gizliliği (COPPA)' : "Children's Privacy"}</h2>
    <p>
      ${config.features.isTargetingChildren
        ? (isTr 
            ? 'Uygulamamız çocuklara ve ailelere uygundur. 13 yaşın altındaki çocuklardan bilerek kişisel kimlik verisi toplanmamaktadır. Tüm üçüncü taraf servisler Google Play Aileler Politikası ve COPPA kurallarına uygun olarak sınırlandırılmıştır.'
            : 'Our application complies with Google Play Families Policy and COPPA. We do not knowingly collect personal information from children under 13.')
        : (isTr
            ? 'Uygulamamız 13 yaşın altındaki çocuklara doğrudan hitap etmemektedir. Bilerek 13 yaş altı çocuklardan kişisel veri toplamıyoruz.'
            : 'We do not knowingly collect data from children under 13. If you believe your child has provided us data, please contact us.')}
    </p>

    <h2>4. ${isTr ? 'Veri Güvenliği' : 'Data Security'}</h2>
    <p>
      ${isTr 
        ? 'Toplanan verilerin gizliliği modern şifreleme yöntemleri (HTTPS/TLS) ile korunmaktadır. Bilgiler yetkisiz erişime karşı güvendedir.'
        : 'All data transmitted between the Application and servers is encrypted in transit using industry-standard TLS/HTTPS protocols.'}
    </p>

    <h2>5. ${isTr ? 'İletişim' : 'Contact Us'}</h2>
    <p>
      ${isTr ? 'Bu gizlilik politikası hakkında sorularınız veya veri silme talepleriniz için bize ulaşabilirsiniz:' : 'If you have questions about this privacy policy or wish to request data deletion, contact us:'}<br>
      <strong>${config.companyName}</strong><br>
      <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>
    </p>

    <div class="footer">
      © ${new Date().getFullYear()} ${config.companyName}. ${isTr ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates the Google Play Console "Data Safety" Form Cheat Sheet
 * This is the ultimate time-saver for developers answering the 50-question questionnaire.
 */
export function generateDataSafetyCheatSheet(config: PrivacyPolicyConfig): DataSafetyCheckItem[] {
  const hasAdmob = config.services.admob || config.services['unity-ads'] || config.services.applovin || config.services['meta-audience-network'];
  const hasAnalytics = config.services['firebase-analytics'];
  const hasCrashlytics = config.services['firebase-crashlytics'];
  const hasIAP = config.services.revenuecat;
  const hasGaming = config.services['google-play-games'];

  const items: DataSafetyCheckItem[] = [
    {
      id: 'data-collected',
      question: '1. Uygulamanız herhangi bir kullanıcı verisi topluyor veya paylaşıyor mu?',
      answer: hasAdmob || hasAnalytics || hasCrashlytics || hasIAP || hasGaming ? 'EVET' : 'HAYIR',
      badgeType: hasAdmob || hasAnalytics || hasCrashlytics ? 'yes' : 'no',
      explanation: hasAdmob || hasAnalytics || hasCrashlytics
        ? 'Entegre ettiğiniz üçüncü taraf SDK’lar (AdMob, Firebase vb.) cihaz kimlikleri veya çökme verileri topladığı için Play Console bu soruya kesinlikle "EVET" demenizi zorunlu kılar.'
        : 'Hiçbir reklam, analitik veya kullanıcı hesabı SDK’sı seçilmediği için "HAYIR" seçebilirsiniz.',
    },
    {
      id: 'encryption-in-transit',
      question: '2. Toplanan tüm kullanıcı verileri aktarım sırasında şifreleniyor mu?',
      answer: 'EVET',
      badgeType: 'yes',
      explanation: 'Google AdMob, Firebase ve modern SDK’lar verileri yalnızca HTTPS/TLS şifreli bağlantı üzerinden aktarır. Güvenle "EVET" işaretleyin.',
    },
    {
      id: 'account-creation',
      question: '3. Kullanıcıların uygulamanızda hesap oluşturması için bir yöntem sağlıyor musunuz?',
      answer: config.features.hasUserAccounts ? 'EVET' : 'HAYIR',
      badgeType: config.features.hasUserAccounts ? 'yes' : 'no',
      explanation: config.features.hasUserAccounts
        ? 'DİKKAT: Hesap oluşturma varsa Google Play Console, mağaza listesinde bir "Hesap ve Veri Silme URL\'si" girmenizi zorunlu tutar.'
        : 'Oyununuzda/uygulamanızda kayıt veya giriş zorunluluğu yoksa "HAYIR" seçin.',
    },
    {
      id: 'device-identifiers',
      question: '4. Veri Türü: "Cihaz veya diğer kimlikler" (Device or other IDs - AAID vb.)',
      answer: hasAdmob || hasAnalytics ? 'EVET' : 'HAYIR',
      badgeType: hasAdmob || hasAnalytics ? 'yes' : 'no',
      explanation: hasAdmob || hasAnalytics
        ? 'AdMob veya Firebase reklam/ölçümleme için Google Reklam Kimliği’ni (AAID) toplar. Bu veri türünü seçmeli, amacı olarak "Reklam veya Pazarlama" ve "Analiz" işaretlemelisiniz.'
        : 'Herhangi bir reklam veya takip SDK’sı bulunmuyor.',
      details: [
        'Toplanıyor mu? -> EVET',
        'Paylaşılıyor mu? -> EVET (Reklam sağlayıcılarıyla paylaşılır)',
        'Amaç -> Reklam veya pazarlama, Analiz',
        'Kullanıcı bu veri toplamayı devre dışı bırakabilir mi? -> HAYIR (SDK tarafından otomatik yönetilir)',
      ],
    },
    {
      id: 'crash-logs',
      question: '5. Veri Türü: "Çökme günlükleri (Crash logs) ve Tanılama verileri"',
      answer: hasCrashlytics ? 'EVET' : 'HAYIR',
      badgeType: hasCrashlytics ? 'yes' : 'no',
      explanation: hasCrashlytics
        ? 'Firebase Crashlytics kullandığınız için bu veriyi işaretlemelisiniz.'
        : 'Hata raporlama kütüphanesi seçilmedi.',
      details: [
        'Toplanıyor mu? -> EVET',
        'Paylaşılıyor mu? -> HAYIR (Üçüncü taraflarla paylaşılmaz, geliştirici analiz eder)',
        'Amaç -> Uygulama işlevselliği, Analiz',
      ],
    },
    {
      id: 'financial-info',
      question: '6. Veri Türü: "Finansal bilgiler (Satın alma geçmişi)"',
      answer: hasIAP ? 'EVET' : 'HAYIR',
      badgeType: hasIAP ? 'yes' : 'no',
      explanation: hasIAP
        ? 'RevenueCat veya Google Play Faturalandırma kullandığınızda satın alma geçmişi işlenir. (Kredi kartı bilgilerine siz erişemezsiniz, sadece makbuz/satın alma kaydı tutulur).'
        : 'Uygulama içi satın alma veya abonelik yok.',
      details: [
        'Toplanıyor mu? -> EVET',
        'Amaç -> Uygulama işlevselliği (Abonelik kilidini açma)',
      ],
    },
    {
      id: 'app-interactions',
      question: '7. Veri Türü: "Uygulama etkileşimleri (Sayfa görüntüleme, tıklama)"',
      answer: hasAnalytics ? 'EVET' : 'HAYIR',
      badgeType: hasAnalytics ? 'yes' : 'no',
      explanation: hasAnalytics
        ? 'Firebase Analytics kullanıcı hareketlerini anonim olarak kaydeder.'
        : 'Analitik kütüphanesi aktif değil.',
      details: [
        'Toplanıyor mu? -> EVET',
        'Amaç -> Analiz (Analytics)',
      ],
    },
  ];

  return items;
}
