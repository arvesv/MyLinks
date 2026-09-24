import React from 'react';

export const HOMELAB_ICONS: Record<string, { label: string; svg: (className?: string) => React.ReactNode }> = {
  'home-assistant': {
    label: 'Home Assistant',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 9.5V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V9.5L12 2ZM17.5 16.5C16.12 16.5 15 15.38 15 14C15 12.62 16.12 11.5 17.5 11.5C18.88 11.5 20 12.62 20 14C20 15.38 18.88 16.5 17.5 16.5ZM12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8ZM6.5 16.5C5.12 16.5 4 15.38 4 14C4 12.62 5.12 11.5 6.5 11.5C7.88 11.5 9 12.62 9 14C9 15.38 7.88 16.5 6.5 16.5Z" />
      </svg>
    ),
  },
  'nginx-proxy-manager': {
    label: 'Nginx Proxy Manager',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM15.5 16.5L12 11.5V16.5H9.5V7.5H12L15.5 12.5V7.5H18V16.5H15.5Z" />
      </svg>
    ),
  },
  portainer: {
    label: 'Portainer',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 7V17L12 22L21 17V7L12 2ZM17.5 14.5L12 17.5L6.5 14.5V9.5L12 6.5L17.5 9.5V14.5Z" />
      </svg>
    ),
  },
  truenas: {
    label: 'TrueNAS',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 6.5V17.5L12 22L20 17.5V6.5L12 2ZM12 4.5L17.5 7.8V16.2L12 19.5L6.5 16.2V7.8L12 4.5ZM12 8L8.5 10V14L12 16L15.5 14V10L12 8Z" />
      </svg>
    ),
  },
  proxmox: {
    label: 'Proxmox',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3.5 6.9V17.1L12 22L20.5 17.1V6.9L12 2ZM12 4.6L18.2 8.2V15.8L12 19.4L5.8 15.8V8.2L12 4.6Z" />
      </svg>
    ),
  },
  jellyfin: {
    label: 'Jellyfin',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9 16.5V7.5L17 12L9 16.5Z" />
      </svg>
    ),
  },
  plex: {
    label: 'Plex',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 3H9.5L15 12L9.5 21H4L9.5 12L4 3ZM14.5 3H20L15.5 12L20 21H14.5L19 12L14.5 3Z" />
      </svg>
    ),
  },
  sonarr: {
    label: 'Sonarr',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7Z" />
      </svg>
    ),
  },
  radarr: {
    label: 'Radarr',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4ZM12 6V12L16.2 16.2L17.6 14.8L14 11.2V6H12Z" />
      </svg>
    ),
  },
  obsidian: {
    label: 'Obsidian',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.5 2L4 7.5L7 19.5L14 22L20 15L18.5 7L9.5 2ZM11.5 6.5L15.5 9.5L13.5 17.5L8.5 16L7 9.5L11.5 6.5Z" />
      </svg>
    ),
  },
  bitwarden: {
    label: 'Vaultwarden / Bitwarden',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C7 2 3 5 3 9V14C3 18.5 7 21.5 12 22C17 21.5 21 18.5 21 14V9C21 5 17 2 12 2ZM12 4.2C15.6 4.2 18.8 6.5 18.8 9.5V13.8C18.8 17.1 15.6 19.5 12 19.8C8.4 19.5 5.2 17.1 5.2 13.8V9.5C5.2 6.5 8.4 4.2 12 4.2ZM12 8C10.3 8 9 9.3 9 11C9 12.3 9.8 13.4 11 13.8V16H13V13.8C14.2 13.4 15 12.3 15 11C15 9.3 13.7 8 12 8Z" />
      </svg>
    ),
  },
  nextcloud: {
    label: 'Nextcloud',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4C9.2 4 7 6.2 7 9C7 9.3 7 9.7 7.1 10C5.3 10.3 4 11.9 4 13.8C4 16 5.8 17.8 8 17.8C8.7 17.8 9.3 17.6 9.8 17.3C10.4 18.9 12 20 13.8 20C16.1 20 18 18.1 18 15.8C18 15.4 17.9 15.1 17.8 14.8C19.1 14.2 20 12.9 20 11.4C20 9.4 18.4 7.8 16.4 7.8C16.2 7.8 16 7.8 15.8 7.9C15.1 5.6 13.7 4 12 4Z" />
      </svg>
    ),
  },
  tailscale: {
    label: 'Tailscale',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12ZM7 12C7 13.1 7.9 14 9 14C10.1 14 11 13.1 11 12C11 10.9 10.1 10 9 10C7.9 10 7 10.9 7 12ZM13 12C13 13.1 13.9 14 15 14C16.1 14 17 13.1 17 12C17 10.9 16.1 10 15 10C13.9 10 13 10.9 13 12Z" />
      </svg>
    ),
  },
  github: {
    label: 'GitHub',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.47 2 2 6.48 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21V19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26V21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.48 17.52 2 12 2Z" />
      </svg>
    ),
  },
  cloudflare: {
    label: 'Cloudflare',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.62 6 16.88 7.86 17.39 10.43L17.69 11.93L19.22 12.04C20.78 12.14 22 13.45 22 15C22 16.65 20.65 18 19 18Z" />
      </svg>
    ),
  },
  'uptime-kuma': {
    label: 'Uptime Kuma',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" />
      </svg>
    ),
  },
  'pi-hole': {
    label: 'Pi-hole',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6Z" />
      </svg>
    ),
  },
  grafana: {
    label: 'Grafana',
    svg: (cls = 'w-6 h-6') => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 12L12 22L22 12L12 2ZM12 5.8L18.2 12L12 18.2L5.8 12L12 5.8Z" />
      </svg>
    ),
  },
};
