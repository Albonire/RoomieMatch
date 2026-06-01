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

const TRUSTED_DOMAINS = [
  'randomuser.me',
  'i.pravatar.cc',
  'avatars.githubusercontent.com'
];

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

  const needsProxy = photoUrl?.startsWith('http') &&
    !TRUSTED_DOMAINS.some(domain => photoUrl!.includes(domain));

  const resolvedSrc = photoUrl
    ? (photoUrl.startsWith('http')
        ? (needsProxy ? `/api/image-proxy?url=${encodeURIComponent(photoUrl)}` : photoUrl)
        : photoUrl)
    : '';

  if (!resolvedSrc || imageError) {
    return (
      <div className={`${className} bg-editorial-secondary/40 dark:bg-editorial-secondary/20 flex items-center justify-center text-editorial-tertiary overflow-hidden`}>
        <UserIcon className={iconClassName} />
      </div>
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
