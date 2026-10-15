-- Schema for fitness_center

CREATE TABLE position (
  id           BIGSERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL
);

CREATE TABLE role (
  id           BIGSERIAL PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE hall (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  hall_type     VARCHAR(50)  NOT NULL,
  capacity      INTEGER      NOT NULL,
  area_sq_m     NUMERIC(6,2),
  equipment_desc TEXT
);

CREATE TABLE workout_type (
  id           BIGSERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  category     VARCHAR(50)  NOT NULL,
  duration_min INTEGER      NOT NULL,
  max_participants INTEGER  NOT NULL,
  description  TEXT
);

CREATE TABLE membership_type (
  id             BIGSERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  visit_count    INTEGER,
  duration_days  INTEGER      NOT NULL,
  price          NUMERIC(10,2) NOT NULL,
  description    TEXT
);

CREATE TABLE employee (
  id            BIGSERIAL PRIMARY KEY,
  last_name     VARCHAR(100) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  middle_name   VARCHAR(100),
  position_id   BIGINT       NOT NULL REFERENCES position(id),
  login         VARCHAR(50)  NOT NULL,
  password_hash TEXT         NOT NULL,
  role_id       BIGINT       NOT NULL REFERENCES role(id),
  phone         VARCHAR(20),
  email         VARCHAR(255),
  hired_at      DATE         NOT NULL,
  status        VARCHAR(20)  NOT NULL
);

CREATE UNIQUE INDEX unq_employee_login ON employee(login);

CREATE TABLE client (
  id                   BIGSERIAL PRIMARY KEY,
  last_name            VARCHAR(100) NOT NULL,
  first_name           VARCHAR(100) NOT NULL,
  middle_name          VARCHAR(100),
  birth_date           DATE         NOT NULL,
  gender               VARCHAR(10)  NOT NULL,
  phone                VARCHAR(20),
  email                VARCHAR(255),
  registered_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  training_goals       TEXT,
  medical_restrictions BYTEA,
  medical_restrictions_iv BYTEA
);

CREATE UNIQUE INDEX idx_client_email ON client(email);

CREATE TABLE trainer (
  id               BIGSERIAL PRIMARY KEY,
  employee_id      BIGINT      NOT NULL REFERENCES employee(id),
  specialization   VARCHAR(255),
  experience_years INTEGER,
  rating           NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
  qualification    TEXT,
  certificates     TEXT
);

CREATE TABLE membership (
  id                  BIGSERIAL PRIMARY KEY,
  client_id           BIGINT       NOT NULL REFERENCES client(id),
  membership_type_id  BIGINT       NOT NULL REFERENCES membership_type(id),
  purchased_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  start_date          DATE         NOT NULL,
  end_date            DATE         NOT NULL,
  remaining_visits    INTEGER,
  status              VARCHAR(20)  NOT NULL
);

CREATE TABLE membership_freeze (
  id             BIGSERIAL PRIMARY KEY,
  membership_id  BIGINT      NOT NULL REFERENCES membership(id),
  freeze_start   DATE        NOT NULL,
  freeze_end     DATE        NOT NULL,
  reason         TEXT
);

CREATE TABLE schedule (
  id               BIGSERIAL PRIMARY KEY,
  workout_type_id  BIGINT      NOT NULL REFERENCES workout_type(id),
  trainer_id       BIGINT      NOT NULL REFERENCES trainer(id),
  hall_id          BIGINT      NOT NULL REFERENCES hall(id),
  weekday          INTEGER     NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  start_time       TIME        NOT NULL,
  end_time         TIME        NOT NULL,
  status           VARCHAR(20) NOT NULL
);

CREATE TABLE booking (
  id             BIGSERIAL PRIMARY KEY,
  schedule_id    BIGINT      NOT NULL REFERENCES schedule(id),
  client_id      BIGINT      NOT NULL REFERENCES client(id),
  booked_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
  status         VARCHAR(20) NOT NULL,
  note           TEXT
);

CREATE INDEX idx_booking_datetime ON booking(schedule_id, booked_at);

CREATE TABLE equipment (
  id             BIGSERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  hall_id        BIGINT       NOT NULL REFERENCES hall(id),
  equipment_type VARCHAR(50)  NOT NULL,
  inventory_no   VARCHAR(50)  NOT NULL,
  purchased_at   DATE,
  status         VARCHAR(20)  NOT NULL
);

CREATE TABLE payment (
  id             BIGSERIAL PRIMARY KEY,
  client_id      BIGINT       NOT NULL REFERENCES client(id),
  membership_id  BIGINT       NOT NULL REFERENCES membership(id),
  amount         NUMERIC(10,2) NOT NULL,
  paid_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
  method         VARCHAR(20)   NOT NULL,
  employee_id    BIGINT        NOT NULL REFERENCES employee(id),
  status         VARCHAR(20)   NOT NULL
);

CREATE TABLE achievement (
  id              BIGSERIAL PRIMARY KEY,
  client_id       BIGINT      NOT NULL REFERENCES client(id),
  recorded_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
  achievement_type VARCHAR(50) NOT NULL,
  value_encrypted  BYTEA      NOT NULL,
  value_iv         BYTEA      NOT NULL,
  unit            VARCHAR(20),
  note            TEXT
);

CREATE TABLE training_program (
  id             BIGSERIAL PRIMARY KEY,
  client_id      BIGINT      NOT NULL REFERENCES client(id),
  trainer_id     BIGINT      NOT NULL REFERENCES trainer(id),
  name           VARCHAR(255) NOT NULL,
  start_date     DATE         NOT NULL,
  end_date       DATE,
  goal           TEXT,
  description    TEXT,
  status         VARCHAR(20)  NOT NULL
);

CREATE TABLE review (
  id             BIGSERIAL PRIMARY KEY,
  client_id      BIGINT      NOT NULL REFERENCES client(id),
  trainer_id     BIGINT      REFERENCES trainer(id),
  review_type    VARCHAR(20) NOT NULL,
  created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
  text           TEXT        NOT NULL,
  rating         INTEGER     CHECK (rating BETWEEN 1 AND 5),
  status         VARCHAR(20) NOT NULL,
  employee_id    BIGINT      REFERENCES employee(id)
);

-- Roles
CREATE ROLE dba NOINHERIT;
CREATE ROLE data_reader NOINHERIT;
CREATE ROLE data_writer NOINHERIT;
CREATE ROLE log_reader NOINHERIT;

GRANT ALL PRIVILEGES ON DATABASE fitness_center TO dba;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dba;

GRANT CONNECT ON DATABASE fitness_center TO data_reader;
GRANT USAGE ON SCHEMA public TO data_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO data_reader;

GRANT CONNECT ON DATABASE fitness_center TO data_writer;
GRANT USAGE ON SCHEMA public TO data_writer;
GRANT SELECT, INSERT, UPDATE ON
  client, membership, booking, payment, achievement, training_program, review
TO data_writer;
