import React, { useState, useRef, useEffect } from 'react';
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
  const activeHandleRef = useRef<string | null>(null);
  const currentRatioRef = useRef<number>(aspectRatio || 1);

  // Sync initial crop whenever modal opens with saved crop data
  useEffect(() => {
    if (savedInitialCrop) {
      setCrop(savedInitialCrop);
      setCompletedCrop(savedInitialCrop);
    }
  }, [savedInitialCrop]);

  // Global pointer up listener to clear active handle
  useEffect(() => {
    const handlePointerUp = () => {
      activeHandleRef.current = null;
    };
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

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

    // If user previously cropped this image, ALWAYS restore their last crop state
    if (savedInitialCrop) {
      setCrop(savedInitialCrop);
      setCompletedCrop(savedInitialCrop);
      const curW = savedInitialCrop.unit === '%' ? (savedInitialCrop.width * width) / 100 : savedInitialCrop.width;
      const curH = savedInitialCrop.unit === '%' ? (savedInitialCrop.height * height) / 100 : savedInitialCrop.height;
      if (curH > 0) {
        currentRatioRef.current = curW / curH;
      }
      return;
    }

    const calculatedCrop = calculateDefaultCoverCrop(width, height);
    currentRatioRef.current = aspectRatio || (width / height);
    setCrop(calculatedCrop);
    setCompletedCrop(calculatedCrop);
  };

  const handleResetToDefault = () => {
    if (!imgRef.current) return;
    const defaultCrop = calculateDefaultCoverCrop(imgRef.current.width, imgRef.current.height);
    currentRatioRef.current = aspectRatio || (imgRef.current.width / imgRef.current.height);
    setCrop(defaultCrop);
    setCompletedCrop(defaultCrop);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const ord = target.dataset?.ord || target.closest('[data-ord]')?.getAttribute('data-ord') || null;
    activeHandleRef.current = ord;

    if (ord && ['nw', 'ne', 'se', 'sw'].includes(ord)) {
      if (aspectRatio) {
        currentRatioRef.current = aspectRatio;
      } else if (imgRef.current && crop) {
        const curW = crop.unit === '%' ? (crop.width * imgRef.current.width) / 100 : crop.width;
        const curH = crop.unit === '%' ? (crop.height * imgRef.current.height) / 100 : crop.height;
        if (curH > 0) currentRatioRef.current = curW / curH;
      }
    }
  };

  const handleCropChange = (pixelCrop: any, percentCrop: any) => {
    const ord = activeHandleRef.current;
    const img = imgRef.current;

    // If resizing from edge handles (n, s, e, w) or moving crop selection, allow free movement
    if (!ord || !['nw', 'ne', 'se', 'sw'].includes(ord) || !img) {
      setCrop(percentCrop);
      setCompletedCrop(percentCrop);
      return;
    }

    // When resizing from CORNERS (nw, ne, se, sw): strictly preserve aspect ratio
    const boundW = img.width;
    const boundH = img.height;
    const r = currentRatioRef.current || aspectRatio || 1;

    let newW = pixelCrop.width;
    let newH = pixelCrop.height;
    let newX = pixelCrop.x;
    let newY = pixelCrop.y;

    if (ord === 'se') {
      newH = newW / r;
      if (newY + newH > boundH) {
        newH = boundH - newY;
        newW = newH * r;
      }
      if (newX + newW > boundW) {
        newW = boundW - newX;
        newH = newW / r;
      }
    } else if (ord === 'sw') {
      const anchorRight = pixelCrop.x + pixelCrop.width;
      newH = newW / r;
      if (newY + newH > boundH) {
        newH = boundH - newY;
        newW = newH * r;
      }
      if (anchorRight - newW < 0) {
        newW = anchorRight;
        newH = newW / r;
      }
      newX = anchorRight - newW;
    } else if (ord === 'ne') {
      const anchorBottom = pixelCrop.y + pixelCrop.height;
      newH = newW / r;
      if (anchorBottom - newH < 0) {
        newH = anchorBottom;
        newW = newH * r;
      }
      if (newX + newW > boundW) {
        newW = boundW - newX;
        newH = newW / r;
      }
      newY = anchorBottom - newH;
    } else if (ord === 'nw') {
      const anchorRight = pixelCrop.x + pixelCrop.width;
      const anchorBottom = pixelCrop.y + pixelCrop.height;
      newH = newW / r;
      if (anchorBottom - newH < 0) {
        newH = anchorBottom;
        newW = newH * r;
      }
      if (anchorRight - newW < 0) {
        newW = anchorRight;
        newH = newW / r;
      }
      newX = anchorRight - newW;
      newY = anchorBottom - newH;
    }

    newW = Math.max(20, newW);
    newH = Math.max(20, newH);

    const constrainedPercentCrop: Crop = {
      unit: '%',
      x: (newX / boundW) * 100,
      y: (newY / boundH) * 100,
      width: (newW / boundW) * 100,
      height: (newH / boundH) * 100,
    };

    setCrop(constrainedPercentCrop);
    setCompletedCrop(constrainedPercentCrop);
  };

  const handleCropComplete = (pixelCrop: any, percentCrop: any) => {
    setCompletedCrop(percentCrop);
    if (pixelCrop.height > 0 && activeHandleRef.current && ['n', 's', 'e', 'w'].includes(activeHandleRef.current)) {
      currentRatioRef.current = pixelCrop.width / pixelCrop.height;
    }
    activeHandleRef.current = null;
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

    const targetWidth = Math.max(1, Math.round(pixelCrop.width));
    const targetHeight = Math.max(1, Math.round(pixelCrop.height));

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );

    const base64Image = canvas.toDataURL('image/png');
    // Ensure completed crop details are saved in % unit for consistent responsive restore
    const percentCropDetails: Crop = {
      unit: '%',
      x: completedCrop.unit === '%' ? completedCrop.x : (completedCrop.x / image.width) * 100,
      y: completedCrop.unit === '%' ? completedCrop.y : (completedCrop.y / image.height) * 100,
      width: completedCrop.unit === '%' ? completedCrop.width : (completedCrop.width / image.width) * 100,
      height: completedCrop.unit === '%' ? completedCrop.height : (completedCrop.height / image.height) * 100,
    };
    onCropComplete(base64Image, percentCropDetails);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CropIcon size={18} color="#D90429" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Görseli Kırp ve Düzenle</span>
            <span style={{
              fontSize: '11px',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 600,
              border: '1px solid #E2E8F0',
            }}>
              Köşeler: Orantılı / Kenarlar: En-Boy
            </span>
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
        <div 
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8F9FA',
            minHeight: '320px',
            maxHeight: 'calc(80vh - 120px)'
          }}
          onPointerDownCapture={handlePointerDown}
        >
          <ReactCrop
            crop={crop}
            minWidth={20}
            minHeight={20}
            onChange={handleCropChange}
            onComplete={handleCropComplete}
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
