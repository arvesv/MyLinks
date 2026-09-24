import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { HOMELAB_ICONS } from './homelabIcons';

interface IconRendererProps {
  icon?: string | null;
  iconType?: string;
  className?: string;
  fallbackIcon?: string;
}

export const POPULAR_LUCIDE_ICONS = [
  'Bookmark',
  'Server',
  'Globe',
  'Terminal',
  'Shield',
  'Folder',
  'HardDrive',
  'Wifi',
  'Lock',
  'Activity',
  'Database',
  'Cloud',
  'FileText',
  'Code',
  'Cpu',
  'Monitor',
  'Tv',
  'Radio',
  'Music',
  'Film',
  'Camera',
  'Mail',
  'Calendar',
  'Settings',
  'Compass',
  'ExternalLink',
];

export const IconRenderer: React.FC<IconRendererProps> = ({
  icon,
  iconType = 'favicon',
  className = 'w-6 h-6',
}) => {
  const [imgError, setImgError] = useState(false);

  // 1. Homelab SVG Icon
  if (iconType === 'homelab' && icon && HOMELAB_ICONS[icon]) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{HOMELAB_ICONS[icon].svg(className)}</span>;
  }

  // 2. Lucide Icon
  if (iconType === 'lucide' && icon) {
    const Component = (LucideIcons as any)[icon];
    if (Component) {
      return <Component className={className} />;
    }
  }

  // 3. Uploaded icon or image URL / Favicon
  if ((iconType === 'favicon' || iconType === 'upload' || !iconType) && icon && !imgError) {
    return (
      <img
        src={icon}
        alt=""
        className={`object-contain rounded ${className}`}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  // 4. Default Fallback
  return <LucideIcons.Globe className={`text-slate-400 ${className}`} />;
};
