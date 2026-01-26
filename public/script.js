// Обновление часов на странице
function updateClock() {
  const now = new Date();
  document.getElementById('clock').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Обновление таблицы с последними 4 записями
function updateTable(records) {
  const tbody = document.querySelector('#recordsTable tbody');
  tbody.innerHTML = ''; // очищаем таблицу
  const lastRecords = records.slice(-4).reverse(); // последние 4 записи, новые сверху
  lastRecords.forEach(r => {
    const tr = document.createElement('tr');
    const tdDate = document.createElement('td');
    const tdTime = document.createElement('td');
    tdDate.innerText = r.date;
    tdTime.innerText = r.time;
    tr.appendChild(tdDate);
    tr.appendChild(tdTime);
    tbody.appendChild(tr);
  });
}

// Функция записи времени
function recordTime() {
  fetch('/record', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        // Если сервер вернул блокировку, показываем предупреждение
        alert(data.message);
        return;
      }
      // Если запись успешна, обновляем таблицу
      fetch('/records')
        .then(res => res.json())
        .then(records => updateTable(records));
    });
}

// Функция очистки всех записей
function clearRecords() {
  fetch('/clear', { method: 'POST' })
    .then(() => updateTable([]));
}

// Автозагрузка последних записей при открытии страницы
window.addEventListener('DOMContentLoaded', () => {
  fetch('/records')
    .then(res => res.json())
    .then(records => updateTable(records));
});
