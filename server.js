const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const client = require('prom-client'); // ✅ Prometheus
const app = express();
const db = new sqlite3.Database('db.sqlite');

app.use(express.json());
app.use(express.static('public'));

// ----- Prometheus -----
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const recordCounter = new client.Counter({
  name: 'record_requests_total',
  help: 'Количество POST запросов /record',
});
register.registerMetric(recordCounter);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ----- Логирование запросов -----
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const ip = req.ip;
  const method = req.method;
  const url = req.originalUrl;
  console.log(`[${now}] ${ip} ${method} ${url}`);
  next();
});

// Создаем таблицу records, если ее нет
db.run(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    time TEXT
  )
`);

// ----- Настройки защиты от спама -----
const rateLimitMap = {};
const MAX_CLICKS = 5;
const INTERVAL_MS = 3000;
const BLOCK_MS = 10000;

// Endpoint для записи времени
app.post('/record', (req, res) => {
  const ip = req.ip;
  const nowTime = Date.now();

  if (!rateLimitMap[ip]) {
    rateLimitMap[ip] = { clicks: [], blockedUntil: 0 };
  }
  const userData = rateLimitMap[ip];

  // Проверка блокировки
  if (userData.blockedUntil > nowTime) {
    return res.json({
      success: false,
      message: `Вы заблокированы на ${Math.ceil(
        (userData.blockedUntil - nowTime) / 1000
      )} секунд`
    });
  }

  recordCounter.inc(); // ✅ увеличиваем счетчик Prometheus

  // Очищаем старые клики
  userData.clicks = userData.clicks.filter(t => nowTime - t < INTERVAL_MS);
  userData.clicks.push(nowTime);

  // Проверка лимита
  if (userData.clicks.length > MAX_CLICKS) {
    userData.blockedUntil = nowTime + BLOCK_MS;
    userData.clicks = [];
    return res.json({
      success: false,
      message: 'Слишком много кликов! Блокировка на 10 секунд'
    });
  }

  // Запись времени
  const now = new Date();
  const date = now.toLocaleDateString('ru-RU');
  const time = now.toLocaleTimeString('ru-RU', { hour12: fals
