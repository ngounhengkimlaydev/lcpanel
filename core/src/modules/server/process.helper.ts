export function mapPm2Process(process: any, index: number) {
  const monitor = process?.monit || {};
  const env = process?.pm2_env || {};

  return {
    id: Number(process?.pm_id ?? index + 1),
    pid: Number(process?.pid || 0),
    name: process?.name || env?.name || "unknown",
    user: env?.username || env?.user || "pm2",
    cpu: Number(monitor?.cpu || 0),
    memory: Number(
      ((Number(monitor?.memory || 0) / 1024 / 1024) || 0).toFixed(1),
    ),
    status: toProcessStatus(env?.status),
    uptime: formatProcessUptime(env?.pm_uptime),
    command: buildProcessCommand(env),
    created_at: toProcessDate(env?.created_at || env?.pm_uptime),
  };
}

function toProcessStatus(status?: string) {
  if (!status) {
    return "stopped";
  }

  const value = String(status).toLowerCase();

  if (["online", "launching"].includes(value)) {
    return "running";
  }

  if (["errored", "error", "one-launch-status"].includes(value)) {
    return "error";
  }

  if (["stopped", "stop", "stopping"].includes(value)) {
    return "stopped";
  }

  return "sleeping";
}

function formatProcessUptime(startedAt?: number | string) {
  const timestamp = Number(startedAt);

  if (!timestamp || Number.isNaN(timestamp)) {
    return "-";
  }

  const elapsedMs = Math.max(Date.now() - timestamp, 0);
  const totalMinutes = Math.floor(elapsedMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return "<1m";
}

function buildProcessCommand(env: Record<string, any>) {
  const args = Array.isArray(env?.args)
    ? env.args
    : env?.args
      ? [String(env.args)]
      : [];

  return [env?.exec_interpreter, env?.pm_exec_path, ...args]
    .filter(Boolean)
    .join(" ");
}

function toProcessDate(value?: number | string) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}
