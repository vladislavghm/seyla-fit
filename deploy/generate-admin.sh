#!/bin/bash
# Скрипт для генерации админки TinaCMS
# Использование: bash deploy/generate-admin.sh

set -e

PROJECT_DIR="$HOME/seyla-fit"
cd "$PROJECT_DIR" || exit 1

echo "🔧 Генерация админки TinaCMS..."
echo ""

# Проверяем переменные окружения
if [ ! -f .env.production ]; then
    echo "❌ Файл .env.production не найден!"
    exit 1
fi

source .env.production

if [ -z "$NEXT_PUBLIC_TINA_CLIENT_ID" ] || [ -z "$TINA_TOKEN" ]; then
    echo "❌ Переменные TinaCMS не настроены!"
    exit 1
fi

# Останавливаем webhook-server (использует порт 9000)
echo "⏸️  Останавливаем webhook-server..."
pm2 stop webhook-server 2>/dev/null || true

# Убиваем все процессы на порту 9000
echo "🔌 Освобождаем порт 9000..."
lsof -ti:9000 | xargs kill -9 2>/dev/null || true
sleep 2

# Генерируем админку
echo "📦 Генерируем админку TinaCMS..."
echo "⚠️  ВНИМАНИЕ: Генерация админки требует много памяти!"
echo "   Если процесс упадет с ошибкой памяти, лучше сгенерировать"
echo "   админку локально и загрузить через SCP"
echo ""
rm -rf public/admin
NODE_OPTIONS="--max-old-space-size=768" \
NEXT_PUBLIC_TINA_CLIENT_ID="$NEXT_PUBLIC_TINA_CLIENT_ID" \
TINA_TOKEN="$TINA_TOKEN" \
NEXT_PUBLIC_TINA_BRANCH="${NEXT_PUBLIC_TINA_BRANCH:-main}" \
pnpm tinacms build

# Проверяем результат
if [ -d "public/admin" ] && [ -f "public/admin/index.html" ]; then
    echo ""
    echo "✅ Админка успешно сгенерирована!"
    echo "   Расположение: public/admin/"
    echo "   Размер: $(du -sh public/admin | cut -f1)"
else
    echo ""
    echo "❌ Ошибка: админка не сгенерирована"
    exit 1
fi

# Запускаем webhook-server снова
echo ""
echo "🔄 Запускаем webhook-server снова..."
pm2 start ecosystem.config.js --update-env --only webhook-server 2>/dev/null || true

# Перезапускаем приложение
echo "🔄 Перезапускаем приложение..."
pm2 restart seyla-fit

echo ""
echo "✅ Готово! Админка доступна по адресу:"
echo "   https://seyla-fit.ru/admin"
echo "   http://localhost:3000/admin"

