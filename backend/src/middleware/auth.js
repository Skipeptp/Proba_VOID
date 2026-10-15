/**
 * Middleware авторизации на основе JWT.
 *
 * Проверяет access-токен из заголовка Authorization
 * и сохраняет данные пользователя в объекте req.user.
 *
 * @module middleware/auth
 */
const jwt = require("jsonwebtoken");
/**
 * Проверяет JWT-токен и разрешает доступ только авторизованному пользователю.
 *
 * Извлекает токен из заголовка Authorization в формате Bearer,
 * проверяет подпись и срок действия. При успехе сохраняет
 * payload токена в req.user.
 *
 * @function auth
 * @memberof module:middleware/auth
 * @param {Object} req - HTTP-запрос Express.
 * @param {Object} res - HTTP-ответ Express.
 * @param {Function} next - Передача управления следующему middleware.
 * @returns {void} Завершение обработки запроса.
 */
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Требуется авторизация" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Неверный токен" });
  }
}

module.exports = auth;
