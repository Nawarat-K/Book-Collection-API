import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionPool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:Passw@rd1234@localhost:5432/Book-Collection-API",
});

connectionPool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export default connectionPool;