module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './src/database/database.db'
    },
    pool: {
      afterCreate: (conn, cb) => conn.run("PRAGMA foreign_keys = ON", cb)
    },
    migrations: {
      directory: './src/database/migrations'
    },
    useNullAsDefault: true
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    pool: {
      afterCreate: (conn, cb) => conn.run("PRAGMA foreign_keys = ON", cb)
    },
    migrations: {
      directory: './src/database/migrations'
    },
    useNullAsDefault: true
  }
};
