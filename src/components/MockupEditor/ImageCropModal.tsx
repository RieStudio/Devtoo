import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Check, X, Crop as CropIcon, RotateCcw } from 'lucide-react';

interface ImageCropModalProps {
  imageSrc: string;
  aspectRatio?: number;
  initialCrop?: Crop;
  onCropComplete: (croppedBase64: string, cropDetails: Crop) => void;
  onResetToOriginal?: () => void;
  onCancel: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  aspectRatio,
  initialCrop: savedInitialCrop,
  onCropComplete,
  onResetToOriginal,
  onCancel,
}) => {
  const [crop, setCrop] = useState<Crop | undefined>(savedInitialCrop);
  const [completedCrop, setCompletedCrop] = useState<Crop | undefined>(savedInitialCrop);
  const imgRef = useRef<HTMLImageElement>(null);

  const calculateDefaultCoverCrop = (width: number, height: number): Crop => {
    const targetRatio = aspectRatio || (width / height);
    const imgRatio = width / height;

    let initialCropWidthPct: number;
    let initialCropHeightPct: number;
    let initialCropXPct: number;
    let initialCropYPct: number;

    if (imgRatio > targetRatio) {
      initialCropHeightPct = 100;
      initialCropWidthPct = (targetRatio / imgRatio) * 100;
      initialCropXPct = (100 - initialCropWidthPct) / 2;
      initialCropYPct = 0;
    } else {
      initialCropWidthPct = 100;
      initialCropHeightPct = (imgRatio / targetRatio) * 100;
      initialCropXPct = 0;
      initialCropYPct = (100 - initialCropHeightPct) / 2;
    }

    return {
      unit: '%',
      x: Math.max(0, initialCropXPct),
      y: Math.max(0, initialCropYPct),
      width: Math.min(100, initialCropWidthPct),
      height: Math.min(100, initialCropHeightPct),
    };
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    if (savedInitialCrop) {
      setCrop(savedInitialCrop);
      setCompletedCrop(savedInitialCrop);
      return;
    }

    const calculatedCrop = calculateDefaultCoverCrop(width, height);
    setCrop(calculatedCrop);
    setCompletedCrop(calculatedCrop);
  };

  const handleResetToDefault = () => {
    if (!imgRef.current) return;
    const defaultCrop = calculateDefaultCoverCrop(imgRef.current.width, imgRef.current.height);
    setCrop(defaultCrop);
    setCompletedCrop(defaultCrop);
  };

  const handleSaveCrop = () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop = {
      x: (completedCrop.x * image.width) / 100 * scaleX,
      y: (completedCrop.y * image.height) / 100 * scaleY,
      width: (completedCrop.width * image.width) / 100 * scaleX,
      height: (completedCrop.height * image.height) / 100 * scaleY,
    };

    // If unit is px instead of %
    if (completedCrop.unit === 'px') {
      pixelCrop.x = completedCrop.x * scaleX;
      pixelCrop.y = completedCrop.y * scaleY;
      pixelCrop.width = completedCrop.width * scaleX;
      pixelCrop.height = completedCrop.height * scaleY;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    const base64Image = canvas.toDataURL('image/png');
    onCropComplete(base64Image, completedCrop);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #EDF2F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            <CropIcon size={18} color="#D90429" />
            <span>Görseli Kırp ve Düzenle</span>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - Interactive Crop View */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F9FA',
          minHeight: '320px',
          maxHeight: 'calc(80vh - 120px)'
        }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            keepSelection
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={onImageLoad}
              style={{
                maxWidth: '100%',
                maxHeight: '55vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </ReactCrop>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #EDF2F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF'
        }}>
          {/* Reset to Original Initial Fit Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (onResetToOriginal) {
                onResetToOriginal();
              } else {
                handleResetToDefault();
              }
            }}
            title="Fotoğrafı ilk yüklendiği orijinal duruşuna döndür"
            style={{ gap: '6px' }}
          >
            <RotateCcw size={14} />
            <span>Orijinale Sıfırla</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn-secondary"
              onClick={onCancel}
            >
              İptal
            </button>

            <button
              className="btn-chili"
              onClick={handleSaveCrop}
            >
              <Check size={16} />
              <span>Kırpmayı Uygula</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
