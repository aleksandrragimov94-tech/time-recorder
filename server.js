const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database('db.sqlite');

app.use(express.json());
app.use(express.static('public'));

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
const MAX_CLICKS = 5;    // максимум кликов за интервал
const INTERVAL_MS = 3000; // интервал 3 секунды
const BLOCK_MS = 10000;   // блокировка 10 секунд

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
      message: `Вы заблокированы на ${(userData.blockedUntil - nowTime)/1000} секунд`
    });
  }

  // Очищаем старые клики
  userData.clicks = userData.clicks.filter(t => nowTime - t < INTERVAL_MS);

  // Добавляем текущий клик
  userData.clicks.push(nowTime);

  // Проверка лимита
  if (userData.clicks.length > MAX_CLICKS) {
    userData.blockedUntil = nowTime + BLOCK_MS;
    userData.clicks = [];
    return res.json({
      success: false,
      message: `Слишком много кликов! Блокировка на 10 секунд`
    });
  }

  // ----- Обычная запись времени -----
  const now = new Date();
  const date = now.toLocaleDateString('ru-RU');
  const time = now.toLocaleTimeString();

  db.run('INSERT INTO records (date, time) VALUES (?, ?)', [date, time]);

  res.json({ success: true, date, time });
});

// Endpoint для получения всех записей
app.get('/records', (req, res) => {
  db.all('SELECT * FROM records', (err, rows) => {
    res.json(rows);
  });
});

// Endpoint для очистки всех записей
app.post('/clear', (req, res) => {
  db.run('DELETE FROM records', [], err => {
    if (err) console.error(err);
    res.json({ success: true });
  });
});

// Запускаем сервер на порту 3000 и слушаем все интерфейсы
app.listen(3000, '0.0.0.0', () => {
  console.log('Сервер запущен на порту 3000');
});
