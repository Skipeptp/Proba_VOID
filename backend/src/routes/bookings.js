/**
 * Маршруты для работы с бронированиями тренировок.
 *
 * Реализует запись клиента на занятие, просмотр истории
 * бронирований, получение списка участников занятия
 * и изменение статуса бронирования.
 *
 * @module routes/bookings
 */
const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();
/**
 * Записывает клиента на тренировку.
 *
 * Доступно только пользователям с ролью CLIENT.
 * Проверяет наличие активного абонемента, остаток посещений
 * и свободные места в группе. При успешной записи создаёт
 * бронирование и уменьшает остаток посещений, если он используется.
 *
 * @async
 * @function createBooking
 * @memberof module:routes/bookings
 * @param {Object} req - HTTP-запрос Express.
 * @param {Object} req.body - Тело запроса.
 * @param {number} req.body.schedule_id - Идентификатор занятия.
 * @param {Object} req.user - Данные авторизованного пользователя.
 * @param {number} [req.user.clientId] - Идентификатор клиента из JWT.
 * @param {Object} res - HTTP-ответ Express.
 * @returns {Promise<void>} Завершение обработки HTTP-запроса.
 */
router.post("/", auth, requireRole("CLIENT"), async (req, res) => {
  const { schedule_id, client_id } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO booking (schedule_id, client_id, status) VALUES ($1,$2,'Записан') RETURNING *",
      [schedule_id, client_id]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка записи на тренировку" });
  }
});
/**
 * Возвращает историю бронирований текущего клиента.
 *
 * Дополняет записи данными о занятии, типе тренировки и зале.
 * Доступно только пользователям с ролью CLIENT.
 *
 * @async
 * @function getMyBookings
 * @memberof module:routes/bookings
 * @param {Object} req - HTTP-запрос Express.
 * @param {Object} req.user - Данные авторизованного пользователя.
 * @param {number} [req.user.clientId] - Идентификатор клиента из JWT.
 * @param {Object} res - HTTP-ответ Express.
 * @returns {Promise<void>} Завершение обработки HTTP-запроса.
 */
router.patch("/:id/status", auth, requireRole("TRAINER", "ADMIN"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE booking SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка обновления статуса" });
  }
});

module.exports = router;
