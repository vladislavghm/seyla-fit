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

# Очищаем перед сборкой (освобождает память и место)
echo -e "${YELLOW}🧹 Очищаем кеши и старые сборки...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf tina/__generated__/.cache
pnpm store prune 2>/dev/null || true
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
else
    echo -e "${YELLOW}   ⚠️  Файл .env.production не найден${NC}"
fi

# Собираем проект
echo -e "${YELLOW}🔨 Собираем проект...${NC}"
export NODE_OPTIONS="--max-old-space-size=1024"

# Генерируем TinaCMS файлы с Tina Cloud API (если есть переменные)
if [ ! -d "tina/__generated__" ] || [ -n "$NEXT_PUBLIC_TINA_CLIENT_ID" ]; then
    echo -e "${YELLOW}   Генерируем TinaCMS файлы...${NC}"
    if [ -n "$NEXT_PUBLIC_TINA_CLIENT_ID" ] && [ -n "$TINA_TOKEN" ]; then
        # Используем Tina Cloud API (как на Vercel)
        echo -e "${GREEN}   Используем Tina Cloud API...${NC}"
        rm -rf tina/__generated__
        # Явно экспортируем переменные для процесса
        NEXT_PUBLIC_TINA_CLIENT_ID="$NEXT_PUBLIC_TINA_CLIENT_ID" \
        TINA_TOKEN="$TINA_TOKEN" \
        NEXT_PUBLIC_TINA_BRANCH="${NEXT_PUBLIC_TINA_BRANCH:-main}" \
        pnpm tinacms build 2>&1 || {
            echo -e "${YELLOW}   ⚠️  TinaCMS Cloud генерация не удалась, пробуем локальную...${NC}"
            pnpm run tina:generate 2>&1 || echo -e "${YELLOW}   ⚠️  TinaCMS генерация пропущена${NC}"
        }
    else
        # Локальная генерация (для админки)
        echo -e "${YELLOW}   Переменные Tina Cloud не найдены, используем локальную генерацию...${NC}"
        pnpm run tina:generate 2>&1 || echo -e "${YELLOW}   ⚠️  TinaCMS генерация пропущена${NC}"
    fi
fi

# Проверяем, какой клиент сгенерирован
if [ -f "tina/__generated__/client.ts" ]; then
    if grep -q "localhost:4001" tina/__generated__/client.ts; then
        echo -e "${YELLOW}   ⚠️  Клиент все еще использует localhost:4001${NC}"
        echo -e "${YELLOW}   Если переменные Tina Cloud есть, попробуйте перегенерировать вручную${NC}"
    else
        echo -e "${GREEN}   ✓ Клиент использует Tina Cloud API${NC}"
    fi
fi

# Собираем Next.js (страницы теперь динамические, не требуют TinaCMS при сборке)
echo -e "${YELLOW}   Собираем Next.js...${NC}"
# Старая сборка уже удалена выше
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

