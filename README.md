# 🚀 LCPANEL

> Modern open-source server control panel built with Nuxt UI and NestJS.

LCPANEL is a developer-first, self-hosted control panel designed to simplify VPS and server management.  
Manage websites, SSL, system resources, and deployments with a clean and powerful dashboard.

---

## ✨ Features

- 📊 **Real-time Monitoring**
  - CPU, RAM, Disk, Bandwidth

- 🌐 **Website Management**
  - Nginx-based domain handling
  - Reverse proxy support

- 🔐 **SSL Management**
  - Detect SSL status
  - (Planned) One-click SSL with Let's Encrypt

- ⚙️ **App Deployment**
  - Node.js apps via PM2
  - API & frontend support

- 🛡️ **Security Center**
  - Firewall status
  - Port monitoring (SSH, HTTP, HTTPS)

- 🧠 **Smart Detection**
  - Auto-detect running services
  - Parse Nginx configs

---

## 🏗️ Tech Stack

- **Frontend:** Nuxt 3 + Nuxt UI  
- **Backend:** NestJS  
- **Process Manager:** PM2  
- **Web Server:** Nginx  

---

## 📦 Installation

### One-line install

```bash
curl -fsSL https://ltech.digital/install.sh | bash