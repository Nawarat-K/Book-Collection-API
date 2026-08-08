import "dotenv/config";
import express from "express";
import connectionPool from "./utils/db.js";
import authRouter from "./apps/auth.js";
import bookRouter from "./apps/book.js";


const app = express()
const port = Number(process.env.PORT) || 4000;

app.use(express.json())
app.get("/health", async(req, res) => {
    try {
        await connectionPool.query('SELECT 1 AS ready');

        res.status(200).json({
        status: 'ok',
        database: 'connected'
    })
    }
    catch (error){
    console.error('[GET /health] error:', error.message);
    return res.status(503).json({
      status: 'error',
      database: 'disconnected'
    });
    }
})

app.use("/auth", authRouter);
app.use("/books", bookRouter);

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
})