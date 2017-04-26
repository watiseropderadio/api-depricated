export default {
  development: {
    driver: 'sqlite3',
    database: 'api_dev'
  },

  test: {
    driver: 'sqlite3',
    database: 'api_test'
  },

  production: {
    driver: 'sqlite3',
    database: 'api_prod'
  }
};
