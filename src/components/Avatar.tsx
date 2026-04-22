import React from 'react';
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

interface AvatarProps {
  photoUrl?: string;
  className?: string;
  iconClassName?: string;
}

export default function Avatar({ photoUrl, className = "w-10 h-10 border border-brutal-ink/10", iconClassName = "w-5 h-5" }: AvatarProps) {
  if (photoUrl?.startsWith('icon:')) {
    const iconId = photoUrl.split(':')[1];
    const Icon = AVATAR_ICONS[iconId] || UserIcon;
    return (
      <div className={`${className} bg-brutal-bg flex items-center justify-center text-brutal-ink overflow-hidden`}>
        <Icon className={iconClassName} />
      </div>
    );
  }

  return (
    <img 
      src={photoUrl || 'https://picsum.photos/seed/user/150/150'} 
      alt="" 
      className={`${className} object-cover`} 
      referrerPolicy="no-referrer"
    />
  );
}
