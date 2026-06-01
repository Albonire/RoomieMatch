import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  initialQuality?: number;
}

const PROFILE_OPTIONS: CompressionOptions = {
  maxWidthOrHeight: 600,
  maxSizeMB: 0.3,
  initialQuality: 0.8,
};

const LISTING_OPTIONS: CompressionOptions = {
  maxWidthOrHeight: 1200,
  maxSizeMB: 0.5,
  initialQuality: 0.8,
};

export async function compressImage(
  file: File,
  type: 'profile' | 'listing' = 'listing'
): Promise<File> {
  const options = type === 'profile' ? PROFILE_OPTIONS : LISTING_OPTIONS;
  
  try {
    const compressed = await imageCompression(file, {
      ...options,
      useWebWorker: true,
      fileType: 'image/jpeg',
    });
    return compressed;
  } catch (err) {
    console.error('Error comprimiendo imagen, usando original:', err);
    return file;
  }
}

export async function uploadImage(
  file: File,
  token: string | null,
  type: 'profile' | 'listing' = 'listing'
): Promise<string> {
  const compressed = await compressImage(file, type);
  
  const formData = new FormData();
  formData.append('image', compressed);
  formData.append('type', type);
  
  // Si no hay token (registro), usar endpoint temporal
  const endpoint = token ? '/api/upload' : '/api/upload/temp';
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error subiendo imagen');
  }
  
  const data = await res.json();
  return data.url;
}
