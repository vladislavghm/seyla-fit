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

# Очищаем перед сборкой
echo -e "${YELLOW}🧹 Очищаем кеши и старые сборки...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf tina/__generated__/.cache
pnpm store prune 2>/dev/null || true

# Очищаем системные кеши
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
echo -e "${GREEN}   ✓ Очистка завершена${NC}"

# Устанавливаем зависимости
echo -e "${YELLOW}📦 Устанавливаем зависимости...${NC}"
pnpm install --frozen-lockfile

# Загружаем переменные окружения
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
    echo -e "${GREEN}   ✓ Переменные окружения загружены${NC}"
fi

# Останавливаем только seyla-fit перед сборкой (webhook-server оставляем работающим)
echo -e "${YELLOW}⏸️  Останавливаем приложение seyla-fit...${NC}"
pm2 stop seyla-fit 2>/dev/null || true
pm2 delete seyla-fit 2>/dev/null || true
pkill -9 -f "node.*next.*start" 2>/dev/null || true
pkill -9 -f "tinacms" 2>/dev/null || true
sleep 2

# Генерируем TinaCMS файлы (клиент и админка)
if [ ! -f "tina/__generated__/client.ts" ] || [ ! -d "public/admin" ]; then
    echo -e "${YELLOW}   Генерируем TinaCMS файлы (клиент и админка)...${NC}"
    
    if [ -n "$NEXT_PUBLIC_TINA_CLIENT_ID" ] && [ -n "$TINA_TOKEN" ]; then
        # Используем Tina Cloud API (генерирует и клиент, и админку)
        rm -rf tina/__generated__
        rm -rf public/admin
        NODE_OPTIONS="--max-old-space-size=1024" \
        NEXT_PUBLIC_TINA_CLIENT_ID="$NEXT_PUBLIC_TINA_CLIENT_ID" \
        TINA_TOKEN="$TINA_TOKEN" \
        NEXT_PUBLIC_TINA_BRANCH="${NEXT_PUBLIC_TINA_BRANCH:-main}" \
        pnpm tinacms build 2>&1 || echo -e "${YELLOW}   ⚠️  TinaCMS генерация пропущена${NC}"
        
        # Проверяем что админка сгенерирована
        if [ -d "public/admin" ]; then
            echo -e "${GREEN}   ✓ Админка сгенерирована${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Админка не сгенерирована${NC}"
        fi
    fi
fi

# Собираем Next.js
echo -e "${YELLOW}🔨 Собираем Next.js...${NC}"
export NODE_OPTIONS="--max-old-space-size=1536"
export NEXT_PRIVATE_WORKERS=1
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

pnpm next build --no-lint || {
    echo -e "${RED}   ❌ Сборка не удалась${NC}"
    exit 1
}

# Перезапускаем приложение
echo -e "${YELLOW}🔄 Перезапускаем приложение...${NC}"

# Загружаем переменные окружения для PM2
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi

# Запускаем только seyla-fit (webhook-server оставляем работать)
# Используем restart вместо start ecosystem.config.js, чтобы не перечитывать весь конфиг
if pm2 list | grep -q "seyla-fit"; then
    pm2 restart seyla-fit --update-env
else
    # Если seyla-fit нет в списке, запускаем только его
    cd "$PROJECT_DIR"
    pm2 start ecosystem.config.js --only seyla-fit --update-env
fi
pm2 save

echo -e "${GREEN}✅ Деплой завершен!${NC}"
pm2 status
