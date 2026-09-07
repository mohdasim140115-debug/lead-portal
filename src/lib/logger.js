// Minimal structured logger. Swap the sink for a real provider later without
// touching call sites.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[process.env.LOG_LEVEL] ?? (process.env.NODE_ENV === "production" ? LEVELS.info : LEVELS.debug);

function emit(level, message, meta) {
  if (LEVELS[level] < threshold) return;
  const entry = { ts: new Date().toISOString(), level, message };
  if (meta) {
    entry.meta = meta.err instanceof Error
      ? { ...meta, err: { name: meta.err.name, message: meta.err.message, stack: meta.err.stack } }
      : meta;
  }
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (m, meta) => emit("debug", m, meta),
  info: (m, meta) => emit("info", m, meta),
  warn: (m, meta) => emit("warn", m, meta),
  error: (m, meta) => emit("error", m, meta),
};
