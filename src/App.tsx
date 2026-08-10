import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import type { MockupConfig } from './types/mockup';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MockupCanvas } from './components/MockupEditor/MockupCanvas';
import { InspectorPanel } from './components/MockupEditor/InspectorPanel';

const INITIAL_CONFIG: MockupConfig = {
  preset: 'appstore-6.7',
  width: 1290,
  height: 2796,
  bgType: 'solid',
  bgColor: '#FFF0F3',
  patternOpacity: 0.1,
  deviceType: 'iphone16pro',
  deviceColor: 'dark',
  screenshotUrl: null,
  screenshotScale: 1,
  screenshotOffsetX: 0,
  screenshotOffsetY: 0,
  padding: 32,
  borderRadius: 24,
  shadowDepth: 'medium',
  frameRotation: 0,
  showHeadline: true,
  headlineText: 'Mobil Uygulamanızın Adı',
  subtitleText: 'App Store & Play Store için hazır premium ekran görseli',
  textColor: '#0F172A',
  fontFamily: 'sans',
  textPosition: 'top',
  exportScale: 2,
};

export function App() {
  const [activeTool, setActiveTool] = useState<string>('mockup-editor');
  const [config, setConfig] = useState<MockupConfig>(INITIAL_CONFIG);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleUpdateConfig = (updated: Partial<MockupConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleUpdateConfig({ screenshotUrl: e.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    };
    input.click();
  };

  const handleExportPng = async () => {
    if (!exportRef.current) return;

    try {
      setIsExporting(true);
      const pixelRatio = config.exportScale || 2;
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: pixelRatio,
      });

      const link = document.createElement('a');
      link.download = `devtoo-mockup-${config.preset}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Dışa aktarma hatası:', err);
      alert('Görsel dışa aktarılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="devtoo-layout">
      {/* Sol Sabit Menü (Sidebar) */}
      <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Ana Çalışma Alanı (Workspace) */}
      <div className="main-workspace">
        {/* Üst Navigasyon Barı */}
        <Header
          onExport={handleExportPng}
          onUploadClick={handleTriggerUpload}
          isExporting={isExporting}
        />

        {/* Editör & Sağ Inspector Alanı */}
        <div className="editor-container">
          <MockupCanvas
            config={config}
            onChangeConfig={handleUpdateConfig}
            onUploadImageClick={handleTriggerUpload}
            exportRef={exportRef}
          />

          <InspectorPanel
            config={config}
            onChangeConfig={handleUpdateConfig}
            onFileSelect={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
