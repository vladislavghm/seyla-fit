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

# Пробуем собрать через build-local, если не получается - только Next.js
if pnpm run build-local 2>&1; then
    echo -e "${GREEN}   ✓ Сборка с TinaCMS успешна${NC}"
else
    echo -e "${YELLOW}   ⚠️  Сборка с TinaCMS не удалась, собираем только Next.js...${NC}"
    pnpm run build-next-only || pnpm next build
fi

# Перезапускаем приложение с переменными окружения
echo -e "${YELLOW}🔄 Перезапускаем приложение...${NC}"
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
    pm2 delete seyla-fit 2>/dev/null || true
    NEXT_PUBLIC_TINA_CLIENT_ID="$NEXT_PUBLIC_TINA_CLIENT_ID" \
    TINA_TOKEN="$TINA_TOKEN" \
    NEXT_PUBLIC_TINA_BRANCH="${NEXT_PUBLIC_TINA_BRANCH:-main}" \
    NODE_ENV=production \
    PORT=3000 \
    pm2 start ecosystem.config.js
else
    pm2 restart seyla-fit || pm2 start ecosystem.config.js
fi

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo ""
pm2 status

