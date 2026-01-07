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

# Останавливаем все процессы для освобождения памяти
echo "⏸️  Останавливаем процессы для освобождения памяти..."
pm2 stop all 2>/dev/null || true
pkill -9 -f "node.*next" 2>/dev/null || true
sleep 2

# Убиваем все процессы на порту 9000
echo "🔌 Освобождаем порт 9000..."
lsof -ti:9000 | xargs kill -9 2>/dev/null || true
sleep 1

# Очищаем кеши для освобождения памяти
echo "🧹 Очищаем кеши..."
rm -rf node_modules/.cache
rm -rf .next/cache 2>/dev/null || true
rm -rf tina/__generated__/.cache 2>/dev/null || true
pnpm store prune 2>/dev/null || true
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true

# Проверяем доступную память
echo ""
echo "📊 Доступная память:"
free -h
echo ""

# Генерируем админку
echo "📦 Генерируем админку TinaCMS..."
echo "   Используем лимит памяти: 2048MB (для 4GB RAM)"
echo ""
rm -rf public/admin
NODE_OPTIONS="--max-old-space-size=2048" \
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

# Запускаем все процессы снова
echo ""
echo "🔄 Запускаем приложения снова..."
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi
pm2 start ecosystem.config.js --update-env

echo ""
echo "✅ Готово! Админка доступна по адресу:"
echo "   https://seyla-fit.ru/admin"
echo "   http://localhost:3000/admin"

