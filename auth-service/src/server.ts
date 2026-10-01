import { configDotenv } from "dotenv";
import db from "./config/db.js";
import { redisClient } from "./config/redis.js";

configDotenv();
const PORT = process.env.PORT || 5000;
async function bootstrap() {
    try {
        const client = await db.connect(); // we chose a pool from the connection pool
        console.log('Database connected!')
        client.release();  /// we released the pool after our query

        const { connectRedis } = await import("./config/redis.js");
        await connectRedis()

        const { default: app } = await import("./app.js");

        // start http server
        const server = app.listen(PORT,()=> {
            console.log(`Authentication service running on port: ${PORT}`);
        })

        const shutdown = async (signal: string) => {
            console.log(`Received ${signal}, shutting down`);
            server.close(async (error) => {
                if (error) {
                    console.error('HTTP server shutdown failed', error);
                    process.exitCode = 1;
                }
                if (redisClient.isOpen) await redisClient.quit();
                await db.end();
            });
        };

        process.once('SIGTERM', () => void shutdown('SIGTERM'));
        process.once('SIGINT', () => void shutdown('SIGINT'));


    } catch (error) {
        console.error("Server failed to start", error);
        process.exit(1);
    }
}



bootstrap();
