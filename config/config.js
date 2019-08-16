module.exports = {
    development: {
        username: "postgres",
        password: null,
        database: "session_database",
        host: "127.0.0.1",
        dialect: "postgres"
    },
    production: {
        host     : process.env.RDS_HOSTNAME,
        user     : process.env.RDS_USERNAME,
        password : process.env.RDS_PASSWORD,
        port     : process.env.RDS_PORT,
        database : "session_database",
        dialect  : "postgres"
    }
}