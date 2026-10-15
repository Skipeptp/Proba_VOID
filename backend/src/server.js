/**
 * Точка входа серверной части приложения фитнес-центра.
 *
 * Создаёт Express-приложение, настраивает CORS и обработку JSON,
 * подключает маршруты API и запускает HTTP-сервер.
 *
 * @module server
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const scheduleRoutes = require("./routes/schedule");
const bookingRoutes = require("./routes/bookings");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/bookings", bookingRoutes);
/**
 * Запускает HTTP-сервер.
 *
 * Порт берётся из переменной окружения PORT.
 * Если переменная не задана, используется порт 4000.
 */
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
