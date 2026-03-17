// app/components/ImageUploader.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface ImageUploaderProps {
  currentImage?: string | null;
  onImageUpload: (url: string) => void;
  label: string;
}

export default function ImageUploader({ currentImage, onImageUpload, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await axios.post('/api/upload', formData);
      onImageUpload(response.data.url);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      toast.error('Error al subir la imagen');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
        {label}
      </label>
      
      <div className="flex items-center space-x-4">
        {/* Preview de la imagen - CORREGIDO */}
        <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-100">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Sin imagen
            </div>
          )}
        </div>

        {/* Botón de subida */}
        <div className="flex-1">
          <input
            type="file"
            id={`file-${label}`}
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <label
            htmlFor={`file-${label}`}
            className={`inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300 transition ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Subiendo...' : 'Subir imagen'}
          </label>
        </div>
      </div>
    </div>
  );
}