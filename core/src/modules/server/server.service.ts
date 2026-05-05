import { Injectable } from '@nestjs/common';
import si from 'systeminformation';
import { exec } from 'child_process';
import net from 'net';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SiteInfo } from './dto/server';
@Injectable()
export class ServerService {
  async getSystemStats() {
    const cpu = await si.currentLoad();
    const cpuInfo = await si.cpu();
    const mem = await si.mem();
    const disk = await si.fsSize();

    return {
      cpu: cpu.currentLoad.toFixed(2),
      cores: cpuInfo.cores,

      ram: ((mem.used / mem.total) * 100).toFixed(2),
      ramUsed: (mem.used / 1024 / 1024 / 1024).toFixed(2),
      ramTotal: (mem.total / 1024 / 1024 / 1024).toFixed(2),

      disk: disk[0].use,
      diskUsed: disk[0].used,
      diskTotal: disk[0].size,
    };
  }

  async getBandwidth() {
    if (process.platform !== 'linux') {
      const net = await si.networkStats();

      const rx = net.reduce((sum, item) => sum + item.rx_bytes, 0);
      const tx = net.reduce((sum, item) => sum + item.tx_bytes, 0);

      return {
        type: 'realtime',
        download: (rx / 1024 / 1024 / 1024).toFixed(2),
        upload: (tx / 1024 / 1024 / 1024).toFixed(2),
        total: ((rx + tx) / 1024 / 1024 / 1024).toFixed(2),
        note: 'Windows local realtime only',
      };
    }

    const output = await this.execAsync('vnstat --json');
    const data = JSON.parse(output);

    const iface = data.interfaces[0];
    const month = iface.traffic.month[0];

    const rx = month.rx / 1024 / 1024 / 1024;
    const tx = month.tx / 1024 / 1024 / 1024;

    return {
      type: 'monthly',
      download: rx.toFixed(2),
      upload: tx.toFixed(2),
      total: (rx + tx).toFixed(2),
    };
  }

  async getSecurityStatus() {
    const isLinux = process.platform === 'linux';

    const firewall = isLinux ? await this.getFirewallStatus() : false;

    const check = isLinux ? this.checkPort.bind(this) : this.checkPortLocal;

    const ssh = await check(22);
    const http = await check(80);
    const https = await check(443);
    const mail = await check(25);

    return {
      firewall,
      ssh,
      http,
      https,
      mail,
    };
  }

  async getFirewallStatus() {
    try {
      const output = await this.execAsync('ufw status');

      return output.includes('Status: active');
    } catch {
      return false;
    }
  }

  async checkPort(port: number) {
    try {
      const output = await this.execAsync(`ss -tuln | grep :${port}`);
      return !!output;
    } catch {
      return false;
    }
  }

  async getSites(): Promise<SiteInfo[]> {
    if (process.platform !== 'linux') {
      return [
        {
          domain: 'localhost',
          domains: ['localhost'],
          type: 'Dev Server',
          port: 'Local',
          ssl: false,
        },
      ];
    }

    const nginxPath = '/etc/nginx/sites-enabled';

    if (!existsSync(nginxPath)) return [];

    const files = readdirSync(nginxPath);
    const sites: SiteInfo[] = [];

    for (const file of files) {
      const content = readFileSync(join(nginxPath, file), 'utf-8');

      const serverNameMatch = content.match(/server_name\s+([^;]+);/);
      const domains = serverNameMatch?.[1]
        ?.split(/\s+/)
        .filter((d) => d && d !== '_') ?? ['unknown'];

      const proxyMatch = content.match(/proxy_pass\s+([^;]+);/);
      const proxy = proxyMatch?.[1]?.trim();

      const portMatch = proxy?.match(/:(\d+)/);
      const listenMatch = content.match(/listen\s+(\d+)/);

      const rootMatch = content.match(/root\s+([^;]+);/);
      const root = rootMatch?.[1]?.trim();

      const ssl =
        content.includes('ssl_certificate') ||
        content.includes('listen 443') ||
        content.includes('listen [::]:443');

      let port = 'Static';

      if (portMatch?.[1]) {
        port = `PM2 :${portMatch[1]}`;
      } else if (listenMatch?.[1]) {
        port = `Listen :${listenMatch[1]}`;
      }

      let type = 'Static Website';

      if (proxy) {
        if (port.includes('8000')) type = 'NestJS API';
        else if (port.includes('3000')) type = 'Nuxt App';
        else type = 'Reverse Proxy App';
      }

      if (content.includes('fastcgi_pass') || content.includes('.php')) {
        type = 'PHP Website';
      }

      if (root?.includes('dist') || root?.includes('.output')) {
        type = 'Static / Nuxt Build';
      }

      sites.push({
        domain: domains[0],
        domains,
        type,
        port,
        ssl,
        root,
        proxy,
      });
    }

    return sites;
  }

  checkPortLocal = (port: number) =>
    new Promise<boolean>((resolve) => {
      const socket = new net.Socket();

      socket.setTimeout(1000);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => resolve(false));
      socket.on('timeout', () => resolve(false));

      socket.connect(port, '127.0.0.1');
    });

  private execAsync = (cmd: string) =>
    new Promise<string>((resolve, reject) => {
      exec(cmd, (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout);
      });
    });
}
