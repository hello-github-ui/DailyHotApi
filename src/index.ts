import { serve } from "@hono/node-server";
import { config } from "./config.js";
import logger from "./utils/logger.js";
import app from "./app.js";

declare global {
    // 防止热重启时端口占用：把 server 缓存在全局，重启前先关闭
    // eslint-disable-next-line no-var
    var __DAILYHOT_SERVER__: {
        close: (cb?: () => void) => void;
    } | null | undefined;
}

// 启动服务器
const serveHotApi: (port?: number) => void = (port: number = config.PORT) => {
    try {
        // 若已存在旧实例，先优雅关闭，避免 EADDRINUSE
        if (globalThis.__DAILYHOT_SERVER__) {
            try {
                globalThis.__DAILYHOT_SERVER__?.close?.();
            } catch { }
            globalThis.__DAILYHOT_SERVER__ = null;
        }

        const apiServer = serve({
            fetch: app.fetch,
            port,
        });
        globalThis.__DAILYHOT_SERVER__ = apiServer as unknown as typeof globalThis.__DAILYHOT_SERVER__;
        logger.info(`🔥 DailyHot API successfully runs on port ${port}`);
        logger.info(`🔗 Local: 👉 http://localhost:${port}`);

        const graceful = () => {
            try {
                globalThis.__DAILYHOT_SERVER__?.close?.(() => process.exit(0));
                // 兜底：半秒后强退，防止挂起
                setTimeout(() => process.exit(0), 500).unref();
            } catch {
                process.exit(0);
            }
        };
        // nodemon 默认发送 SIGUSR2；手动中断/系统回收会发 SIGINT/SIGTERM
        process.once("SIGINT", graceful);
        process.once("SIGTERM", graceful);
        process.once("SIGUSR2", graceful as unknown as NodeJS.SignalsListener);
        return apiServer;
    } catch (error) {
        logger.error(error);
    }
};

if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "docker") {
    serveHotApi(config.PORT);
}

export default serveHotApi;
