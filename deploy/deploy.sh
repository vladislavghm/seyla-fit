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

# Очищаем кеши (но НЕ удаляем .next - приложение должно продолжать работать)
echo -e "${YELLOW}🧹 Очищаем кеши...${NC}"
rm -rf node_modules/.cache
rm -rf tina/__generated__/.cache
pnpm store prune 2>/dev/null || true
echo -e "${GREEN}   ✓ Очистка кешей завершена${NC}"

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

# НЕ останавливаем приложение - оно должно продолжать работать во время сборки
# Старая версия будет работать, пока мы собираем новую
echo -e "${YELLOW}📦 Собираем новую версию (старая продолжает работать)...${NC}"

# Генерируем TinaCMS файлы (клиент и админка)
# Всегда пересобираем админку при деплое для гарантии актуальности
if [ -n "$NEXT_PUBLIC_TINA_CLIENT_ID" ] && [ -n "$TINA_TOKEN" ]; then
    echo -e "${YELLOW}   Генерируем TinaCMS файлы (клиент и админка)...${NC}"
    
    # Временно останавливаем webhook-server, если он запущен (он использует порт 9000)
    WEBHOOK_RUNNING=false
    if pm2 list | grep -q "webhook-server.*online"; then
        echo -e "${YELLOW}   Временно останавливаем webhook-server (освобождаем порт 9000)...${NC}"
        pm2 stop webhook-server 2>/dev/null || true
        WEBHOOK_RUNNING=true
        sleep 1
    fi
    
    # Проверяем, не занят ли порт 9000 другим процессом
    PORT_9000_IN_USE=false
    if command -v lsof >/dev/null 2>&1; then
        if lsof -ti:9000 >/dev/null 2>&1; then
            PORT_9000_IN_USE=true
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tuln 2>/dev/null | grep -q ":9000"; then
            PORT_9000_IN_USE=true
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -tuln 2>/dev/null | grep -q ":9000"; then
            PORT_9000_IN_USE=true
        fi
    fi
    
    if [ "$PORT_9000_IN_USE" = true ]; then
        echo -e "${YELLOW}   Порт 9000 все еще занят, пытаемся освободить...${NC}"
        # Пытаемся убить процесс на порту 9000
        if command -v lsof >/dev/null 2>&1; then
            lsof -ti:9000 | xargs kill -9 2>/dev/null || true
        elif command -v fuser >/dev/null 2>&1; then
            fuser -k 9000/tcp 2>/dev/null || true
        fi
        sleep 2
    fi
    
    # Используем Tina Cloud API (генерирует и клиент, и админку)
    rm -rf tina/__generated__
    rm -rf public/admin
    
    # Генерируем TinaCMS файлы с правильными переменными окружения
    # Используем другой порт для datalayer, чтобы не конфликтовать с webhook-server
    TINA_BUILD_SUCCESS=false
    if NODE_OPTIONS="--max-old-space-size=1024" \
       NEXT_PUBLIC_TINA_CLIENT_ID="$NEXT_PUBLIC_TINA_CLIENT_ID" \
       TINA_TOKEN="$TINA_TOKEN" \
       NEXT_PUBLIC_TINA_BRANCH="${NEXT_PUBLIC_TINA_BRANCH:-main}" \
       TINA_DATALAYER_PORT=9001 \
       pnpm tinacms build 2>&1; then
        TINA_BUILD_SUCCESS=true
    else
        echo -e "${YELLOW}   ⚠️  Первая попытка генерации не удалась, пробуем без указания порта...${NC}"
        # Пробуем без указания порта (после остановки webhook-server порт должен быть свободен)
        if NODE_OPTIONS="--max-old-space-size=1024" \
           NEXT_PUBLIC_TINA_CLIENT_ID="$NEXT_PUBLIC_TINA_CLIENT_ID" \
           TINA_TOKEN="$TINA_TOKEN" \
           NEXT_PUBLIC_TINA_BRANCH="${NEXT_PUBLIC_TINA_BRANCH:-main}" \
           pnpm tinacms build 2>&1; then
            TINA_BUILD_SUCCESS=true
        else
            echo -e "${RED}   ❌ Генерация TinaCMS не удалась после всех попыток${NC}"
        fi
    fi
    
    # Перезапускаем webhook-server, если он был запущен
    if [ "$WEBHOOK_RUNNING" = true ]; then
        echo -e "${YELLOW}   Перезапускаем webhook-server...${NC}"
        pm2 start webhook-server 2>/dev/null || pm2 restart webhook-server 2>/dev/null || true
    fi
    
    # Проверяем что клиент сгенерирован (критично для работы приложения)
    if [ -f "tina/__generated__/client.js" ] || [ -f "tina/__generated__/client.ts" ]; then
        echo -e "${GREEN}   ✓ TinaCMS клиент сгенерирован${NC}"
    else
        echo -e "${RED}   ❌ TinaCMS клиент НЕ сгенерирован! Приложение не сможет работать.${NC}"
        if [ "$TINA_BUILD_SUCCESS" = false ]; then
            echo -e "${RED}   Генерация не удалась. Проверьте логи выше.${NC}"
            exit 1
        fi
    fi
    
    # Проверяем что админка сгенерирована
    if [ -d "public/admin" ]; then
        echo -e "${GREEN}   ✓ Админка сгенерирована${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Админка не сгенерирована (не критично, но админка не будет доступна)${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Пропуск генерации TinaCMS (нет переменных окружения)${NC}"
    # Проверяем, есть ли уже сгенерированный клиент
    if [ ! -f "tina/__generated__/client.js" ] && [ ! -f "tina/__generated__/client.ts" ]; then
        echo -e "${RED}   ❌ TinaCMS клиент отсутствует и переменные окружения не заданы!${NC}"
        echo -e "${RED}   Приложение не сможет работать. Проверьте .env.production${NC}"
        exit 1
    fi
fi

# Собираем Next.js (старое приложение продолжает работать)
echo -e "${YELLOW}🔨 Собираем Next.js...${NC}"
export NODE_OPTIONS="--max-old-space-size=1536"
export NEXT_PRIVATE_WORKERS=1
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

# Удаляем .next только если приложение не запущено (как было раньше)
if ! pm2 list | grep -q "seyla-fit.*online"; then
    echo -e "${YELLOW}   Приложение не запущено, очищаем .next...${NC}"
    rm -rf .next
fi

if ! pnpm next build --no-lint; then
    echo -e "${RED}   ❌ Сборка не удалась${NC}"
    # Если приложение было запущено, оно продолжит работать со старой версией
    exit 1
fi

# Перезапускаем приложение
echo -e "${YELLOW}🔄 Перезапускаем приложение...${NC}"

# Загружаем переменные окружения для PM2
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi

# Перезагружаем приложение с нулевым простоем (graceful reload)
if pm2 list | grep -q "seyla-fit.*online"; then
    echo -e "${YELLOW}   Выполняем graceful reload (zero-downtime)...${NC}"
    pm2 reload seyla-fit --update-env
    # Даем время на graceful reload и проверяем статус
    sleep 2
    if pm2 list | grep -q "seyla-fit.*online"; then
        echo -e "${GREEN}   ✓ Приложение успешно перезагружено${NC}"
    else
        echo -e "${RED}   ⚠️  Приложение не запустилось после reload, проверьте логи${NC}"
        pm2 logs seyla-fit --lines 20 --err
    fi
elif pm2 list | grep -q "seyla-fit"; then
    # Если процесс есть, но не запущен - перезапускаем
    echo -e "${YELLOW}   Перезапускаем приложение (процесс был остановлен)...${NC}"
    pm2 restart seyla-fit --update-env
else
    # Если процесса нет - запускаем
    echo -e "${YELLOW}   Запускаем приложение...${NC}"
    cd "$PROJECT_DIR"
    pm2 start ecosystem.config.js --only seyla-fit --update-env
fi

# Убеждаемся, что webhook-server запущен
if ! pm2 list | grep -q "webhook-server.*online"; then
    echo -e "${YELLOW}   Запускаем webhook-server...${NC}"
    pm2 start ecosystem.config.js --only webhook-server --update-env 2>/dev/null || pm2 restart webhook-server --update-env 2>/dev/null || true
fi

pm2 save

echo -e "${GREEN}✅ Деплой завершен!${NC}"
pm2 status
