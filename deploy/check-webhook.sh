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
echo "3️⃣ Проверка доступности webhook локально (webhook-server):"
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/webhook 2>/dev/null || echo "000")
if [ "$LOCAL_STATUS" = "405" ] || [ "$LOCAL_STATUS" = "200" ]; then
    echo "   ✅ Webhook-server доступен (HTTP $LOCAL_STATUS - ожидается для GET запроса)"
else
    echo "   ⚠️  Webhook-server вернул статус: $LOCAL_STATUS"
fi
echo ""
echo "3️⃣ Проверка доступности webhook через Nginx (HTTPS):"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://seyla-fit.ru/webhook 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "405" ] || [ "$HTTPS_STATUS" = "200" ]; then
    echo "   ✅ Webhook доступен через HTTPS (HTTP $HTTPS_STATUS - ожидается для GET запроса)"
else
    echo "   ⚠️  Webhook вернул статус: $HTTPS_STATUS (возможна проблема с Nginx или SSL)"
fi
echo ""

# 4. Проверяем Nginx конфигурацию
echo "4️⃣ Проверка Nginx конфигурации для /webhook:"
NGINX_AVAILABLE="/etc/nginx/sites-available/seyla-fit"
NGINX_ENABLED="/etc/nginx/sites-enabled/seyla-fit"

# Определяем реальный файл конфигурации
if [ -L "$NGINX_ENABLED" ]; then
    REAL_PATH=$(sudo readlink -f "$NGINX_ENABLED" 2>/dev/null || echo "")
    CHECK_FILE="${REAL_PATH:-$NGINX_AVAILABLE}"
else
    CHECK_FILE="$NGINX_AVAILABLE"
fi

if [ -f "$CHECK_FILE" ]; then
    if sudo grep -q "location /webhook" "$CHECK_FILE" 2>/dev/null; then
        echo "   ✅ Конфигурация /webhook найдена в $CHECK_FILE"
        sudo grep -A 5 "location /webhook" "$CHECK_FILE" | head -6
    else
        echo "   ❌ Конфигурация /webhook НЕ найдена в $CHECK_FILE"
        if [ -f "$NGINX_ENABLED" ] && [ "$CHECK_FILE" != "$NGINX_ENABLED" ]; then
            echo "   Проверяем также sites-enabled..."
            if sudo grep -q "location /webhook" "$NGINX_ENABLED" 2>/dev/null; then
                echo "   ⚠️  Конфигурация найдена в sites-enabled, но не в sites-available!"
            fi
        fi
    fi
else
    echo "   ⚠️  Конфигурация Nginx не найдена: $CHECK_FILE"
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

echo "6️⃣ Дополнительная диагностика:"
if [ -L "$NGINX_ENABLED" ]; then
    REAL_PATH=$(sudo readlink -f "$NGINX_ENABLED" 2>/dev/null || echo "")
    echo "   Симлинк sites-enabled → $REAL_PATH"
    if [ "$REAL_PATH" != "$NGINX_AVAILABLE" ]; then
        echo "   ⚠️  Внимание: sites-enabled указывает не на sites-available!"
        echo "   Это может быть нормально, если certbot изменил структуру файлов"
    fi
else
    echo "   sites-enabled не является симлинком"
fi
echo ""

echo "✅ Проверка завершена"
echo ""
if [ "$HTTPS_STATUS" != "405" ] && [ "$HTTPS_STATUS" != "200" ]; then
    echo "🔧 Если webhook не работает, попробуйте:"
    echo "   bash deploy/fix-webhook.sh"
    echo ""
fi
echo "📝 Для настройки webhook в GitHub:"
echo "   1. GitHub → Settings → Webhooks → Add webhook"
echo "   2. Payload URL: https://seyla-fit.ru/webhook"
echo "   3. Content type: application/json"
echo "   4. Secret: ваш WEBHOOK_SECRET из .env.production"
echo "   5. Events: Just the push event"
echo "   6. Active: ✓"

