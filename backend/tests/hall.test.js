/**
 * автоматические тесты crud-операций для таблицы hall.
 *
 * проверяют подключение к postgresql, существование таблицы,
 * создание, чтение, обновление и удаление записи зала.
 *
 * @module tests/hall.test
 */
require('dotenv').config();
const { Pool } = require('pg');

/**
 * пул подключений к тестовой базе данных postgresql.
 * @type {Pool}
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitness_center',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

/**
 * идентификатор тестового зала.
 * @type {number|null}
 */
let testHallId = null;

describe('crud-тесты таблицы hall', () => {
  /**
   * проверяет доступность postgresql до выполнения основного сценария.
   * соответствует тестовому случаю t-01.
   */
  test('t-01: setup - подключение к postgresql', async () => {
    const result = await pool.query('select now() as current_time');

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].current_time).toBeTruthy();
  });

  /**
   * проверяет существование таблицы hall до выполнения основного сценария.
   * соответствует тестовому случаю t-02.
   */
  test('t-02: setup - таблица hall существует', async () => {
    const result = await pool.query(
      `select exists (
         select 1
         from information_schema.tables
         where table_schema = 'public'
           and table_name = 'hall'
       ) as table_exists`
    );

    expect(result.rows[0].table_exists).toBe(true);
  });

  /**
   * проверяет создание нового зала.
   * соответствует позитивному тестовому случаю t-03.
   */
  test('t-03: create - создание нового зала', async () => {
    const result = await pool.query(
      `insert into hall (name, hall_type, capacity, area_sq_m, equipment_desc)
       values ($1, $2, $3, $4, $5)
       returning id, name, hall_type, capacity, area_sq_m`,
      [
        'тестовый зал lr9',
        'gym',
        25,
        100.5,
        'тренажёры для тестирования'
      ]
    );

    testHallId = result.rows[0].id;

    expect(result.rows).toHaveLength(1);
    expect(testHallId).toBeGreaterThan(0);
    expect(result.rows[0].name).toBe('тестовый зал lr9');
    expect(result.rows[0].hall_type).toBe('gym');
    expect(result.rows[0].capacity).toBe(25);
    expect(Number(result.rows[0].area_sq_m)).toBe(100.5);
  });

  /**
   * проверяет нарушение ограничения not null для названия зала.
   * соответствует негативному тестовому случаю t-04.
   */
  test('t-04: create - отсутствие названия вызывает ошибку', async () => {
    await expect(
      pool.query(
        'insert into hall (name, hall_type, capacity) values ($1, $2, $3)',
        [null, 'gym', 10]
      )
    ).rejects.toThrow();
  });

  /**
   * проверяет нарушение ограничения not null для вместимости.
   * соответствует негативному тестовому случаю t-05.
   */
  test('t-05: create - отсутствие вместимости вызывает ошибку', async () => {
    await expect(
      pool.query(
        'insert into hall (name, hall_type, capacity) values ($1, $2, $3)',
        ['зал без вместимости', 'gym', null]
      )
    ).rejects.toThrow();
  });

  /**
   * проверяет получение списка залов и наличие созданной записи.
   * соответствует позитивному тестовому случаю t-06.
   */
  test('t-06: read - получение списка залов', async () => {
    const result = await pool.query(
      'select id, name, hall_type, capacity from hall order by id'
    );

    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);

    const createdHall = result.rows.find((hall) => hall.id === testHallId);

    expect(createdHall).toBeDefined();
    expect(createdHall.name).toBe('тестовый зал lr9');
  });

  /**
   * проверяет обновление данных тестового зала.
   * соответствует позитивному тестовому случаю t-07.
   */
  test('t-07: update - обновление зала', async () => {
    const result = await pool.query(
      `update hall
       set name = $1,
           hall_type = $2,
           capacity = $3,
           area_sq_m = $4
       where id = $5
       returning id, name, hall_type, capacity, area_sq_m`,
      [
        'обновлённый тестовый зал',
        'studio',
        15,
        80,
        testHallId
      ]
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe('обновлённый тестовый зал');
    expect(result.rows[0].hall_type).toBe('studio');
    expect(result.rows[0].capacity).toBe(15);
    expect(Number(result.rows[0].area_sq_m)).toBe(80);
  });

  /**
   * проверяет, что обновление несуществующего зала не изменяет данные.
   * соответствует негативному тестовому случаю t-08.
   */
  test('t-08: update - несуществующий id не изменяет записи', async () => {
    const result = await pool.query(
      `update hall
       set name = $1
       where id = $2
       returning id`,
      ['несуществующий зал', 999999999]
    );

    expect(result.rows).toHaveLength(0);
  });

  /**
   * проверяет удаление тестового зала.
   * соответствует позитивному тестовому случаю t-09.
   */
  test('t-09: delete - удаление тестового зала', async () => {
    const result = await pool.query(
      'delete from hall where id = $1 returning id',
      [testHallId]
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].id).toBe(testHallId);

    testHallId = null;
  });

  /**
   * проверяет, что удаление несуществующего зала не выполняется.
   * соответствует негативному тестовому случаю t-10.
   */
  test('t-10: delete - несуществующий id не удаляет записи', async () => {
    const result = await pool.query(
      'delete from hall where id = $1 returning id',
      [999999999]
    );

    expect(result.rows).toHaveLength(0);
  });

  /**
   * проверяет отсутствие тестовых данных после завершения сценария.
   * соответствует тестовому случаю t-11.
   */
  test('t-11: teardown - тестовый зал удалён', async () => {
    const result = await pool.query(
      `select id, name
       from hall
       where name in ($1, $2)`,
      ['тестовый зал lr9', 'обновлённый тестовый зал']
    );

    expect(result.rows).toHaveLength(0);
  });

  afterAll(async () => {
    if (testHallId) {
      await pool.query('delete from hall where id = $1', [testHallId]);
    }

    await pool.end();
  });
});