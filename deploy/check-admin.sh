#!/bin/bash
# Скрипт для проверки и настройки админки TinaCMS

echo "🔍 Проверка админки TinaCMS..."
echo ""

PROJECT_DIR="$HOME/seyla-fit"
cd "$PROJECT_DIR" || exit 1

# 1. Проверяем наличие файлов админки
echo "1️⃣ Проверяем файлы админки:"
if [ -d "public/admin" ] && [ -f "public/admin/index.html" ]; then
    echo "   ✅ Файлы админки найдены"
    ls -lh public/admin/ | head -10
    echo ""
    echo "   Размер директории:"
    du -sh public/admin/
else
    echo "   ❌ Файлы админки НЕ найдены!"
    echo "   Нужно сгенерировать через: pnpm tinacms build"
fi
echo ""

# 2. Проверяем переменные окружения
echo "2️⃣ Проверяем переменные TinaCMS:"
if [ -f .env.production ]; then
    source .env.production
    if [ -n "$NEXT_PUBLIC_TINA_CLIENT_ID" ] && [ -n "$TINA_TOKEN" ]; then
        echo "   ✅ Переменные окружения настроены"
        echo "   CLIENT_ID: ${NEXT_PUBLIC_TINA_CLIENT_ID:0:10}..."
        echo "   TOKEN: ${TINA_TOKEN:0:10}..."
    else
        echo "   ❌ Переменные окружения не настроены!"
    fi
else
    echo "   ⚠️  Файл .env.production не найден"
fi
echo ""

# 3. Проверяем конфигурацию Nginx
echo "3️⃣ Проверяем конфигурацию Nginx для /admin:"
if [ -f /etc/nginx/sites-enabled/seyla-fit ]; then
    if grep -q "location /admin" /etc/nginx/sites-enabled/seyla-fit; then
        echo "   ✅ Найдена конфигурация /admin в Nginx:"
        grep -A 10 "location /admin" /etc/nginx/sites-enabled/seyla-fit
    else
        echo "   ⚠️  Конфигурация /admin не найдена (используется proxy_pass)"
    fi
else
    echo "   ❌ Конфигурация Nginx не найдена"
fi
echo ""

# 4. Проверяем доступность админки через curl
echo "4️⃣ Проверяем доступность /admin:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Next.js отдает /admin (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ Next.js возвращает 404 - файлы админки не найдены"
else
    echo "   ⚠️  Next.js возвращает HTTP $HTTP_CODE"
fi
echo ""

echo "✅ Проверка завершена"
echo ""
echo "📝 Для генерации админки выполните:"
echo "   cd ~/seyla-fit"
echo "   source .env.production"
echo "   pnpm tinacms build"

