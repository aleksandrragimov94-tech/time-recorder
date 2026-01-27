Time Recorder ⏱️

Проект Time Recorder — это простой сервис для записи времени кликов пользователей с защитой от спама, с метриками для Prometheus и визуализацией через Grafana.
Проект использует Docker для запуска всего стека и готов к интеграции с Jenkins и другими инструментами CI/CD.


Стек проекта

Node.js + Express — сервер для записи времени и отдачи API
SQLite — локальная база данных для хранения последних 20 записей
Prometheus — сбор метрик из сервера и Jenkins
Grafana — визуализация метрик и дашбордов
Docker / Docker Compose — контейнеризация всех сервисов

Основные функции

Запись времени кликов
Endpoint: POST /record
Лимит кликов: до 5 за 3 секунды с одного IP
Блокировка на 10 секунд при превышении лимита
Получение записей
Endpoint: GET /records
Возвращает последние 20 записей времени
Очистка записей
Endpoint: POST /clear
Удаляет все записи из базы
Метрики для Prometheus
Endpoint: GET /metrics
Счетчик кликов record_requests_total
Визуализация в Grafana
Отображает:
Клики пользователей /record

Структура проекта

time-recorder/
├─ Dockerfile
├─ docker-compose.yml
├─ prometheus.yml
├─ grafana-dashboard.json
├─ setup.sh           # Скрипт для запуска всех сервисов
├─ server.js          # Основной сервер Node.js
├─ db.sqlite          # База данных (SQLite)
├─ public/            # Статика (HTML/JS)
├─ package.json
├─ package-lock.json
└─ README.md

Особенности реализации

Защита от спама реализована через хранение последних кликов IP в памяти.
Сохраняются только последние 20 записей в базе данных.
