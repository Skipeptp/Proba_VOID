/**
 * Маршруты аутентификации сотрудников.
 *
 * Обрабатывает вход пользователя, проверку пароля
 * и создание JWT-токена.
 *
 * @module routes/auth
 */
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
/**
 * Выполняет вход сотрудника фитнес-центра.
 *
 * Находит активную учётную запись сотрудника по логину,
 * сравнивает введённый пароль с хешем из базы данных
 * и создаёт JWT-токен сроком действия 8 часов.
 *
 * В payload токена включаются идентификатор сотрудника,
 * роль, employeeId и clientId, если он связан с клиентом.
 *
 * @async
 * @function login
 * @memberof module:routes/auth
 * @param {Object} req - HTTP-запрос Express.
 * @param {Object} req.body - Тело запроса.
 * @param {string} req.body.login - Логин сотрудника.
 * @param {string} req.body.password - Пароль сотрудника.
 * @param {Object} res - HTTP-ответ Express.
 * @returns {Promise<void>} Завершение обработки HTTP-запроса.
 */
router.post("/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const { rows } = await db.query(
      "SELECT e.id, e.password_hash, r.name AS role_name FROM employee e JOIN role r ON e.role_id = r.id WHERE e.login = $1 AND e.status = 'Работает'",
      [login]
    );
    if (!rows.length) return res.status(401).json({ message: "Неверный логин или пароль" });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Неверный логин или пароль" });

    const token = jwt.sign(
      { id: user.id, role: user.role_name },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "8h" }
    );
    res.json({ token, role: user.role_name });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Внутренняя ошибка" });
  }
});

module.exports = router;
