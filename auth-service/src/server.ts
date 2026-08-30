import { configDotenv } from "dotenv";
import db from "./config/db.js";
import app from "./app.js";
import { connectRedis } from "./config/redis.js";

configDotenv();
const PORT = process.env.PORT || 5000;
async function bootstrap() {
    try {
        const client = await db.connect(); // we chose a pool from the connection pool
        console.log('Database connected!')
        client.release();  /// we released the pool after our query

        await connectRedis()

        // start http server
        const server = app.listen(PORT,()=> {
            console.log(`Authentication service running on port: ${PORT}`);
        })

        // gracefull shutdown implementation


    } catch (error) {
        console.error("Server failed to start", error);
        process.exit(1);
    }
}



bootstrap();
