# MyLinks 🚀

A vibe coded, self-hosted bookmark dashboard and homelab startpage designed for seamless operation within a **Tailscale tailnet**.

Packaged as a single lightweight Docker container combining a responsive **React 18 + Tailwind CSS** frontend, a **Node.js** backend, and an embedded **SQLite** database.

---

## ✨ Features

- **Tailscale-Native Authentication**:
  - Automatically identifies users on your tailnet via Tailscale Serve / proxy headers or Tailscale LocalAPI socket.
  - Granular access control: Any tailnet member can view bookmarks and use search, while editing/managing links is restricted to configured `ADMIN_USERS`.
- **Instant Fuzzy Search (`Ctrl+K` or `/`)**:
  - Interactive command palette to quickly filter and open services, internal links, or tags with arrow keys and `Enter`.
- **Rich Icon System**:
  - **Homelab Brand Logos**: Sharp, inline SVG icons for Home Assistant, Nginx Proxy Manager, Portainer, TrueNAS, Proxmox, Jellyfin, Plex, Sonarr, Radarr, Obsidian, Vaultwarden, Nextcloud, Tailscale, Cloudflare, Pi-hole, Grafana, and more.
  - **Lucide Icon Library**: Extensive set of general interface icons.
  - **Auto-Favicon Scraper**: Scrapes high-res touch icons directly from URLs.
  - **Custom Image Upload**: Upload any PNG, SVG, or WEBP image.
- **Smart Metadata Auto-Fetch**:
  - Enter any URL to automatically extract the website title, description, and suggested service logo.
- **Layout & Organization**:
  - **Favorites Bar**: Pinned quick-launch bar at the top for your most daily-used bookmarks.
  - **Frequently Used**: Automatically tracks click counts and bubbles up your most accessed services.
  - **Collapsible Categories**: Group links into structured categories with drag-and-drop reordering.
  - **View Mode Toggle**: Switch seamlessly between **Card Grid** and dense **Compact List** view.
  - **Tag Filter Chips**: Quickly isolate links across all categories by tag (`#iot`, `#media`, `#dev`).
- **Backup & Portability**:
  - One-click JSON database export and restore directly from the UI.
- **System & Build Info Diagnostics**:
  - Clickable status indicators in the navbar and footer opening a comprehensive diagnostics modal showing Git commit SHA (with one-click copy & GitHub link), build timestamp, live server uptime ticker, Node.js runtime, OS architecture, memory usage, and SQLite database stats.
- **Zero Heavy Dependencies**:
  - Embedded SQLite database stored in `/data/mylinks.db` with zero external database containers needed.

---

## 🚀 Quick Start with Docker Compose

1. Clone or copy this repository:

```bash
git clone https://github.com/your-username/MyLinks.git
cd MyLinks
```

1. Create a `docker-compose.yml`:

```yaml
services:
  mylinks:
    image: ghcr.io/arvesv/mylinks:0.1
    container_name: mylinks
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATA_DIR=/data
      - ADMIN_USERS=your-tailscale-login,admin@example.com
      - DEV_MODE=false
    volumes:
      - ./data:/data
```

1. Launch the container:

```bash
docker compose up -d
```

Open `http://localhost:3000` (or your tailnet machine address) to start using your dashboard!

---

## 🔒 Tailscale Tailnet Integration

### Option 1: Tailscale Serve (Recommended)

Tailscale Serve exposes your local service securely across your tailnet with automatic HTTPS and passes user identity headers (`Tailscale-User-Login`, `Tailscale-User-Name`):

```bash
# Serve MyLinks on HTTPS across your tailnet
tailscale serve --https=443 http://localhost:3000
```

Add your Tailscale login handle to `ADMIN_USERS` in `docker-compose.yml`:

```env
ADMIN_USERS=alice@example.com,bob@github
```

- Alice and Bob will have full **Admin** editing capabilities (add, edit, delete, reorder links, and backup).
- Anyone else on your tailnet will have **Viewer** permissions to browse, search, and click links.

### Option 2: Nginx Proxy Manager on Tailscale

If you run Nginx Proxy Manager (NPM) on your tailnet machine:

1. Create a Proxy Host pointing to `http://mylinks:3000` (or `http://host.docker.internal:3000`).
2. Optional: Forward client IP and headers (`X-Forwarded-For`).
3. To enable LocalAPI whois user detection, mount `/var/run/tailscale/tailscaled.sock` into the container.

---

## ⚙️ Configuration Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port on which the web server listens. |
| `DATA_DIR` | `/data` | Path to persistent storage for SQLite database and uploaded icons. |
| `ADMIN_USERS` | *empty* | Comma-separated list of Tailscale logins/emails granted edit permissions. If empty, all connections have admin access. |
| `DEV_MODE` | `false` | When `true`, automatically assigns the client an admin role without requiring Tailscale headers. |
| `TAILSCALE_SOCKET` | `/var/run/tailscale/tailscaled.sock` | Optional path to tailscaled daemon socket for LocalAPI whois identity lookups. |

---

## 💻 Local Development

Run the frontend and backend with hot-reloading:

```bash
# Install dependencies
npm install

# Run backend API and Vite dev server concurrently
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- API calls from `http://localhost:5173/api` are automatically proxied to port 3000.

### Build Production Bundle Locally

```bash
npm run build
npm start
```

---

## 📦 Data Storage & Backup

All links, categories, and settings are saved in a single SQLite database file:

- Database: `<DATA_DIR>/mylinks.db`
- Uploaded Icons: `<DATA_DIR>/uploads/`

You can back up simply by copying the `./data` directory or using the **Backup -> Export Snapshot** button in the dashboard navigation bar.
