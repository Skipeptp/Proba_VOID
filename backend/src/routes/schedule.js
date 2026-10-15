const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { role, id } = req.user;
  try {
    let query =
      "SELECT s.*, wt.name AS workout_name, h.name AS hall_name, t.id AS trainer_id " +
      "FROM schedule s " +
      "JOIN workout_type wt ON s.workout_type_id = wt.id " +
      "JOIN hall h ON s.hall_id = h.id " +
      "JOIN trainer t ON s.trainer_id = t.id " +
      "WHERE s.status = 'Запланирована'";
    const params = [];
    if (role === "TRAINER") {
      query += " AND t.employee_id = $1";
      params.push(id);
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка загрузки расписания" });
  }
});

router.post(
  "/",
  auth,
  requireRole("ADMIN", "MANAGER"),
  async (req, res) => {
    const { workout_type_id, trainer_id, hall_id, weekday, start_time, end_time } = req.body;
    try {
      const { rows } = await db.query(
        "INSERT INTO schedule (workout_type_id, trainer_id, hall_id, weekday, start_time, end_time, status) VALUES ($1,$2,$3,$4,$5,$6,'Запланирована') RETURNING *",
        [workout_type_id, trainer_id, hall_id, weekday, start_time, end_time]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Ошибка создания занятия" });
    }
  }
);

module.exports = router;
