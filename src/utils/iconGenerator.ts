import JSZip from 'jszip';
import type { IconSizeSpec } from '../types/iconResizer';
import { generateXcodeContentsJson, generateWebHtmlSnippet } from '../constants/iconSizes';

interface RenderOptions {
  bgColor: string;
  isTransparentBg: boolean;
  paddingPercent: number; // 0 to 40%
  isRound?: boolean;
}

/**
 * High-quality client-side canvas rendering of an icon to exact dimensions
 */
export function renderIconToCanvas(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  options: RenderOptions
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If round icon requested (e.g. Android ic_launcher_round)
  if (options.isRound) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(targetWidth / 2, targetHeight / 2, targetWidth / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  // Draw background if not transparent
  if (!options.isTransparentBg && options.bgColor) {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Calculate scaled dimension based on padding percentage
  const paddingRatio = Math.max(0, Math.min(0.45, options.paddingPercent / 100));
  const innerWidth = targetWidth * (1 - paddingRatio * 2);
  const innerHeight = targetHeight * (1 - paddingRatio * 2);
  const offsetX = targetWidth * paddingRatio;
  const offsetY = targetHeight * paddingRatio;

  // Preserve image aspect ratio inside the inner bounds
  const imgAspect = img.width / img.height;
  const targetAspect = innerWidth / innerHeight;

  let drawW = innerWidth;
  let drawH = innerHeight;
  let drawX = offsetX;
  let drawY = offsetY;

  if (imgAspect > targetAspect) {
    drawH = innerWidth / imgAspect;
    drawY = offsetY + (innerHeight - drawH) / 2;
  } else {
    drawW = innerHeight * imgAspect;
    drawX = offsetX + (innerWidth - drawW) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  if (options.isRound) {
    ctx.restore();
  }

  return canvas;
}

/**
 * Triggers instant browser download for a Blob
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports a single icon specification directly to PNG
 */
export async function exportSingleIcon(
  img: HTMLImageElement,
  spec: IconSizeSpec,
  options: RenderOptions
): Promise<void> {
  const canvas = renderIconToCanvas(img, spec.width, spec.height, {
    ...options,
    isRound: spec.isRound,
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, spec.fileName);
      }
      resolve();
    }, 'image/png');
  });
}

/**
 * Builds and downloads a complete ZIP bundle containing Xcode asset catalog,
 * Android Studio mipmap folders, and Web favicons.
 */
export async function exportIconZipBundle(
  img: HTMLImageElement,
  specs: IconSizeSpec[],
  options: {
    bgColor: string;
    isTransparentBg: boolean;
    paddingPercent: number;
    appName: string;
  },
  onProgress?: (percent: number, statusText: string) => void
): Promise<void> {
  const zip = new JSZip();
  const total = specs.length;

  // Render each icon size and add to corresponding folder in ZIP
  for (let i = 0; i < total; i++) {
    const spec = specs[i];
    if (onProgress) {
      const pct = Math.round(((i + 1) / total) * 75);
      onProgress(pct, `${spec.name} (${spec.width}x${spec.height}) işleniyor...`);
    }

    const canvas = renderIconToCanvas(img, spec.width, spec.height, {
      bgColor: options.bgColor,
      isTransparentBg: options.isTransparentBg,
      paddingPercent: options.paddingPercent,
      isRound: spec.isRound,
    });

    const dataUrl = canvas.toDataURL('image/png');
    // Extract base64 part
    const base64Data = dataUrl.split(',')[1];

    zip.file(`${spec.folder}/${spec.fileName}`, base64Data, { base64: true });
  }

  // If iOS icons were included, add Xcode Contents.json
  const hasIos = specs.some((s) => s.platform === 'ios');
  if (hasIos) {
    const contentsJson = generateXcodeContentsJson(specs);
    zip.file('ios/AppIcon.appiconset/Contents.json', contentsJson);
  }

  // If Web icons were included, add HTML snippet and site.webmanifest
  const hasWeb = specs.some((s) => s.platform === 'web');
  if (hasWeb) {
    zip.file('web/index-snippet.html', generateWebHtmlSnippet());
    const webmanifest = {
      name: options.appName || 'My App',
      short_name: options.appName || 'App',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: options.bgColor || '#FFFFFF',
      background_color: options.bgColor || '#FFFFFF',
      display: 'standalone',
    };
    zip.file('web/site.webmanifest', JSON.stringify(webmanifest, null, 2));
  }

  // Add README instruction file
  const readme = `# Devtoo App Icon Resizer Paketi

Bu arşiv Devtoo tarafından oluşturulmuştur.

## Kurulum Kılavuzu:

### 1. iOS / Xcode:
- \`ios/AppIcon.appiconset\` klasörünü doğrudan Xcode projenizin \`Assets.xcassets\` içine sürükleyip bırakın.
- Xcode simgeleri boyutlarına ve scale değerlerine göre otomatik olarak tanıyacaktır.

### 2. Android / Android Studio:
- \`android/res/\` klasörünün içindeki \`mipmap-*\` klasörlerini Android projenizin \`app/src/main/res/\` dizinine kopyalayın.
- \`playstore-icon.png\` (512x512) dosyasını Google Play Console mağaza girişi için kullanın.

### 3. Web & Favicon:
- \`web/\` klasöründeki dosyaları web sitenizin ana dizinine yerleştirin.
- \`web/index-snippet.html\` dosyasındaki etiketleri HTML \`<head>\` bölümünüze yapıştırın.

Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}
`;
  zip.file('README.txt', readme);

  if (onProgress) {
    onProgress(85, 'ZIP arşivi paketleniyor...');
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        const pct = 85 + Math.round((metadata.percent / 100) * 14);
        onProgress(pct, `ZIP sıkıştırılıyor (%${Math.round(metadata.percent)})...`);
      }
    }
  );

  const safeAppName = (options.appName || 'app-icons')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  downloadBlob(zipBlob, `${safeAppName}-iconset.zip`);

  if (onProgress) {
    onProgress(100, 'İndirme tamamlandı!');
  }
}

/**
 * Generates an ultra-sleek high-res sample icon for immediate testing
 */
export function createSampleIconDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Vibrant gradient background
  const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
  gradient.addColorStop(0, '#D90429');
  gradient.addColorStop(0.5, '#EF233C');
  gradient.addColorStop(1, '#8D99AE');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft inner ambient glow
  const radial = ctx.createRadialGradient(512, 400, 50, 512, 512, 600);
  radial.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  radial.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, 1024, 1024);

  // Draw modern vector emblem in center (no emojis)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(512, 512, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D90429';
  ctx.font = 'bold 220px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('D', 512, 520);

  return canvas.toDataURL('image/png');
}
