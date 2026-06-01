import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/imageCompression';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  type?: 'profile' | 'listing';
  token: string;
}

export default function ImageUploader({
  value,
  onChange,
  maxImages = 5,
  type = 'listing',
  token,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError('');
    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      setError(`Máximo ${maxImages} imágenes`);
      return;
    }
    
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    
    try {
      const urls: string[] = [];
      for (const file of filesToUpload) {
        const url = await uploadImage(file, token, type);
        urls.push(url);
      }
      onChange([...value, ...urls]);
    } catch (err: any) {
      setError(err.message || 'Error subiendo imágenes');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Previews grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {value.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square editorial-card overflow-hidden group p-0"
            >
              <img
                src={url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-editorial-ink/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-rose-500"
                aria-label="Eliminar imagen"
              >
                <X className="w-3 h-3" />
              </button>
              {idx === 0 && (
                <div className="absolute bottom-1 left-1 bg-editorial-accent text-white text-[9px] font-sans font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {value.length < maxImages && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={uploading}
          className={`w-full border-2 border-dashed rounded-sm p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
            dragOver
              ? 'border-editorial-accent bg-editorial-accent/5'
              : 'border-editorial-secondary hover:border-editorial-ink/30 hover:bg-editorial-secondary/20'
          } ${uploading ? 'opacity-60 cursor-wait' : ''}`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-editorial-accent animate-spin" />
              <span className="font-sans text-xs text-editorial-tertiary">
                Comprimiendo y subiendo...
              </span>
            </>
          ) : (
            <>
              <div className="p-3 bg-editorial-secondary/30 rounded-full">
                <Upload className="w-5 h-5 text-editorial-tertiary" />
              </div>
              <div className="text-center space-y-1">
                <div className="font-sans text-sm text-editorial-ink">
                  Arrastra imágenes aquí o <span className="text-editorial-accent font-medium">haz clic para seleccionar</span>
                </div>
                <div className="font-sans text-[10px] text-editorial-tertiary uppercase tracking-wider">
                  JPEG, PNG o WebP · Máx 5MB · {value.length}/{maxImages}
                </div>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-sans text-xs rounded-sm">
          {error}
        </div>
      )}
    </div>
  );
}
