/**
 * Middleware проверки роли пользователя.
 *
 * Ограничивает доступ к маршруту для пользователей
 * с заданными ролями.
 *
 * @module middleware/role
 */
/**
 * Создаёт middleware для проверки роли пользователя.
 *
 * @function requireRole
 * @memberof module:middleware/role
 * @param {...string} roles - Разрешённые роли.
 * @returns {Function} Middleware для проверки роли.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Недостаточно прав" });
    }
    next();
  };
}

module.exports = requireRole;
