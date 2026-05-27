import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, Smile, Ghost, Cat, Dog, Rocket, 
  Coffee, Music, Gamepad2, Camera, Palette, Heart, 
  Star, Zap, Cloud, Moon, Sun, Flame,
  Pizza, Bike, Book, GraduationCap, Laptop, Headphones
} from 'lucide-react';

const AVATAR_ICONS: Record<string, any> = {
  user: UserIcon,
  smile: Smile,
  ghost: Ghost,
  cat: Cat,
  dog: Dog,
  rocket: Rocket,
  coffee: Coffee,
  music: Music,
  gamepad: Gamepad2,
  camera: Camera,
  palette: Palette,
  heart: Heart,
  star: Star,
  zap: Zap,
  cloud: Cloud,
  moon: Moon,
  sun: Sun,
  flame: Flame,
  pizza: Pizza,
  bike: Bike,
  book: Book,
  grad: GraduationCap,
  laptop: Laptop,
  headphones: Headphones
};

const DEFAULT_FEMALE_AVATAR =
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop';

interface AvatarProps {
  photoUrl?: string;
  className?: string;
  iconClassName?: string;
}

export default function Avatar({ photoUrl, className = "w-10 h-10 border border-editorial-secondary/40", iconClassName = "w-5 h-5" }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photoUrl]);

  if (photoUrl?.startsWith('icon:')) {
    const iconId = photoUrl.split(':')[1];
    const Icon = AVATAR_ICONS[iconId] || UserIcon;
    return (
      <div className={`${className} bg-editorial-bg flex items-center justify-center text-editorial-ink overflow-hidden`}>
        <Icon className={iconClassName} />
      </div>
    );
  }

  const resolvedSrc = photoUrl && /^https?:\/\//i.test(photoUrl)
    ? `/api/image-proxy?url=${encodeURIComponent(photoUrl)}`
    : photoUrl || '';

  if (!resolvedSrc || imageError) {
    return (
      <img
        src={DEFAULT_FEMALE_AVATAR}
        alt="Avatar femenino"
        className={`${className} object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <img 
      src={resolvedSrc}
      alt="Avatar de usuario" 
      className={`${className} object-cover`} 
      referrerPolicy="no-referrer"
      onError={() => setImageError(true)}
    />
  );
}
