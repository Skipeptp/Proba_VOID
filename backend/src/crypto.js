/**
 * модуль шифрования и расшифрования данных.
 *
 * использует симметричный алгоритм aes-256-cbc.
 * ключ шифрования читается из переменной окружения aes_key_hex.
 *
 * @module crypto
 */

const crypto = require("crypto");

/**
 * ключ шифрования в виде массива байтов.
 *
 * @type {Buffer}
 */
const key = Buffer.from(process.env.AES_KEY_HEX || "".padEnd(64, "0"), "hex");

/**
 * шифрует текстовую строку алгоритмом aes-256-cbc.
 *
 * для каждого вызова создаётся случайный вектор инициализации iv.
 * возвращает зашифрованное значение и iv в шестнадцатеричном виде.
 *
 * @function encrypt
 * @memberof module:crypto
 * @param {string} value - исходный текст для шифрования.
 * @returns {{enc: string, iv: string}} объект с зашифрованным текстом и iv.
 * @throws {Error} если ключ шифрования задан некорректно.
 */
function encrypt(value) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let enc = cipher.update(value, "utf8", "hex");
  enc += cipher.final("hex");
  return { enc, iv: iv.toString("hex") };
}

/**
 * расшифровывает зашифрованную строку алгоритмом aes-256-cbc.
 *
 * @function decrypt
 * @memberof module:crypto
 * @param {string} enc - зашифрованный текст в шестнадцатеричном виде.
 * @param {string} ivHex - вектор инициализации в шестнадцатеричном виде.
 * @returns {string} расшифрованный исходный текст.
 * @throws {Error} если ключ, iv или зашифрованные данные некорректны.
 */
function decrypt(enc, ivHex) {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let dec = decipher.update(enc, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

module.exports = { encrypt, decrypt };