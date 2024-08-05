require('dotenv').config();
const databaseUrl = process.env.MONGO_DB_USER;
const apiKey = process.env.MONGO_DB_PASSWORD;

export { databaseUrl, apiKey };