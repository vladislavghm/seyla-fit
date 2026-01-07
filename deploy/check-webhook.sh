#!/bin/bash
# Скрипт для проверки работы webhook

echo "🔍 Проверка webhook..."
echo ""

# 1. Проверяем webhook-server
echo "1️⃣ Статус webhook-server:"
pm2 list | grep webhook-server || echo "   ❌ webhook-server не запущен"
echo ""

# 2. Проверяем логи webhook
echo "2️⃣ Последние логи webhook:"
if [ -f ~/seyla-fit/logs/webhook.log ]; then
    tail -20 ~/seyla-fit/logs/webhook.log
else
    echo "   ⚠️  Логи не найдены"
fi
echo ""

# 3. Проверяем доступность webhook
echo "3️⃣ Проверка доступности webhook локально:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:9000/webhook || echo "   ❌ Webhook не доступен"
echo ""

# 4. Проверяем Nginx конфигурацию
echo "4️⃣ Проверка Nginx конфигурации для /webhook:"
if [ -f /etc/nginx/sites-enabled/seyla-fit ]; then
    if grep -q "location /webhook" /etc/nginx/sites-enabled/seyla-fit; then
        echo "   ✅ Конфигурация /webhook найдена в Nginx"
        grep -A 5 "location /webhook" /etc/nginx/sites-enabled/seyla-fit | head -6
    else
        echo "   ❌ Конфигурация /webhook НЕ найдена в Nginx!"
    fi
else
    echo "   ⚠️  Конфигурация Nginx не найдена"
fi
echo ""

# 5. Проверяем переменную WEBHOOK_SECRET
echo "5️⃣ Проверка WEBHOOK_SECRET:"
if [ -f ~/seyla-fit/.env.production ]; then
    if grep -q "WEBHOOK_SECRET" ~/seyla-fit/.env.production; then
        echo "   ✅ WEBHOOK_SECRET настроен"
    else
        echo "   ⚠️  WEBHOOK_SECRET не найден в .env.production"
    fi
else
    echo "   ⚠️  Файл .env.production не найден"
fi
echo ""

echo "✅ Проверка завершена"
echo ""
echo "📝 Для настройки webhook в GitHub:"
echo "   1. GitHub → Settings → Webhooks → Add webhook"
echo "   2. Payload URL: https://seyla-fit.ru/webhook"
echo "   3. Content type: application/json"
echo "   4. Secret: ваш WEBHOOK_SECRET из .env.production"
echo "   5. Events: Just the push event"
echo "   6. Active: ✓"

