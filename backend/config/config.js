require("dotenv").config();

const sslOptions =
    process.env.DB_SSL === "true"
        ? {
              require: true,
              rejectUnauthorized: false,
          }
        : undefined;

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "postgres",
        dialectOptions: {
            ssl: sslOptions,
        },
    },

    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "postgres",
        dialectOptions: {
            ssl: sslOptions,
        },
    },

    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "postgres",
        dialectOptions: {
            ssl: sslOptions,
        },
    },
};
