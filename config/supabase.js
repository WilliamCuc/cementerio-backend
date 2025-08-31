import postgres from "postgres";

const connectionString = process.env.SUPABASE_URL;
const sql = postgres(connectionString);

export default sql;
