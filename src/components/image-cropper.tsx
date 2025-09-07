"use client"

import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface ImageCropperProps {
  imageSrc: string | null;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onClose: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  }

  const handleCrop = async () => {
    if (imgRef.current && crop?.width && crop?.height) {
      const croppedBlob = await getCroppedImg(imgRef.current, crop);
      onCropComplete(croppedBlob);
      onClose();
    }
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={!!imageSrc} onOpenChange={onClose}>
      <DialogContent className="text-white bg-gray-900 border-red-500/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Recorta tu Foto de Perfil</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center my-4 p-2 bg-black/20 rounded-lg">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            circularCrop
            keepSelection
            aspect={1}
            minWidth={100}
          >
            <img 
              ref={imgRef} 
              src={imageSrc} 
              onLoad={onImageLoad} 
              alt="Imagen para recortar" 
              style={{ maxHeight: '70vh' }}
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button onClick={handleCrop} className="bg-red-600 hover:bg-red-700">Recortar y Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- VERSIÓN CORREGIDA Y DEFINITIVA DE LA FUNCIÓN DE RECORTE ---
function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No se pudo obtener el contexto 2D');
    }

    // El crop viene en porcentajes (0-100). Lo convertimos a píxeles
    // basándonos en el tamaño REAL de la imagen original (naturalWidth/Height).
    const cropX = (crop.x / 100) * image.naturalWidth;
    const cropY = (crop.y / 100) * image.naturalHeight;
    const cropWidth = (crop.width / 100) * image.naturalWidth;
    const cropHeight = (crop.height / 100) * image.naturalHeight;

    // El tamaño de nuestro canvas será el tamaño de la imagen recortada.
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Dibujamos la porción recortada de la imagen original en nuestro canvas.
    ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('La creación del blob falló.'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.95); // Exportamos como JPEG de alta calidad
    });
}