# MyLinks 🚀

A vibe coded, self-hosted bookmark dashboard and homelab startpage designed for seamless operation within a **Tailscale tailnet**.

Packaged as a single lightweight Docker container combining a responsive **React 19 + Tailwind CSS** frontend, a **Node.js** backend, and an embedded **SQLite** database.

---

## ✨ Features

- **Tailscale-Native Authentication**:
  - Automatically identifies users on your tailnet via Tailscale Serve / proxy headers or Tailscale LocalAPI socket.
  - Granular access control: Any tailnet member can view bookmarks and use search, while editing/managing links is restricted to configured `ADMIN_USERS`.
- **Live Service Health & Availability Checks**:
  - Automatically verifies reachability of local and external services with live latency (ms) and HTTP status codes.
  - Supports self-signed TLS certificates (common in homelab setups like Proxmox, TrueNAS, and router dashboards) with on-demand single-link or full dashboard re-checking.
- **Theme Mode Control (System / Light / Dark)**:
  - Toggle seamlessly between system preference, light mode, and dark mode with persistent settings.
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
  - **View Mode Toggle**: Switch seamlessly between **Card Grid**, dense **Compact List**, and detailed **Table** view.
  - **Tag Filter Chips**: Quickly isolate links across all categories by tag (`#iot`, `#media`, `#dev`).
- **Backup & Portability**:
  - One-click JSON database export and restore directly from the UI.
- **Offline PWA Support**:
  - Service worker caching with offline snapshot display, background sync ready, and connectivity status indicator.
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
    image: ghcr.io/arvesv/mylinks:0.4.0
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

## ☸️ Kubernetes Deployment (1-Node Cluster)

MyLinks includes native support for 1-node Kubernetes clusters (such as k3s, Minikube, Kind, MicroK8s, or bare-metal nodes). You can choose any container image tag (`latest`, `master`, `v0.4.0`) directly from the command line without modifying manifest files.

### Quick Start with CLI Helper

The cross-platform script automatically uses Helm if installed, or falls back to native `kubectl`:

```bash
# Linux / macOS / WSL:
./scripts/deploy-k8s.sh v0.4.0 default 1 "arvesv,tailnet-user" # [TAG] [NAMESPACE] [REPLICAS] [ADMIN_USERS]

# Windows PowerShell:
.\scripts\deploy-k8s.ps1 -Tag v0.4.0 -Replicas 1 -AdminUsers "arvesv,tailnet-user"

# npm script:
npm run deploy:k8s -- v0.4.0 default 1 "arvesv,tailnet-user"
```

### Deploying with Helm

```bash
# Deploy or upgrade dynamically setting the tag and admin users
helm upgrade --install mylinks ./deploy/helm/mylinks --set image.tag=v0.4.0 --set env.ADMIN_USERS="arvesv,tailnet-user"
```

### Deploying with kubectl / Kustomize

```bash
# Apply base manifests and set tag on the fly
kubectl apply -k deploy/k8s
kubectl set image deployment/mylinks mylinks=ghcr.io/arvesv/mylinks:v0.4.0
```

### Accessing MyLinks

The service is exposed as **ClusterIP** on port 3000 (safe with SQLite single-pod `Recreate` deployment and local PVC). To access locally:

```bash
kubectl port-forward svc/mylinks 3000:3000
```
Open `http://localhost:3000` in your browser. For network-wide tailnet access, connect via an Ingress controller or the Tailscale Kubernetes Operator.

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

### Option 3: Tailscale Kubernetes Operator Ingress

If you run the [Tailscale Kubernetes Operator](https://tailscale.com/kb/1236/kubernetes-operator) in your cluster:

1. Apply the Tailscale Ingress manifest:

```bash
kubectl apply -f deploy/k8s/ingress-tailscale.yaml
```

Or with Helm:

```bash
helm upgrade --install mylinks ./deploy/helm/mylinks -f deploy/helm/mylinks/values-tailscale.yaml
```

2. The Tailscale Operator automatically:
   - Registers a dedicated machine on your tailnet (e.g., `https://mylinks.<your-tailnet>.ts.net`).
   - Provisions valid Let's Encrypt HTTPS certificates with automatic renewals.
   - Forwards HTTPS traffic to `service/mylinks:3000` and passes user identity headers (`Tailscale-User-Login`, `Tailscale-User-Name`) directly to MyLinks.

---

## ⚙️ Configuration Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port on which the web server listens. |
| `DATA_DIR` | `/data` | Path to persistent storage for SQLite database and uploaded icons. |
| `ADMIN_USERS` | *empty* | Comma-separated list of Tailscale logins/emails/handles granted edit permissions (e.g. `arvesv`, `user@example.com`, or `*` for all). Matches full login as well as handle prefix. Include `tailnet-user` to permit local port-forward admin access. |
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

### Run Automated Tests

```bash
npm test
```


---

## 📦 Data Storage & Backup

All links, categories, and settings are saved in a single SQLite database file:

- Database: `<DATA_DIR>/mylinks.db`
- Uploaded Icons: `<DATA_DIR>/uploads/`

You can back up simply by copying the `./data` directory or using the **Backup -> Export Snapshot** button in the dashboard navigation bar.

---

## 📄 License

This project is licensed under the GNU General Public License v2.0 - see the [LICENSE](LICENSE) file for details.
