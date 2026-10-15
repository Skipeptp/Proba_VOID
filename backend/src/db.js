/**
 * Модуль подключения к базе данных PostgreSQL.
 *
 * Создаёт пул подключений и предоставляет функцию query
 * для выполнения параметризованных SQL-запросов.
 *
 * @module db
 */
const { Pool } = require("pg");
/**
 * Пул подключений к PostgreSQL.
 *
 * Параметры подключения читаются из переменных окружения:
 * DB_HOST, DB_PORT, DB_NAME, DB_USER и DB_PASSWORD.
 *
 * @type {Pool}
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
/**
 * Выполняет SQL-запрос через пул подключений.
 *
 * @function query
 * @memberof module:db
 * @param {string} text - SQL-запрос с параметрами $1, $2 и т.д.
 * @param {Array<*>} [params] - Значения для подстановки в запрос.
 * @returns {Promise<Object>} Результат выполнения запроса node-postgres.
 * @throws {Error} Если произошла ошибка подключения или выполнения SQL.
 *
 * @example
 * const result = await query('SELECT * FROM client WHERE id = $1', [1]);
 */
module.exports = {
  query: (text, params) => pool.query(text, params),
};
