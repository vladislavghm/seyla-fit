#!/bin/bash
# Скрипт для локальной генерации админки TinaCMS
# Использование: bash deploy/build-admin-local.sh
# После генерации загрузите public/admin на сервер

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Определяем корень проекта (директория, где находится этот скрипт)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Переходим в корень проекта
cd "$PROJECT_ROOT"

echo -e "${YELLOW}🏗️  Генерируем админку TinaCMS локально...${NC}"
echo -e "${YELLOW}   Рабочая директория: $PROJECT_ROOT${NC}"

# Проверяем наличие переменных окружения в корне проекта
ENV_FILE="$PROJECT_ROOT/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}   ❌ Файл .env.local не найден в корне проекта!${NC}"
    echo -e "${YELLOW}   Ожидаемый путь: $ENV_FILE${NC}"
    echo -e "${YELLOW}   Создайте .env.local с переменными:${NC}"
    echo -e "${YELLOW}   NEXT_PUBLIC_TINA_CLIENT_ID=...${NC}"
    echo -e "${YELLOW}   TINA_TOKEN=...${NC}"
    echo -e "${YELLOW}   NEXT_PUBLIC_TINA_BRANCH=main${NC}"
    exit 1
fi

# Загружаем переменные окружения
# Удаляем BOM если есть и загружаем файл
set -a
if [ -f "$ENV_FILE" ]; then
    # Создаем временный файл без BOM и загружаем его
    TEMP_ENV=$(mktemp)
    # Удаляем BOM (UTF-8 BOM = EF BB BF) и копируем в временный файл
    sed '1s/^\xEF\xBB\xBF//' "$ENV_FILE" > "$TEMP_ENV"
    source "$TEMP_ENV"
    rm -f "$TEMP_ENV"
fi
set +a

if [ -z "$NEXT_PUBLIC_TINA_CLIENT_ID" ] || [ -z "$TINA_TOKEN" ]; then
    echo -e "${RED}   ❌ Переменные NEXT_PUBLIC_TINA_CLIENT_ID и TINA_TOKEN не заданы!${NC}"
    exit 1
fi

echo -e "${GREEN}   ✓ Переменные окружения загружены${NC}"

# Удаляем старую админку
if [ -d "public/admin" ]; then
    echo -e "${YELLOW}   Удаляем старую админку...${NC}"
    rm -rf public/admin
fi

# Проверяем, занят ли порт 9000 (TinaCMS dev server)
PORT_9000_IN_USE=false
if command -v lsof >/dev/null 2>&1; then
    if lsof -ti:9000 >/dev/null 2>&1; then
        PORT_9000_IN_USE=true
    fi
elif command -v netstat >/dev/null 2>&1; then
    if netstat -ano 2>/dev/null | grep -q ":9000.*LISTENING"; then
        PORT_9000_IN_USE=true
    fi
fi

if [ "$PORT_9000_IN_USE" = true ]; then
    echo -e "${YELLOW}   ⚠️  Порт 9000 занят (возможно, запущен pnpm dev)${NC}"
    echo -e "${YELLOW}   Останавливаем процесс на порту 9000...${NC}"
    
    # Пытаемся остановить процесс на порту 9000
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti:9000 | xargs kill -9 2>/dev/null || true
    elif command -v netstat >/dev/null 2>&1; then
        # На Windows через netstat
        PID=$(netstat -ano 2>/dev/null | grep ":9000.*LISTENING" | awk '{print $5}' | head -1)
        if [ -n "$PID" ]; then
            taskkill //F //PID "$PID" 2>/dev/null || true
        fi
    fi
    
    sleep 2
    echo -e "${YELLOW}   Продолжаем генерацию...${NC}"
fi

# Генерируем админку с увеличенным лимитом памяти
echo -e "${YELLOW}   Генерируем админку (это может занять несколько минут)...${NC}"
if NODE_OPTIONS="--max-old-space-size=4096" \
   NEXT_PUBLIC_TINA_CLIENT_ID="$NEXT_PUBLIC_TINA_CLIENT_ID" \
   TINA_TOKEN="$TINA_TOKEN" \
   NEXT_PUBLIC_TINA_BRANCH="${NEXT_PUBLIC_TINA_BRANCH:-main}" \
   pnpm tinacms build 2>&1; then
    echo -e "${GREEN}   ✓ Админка успешно сгенерирована!${NC}"
else
    echo -e "${RED}   ❌ Генерация админки не удалась${NC}"
    echo -e "${YELLOW}   💡 Убедитесь, что pnpm dev остановлен, и запустите скрипт снова${NC}"
    exit 1
fi

# Проверяем результат
if [ -d "public/admin" ]; then
    ADMIN_SIZE=$(du -sh public/admin | cut -f1)
    echo -e "${GREEN}   ✓ Админка находится в public/admin (размер: $ADMIN_SIZE)${NC}"
    echo -e "${YELLOW}   📦 Теперь загрузите public/admin на сервер:${NC}"
    echo -e "${YELLOW}   ${NC}"
    echo -e "${YELLOW}   # Вариант 1: Через scp${NC}"
    echo -e "${YELLOW}   scp -r public/admin vladhoyl@155.212.188.120:~/seyla-fit/public/${NC}"
    echo -e "${YELLOW}   ${NC}"
    echo -e "${YELLOW}   # Вариант 2: Через rsync${NC}"
    echo -e "${YELLOW}   rsync -avz public/admin/ vladhoyl@155.212.188.120:~/seyla-fit/public/admin/${NC}"
    echo -e "${YELLOW}   ${NC}"
    echo -e "${YELLOW}   # Вариант 3: Через Git (если public/admin в .gitignore, добавьте его)${NC}"
    echo -e "${YELLOW}   git add public/admin${NC}"
    echo -e "${YELLOW}   git commit -m 'Update admin build'${NC}"
    echo -e "${YELLOW}   git push${NC}"
    echo -e "${YELLOW}   # Затем на сервере: git pull${NC}"
else
    echo -e "${RED}   ❌ Админка не была сгенерирована${NC}"
    exit 1
fi
