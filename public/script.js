// ===============================
// Обновление часов на странице (24-часовой формат)
// ===============================
function updateClock() {
  const now = new Date();
  const clockEl = document.getElementById('clock');

  if (!clockEl) return;

  clockEl.textContent = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// запускаем сразу
updateClock();

// обновляем каждую секунду
setInterval(updateClock, 1000);


// ===============================
// Обновление таблицы с последними 4 записями
// ===============================
function updateTable(records) {
  const tbody = document.querySelector('#recordsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const lastRecords = records.slice(-4).reverse();

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


// ===============================
// Функция записи времени
// ===============================
function recordTime() {
  fetch('/record', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message);
        return;
      }

      return fetch('/records');
    })
    .then(res => res && res.json())
    .then(records => {
      if (records) {
        updateTable(records);
      }
    })
    .catch(err => {
      console.error('Ошибка записи времени:', err);
    });
}


// ===============================
// Очистка всех записей
// ===============================
function clearRecords() {
  fetch('/clear', { method: 'POST' })
    .then(() => updateTable([]))
    .catch(err => {
      console.error('Ошибка очистки:', err);
    });
}


// ===============================
// Загрузка записей при открытии страницы
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  fetch('/records')
    .then(res => res.json())
    .then(records => updateTable(records))
    .catch(err => {
      console.error('Ошибка загрузки записей:', err);
    });
});
