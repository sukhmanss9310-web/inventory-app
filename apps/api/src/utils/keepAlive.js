const MINUTE_MS = 60 * 1000;

const getRandomDelayMs = ({ minMinutes, maxMinutes }) => {
  const minMs = Math.max(1, minMinutes) * MINUTE_MS;
  const maxMs = Math.max(minMinutes, maxMinutes) * MINUTE_MS;

  return Math.floor(minMs + Math.random() * (maxMs - minMs));
};

const normalizeBaseUrl = (url) => {
  const trimmedUrl = String(url || "").trim().replace(/\/$/, "");

  if (!trimmedUrl) {
    return "";
  }

  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
};

export const startKeepAlive = (env) => {
  if (!env.keepAliveEnabled || env.nodeEnv !== "production" || !env.keepAliveUrl) {
    return null;
  }

  const healthUrl = `${normalizeBaseUrl(env.keepAliveUrl)}/health`;
  let timer = null;

  const ping = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.keepAliveTimeoutMs);

    try {
      const response = await fetch(healthUrl, { signal: controller.signal });
      console.log("Keep-alive ping:", {
        url: healthUrl,
        status: response.status,
        ok: response.ok
      });
    } catch (error) {
      console.error("Keep-alive ping failed:", error.message);
    } finally {
      clearTimeout(timeout);
      timer = setTimeout(
        ping,
        getRandomDelayMs({
          minMinutes: env.keepAliveMinMinutes,
          maxMinutes: env.keepAliveMaxMinutes
        })
      );
      timer.unref?.();
    }
  };

  timer = setTimeout(
    ping,
    getRandomDelayMs({
      minMinutes: env.keepAliveMinMinutes,
      maxMinutes: env.keepAliveMaxMinutes
    })
  );
  timer.unref?.();

  console.log("Keep-alive scheduled:", {
    url: healthUrl,
    minMinutes: env.keepAliveMinMinutes,
    maxMinutes: env.keepAliveMaxMinutes
  });

  return {
    stop() {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };
};
