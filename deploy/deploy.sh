#!/bin/bash
# Скрипт для быстрого деплоя обновлений
# Использование: bash deploy.sh

set -e

PROJECT_DIR="$HOME/seyla-fit"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Начинаем деплой обновлений...${NC}"

cd "$PROJECT_DIR" || exit 1

# Получаем последние изменения
echo -e "${YELLOW}📥 Получаем изменения из Git...${NC}"
git pull origin main || git pull origin master

# Устанавливаем зависимости
echo -e "${YELLOW}📦 Устанавливаем зависимости...${NC}"
pnpm install --frozen-lockfile

# Загружаем переменные окружения
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi

# Собираем проект
echo -e "${YELLOW}🔨 Собираем проект...${NC}"
export NODE_OPTIONS="--max-old-space-size=1024"

# Генерируем TinaCMS файлы (если нужно для админки)
if [ ! -d "tina/__generated__" ]; then
    echo -e "${YELLOW}   Генерируем TinaCMS файлы для админки...${NC}"
    pnpm run tina:generate 2>&1 || echo -e "${YELLOW}   ⚠️  TinaCMS генерация пропущена${NC}"
fi

# Собираем Next.js (страницы теперь динамические, не требуют TinaCMS при сборке)
echo -e "${YELLOW}   Собираем Next.js...${NC}"
pnpm next build

# Перезапускаем приложение с переменными окружения
echo -e "${YELLOW}🔄 Перезапускаем приложение...${NC}"

# Останавливаем приложение перед перезапуском
pm2 delete seyla-fit 2>/dev/null || true
pm2 delete webhook-server 2>/dev/null || true

# Загружаем переменные окружения
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi

# Запускаем через ecosystem.config.js (он сам загрузит переменные)
pm2 start ecosystem.config.js --update-env
pm2 save

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo ""
pm2 status

