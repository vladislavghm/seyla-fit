#!/bin/bash
# Автоматическая установка Seyla Fit на Beget VPS
# Использование: bash install.sh

set -e

DOMAIN="seyla-fit.ru"
GIT_REPO="https://github.com/leonov-xi/seyla-fit.git"
PROJECT_DIR="$HOME/seyla-fit"
EMAIL=""  # Укажите ваш email для SSL сертификата

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Начинаем автоматическую установку Seyla Fit на Beget...${NC}"

# Проверка, запущен ли скрипт от root или с sudo
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Не запускайте скрипт от root. Используйте обычного пользователя.${NC}"
   exit 1
fi

# 1. Обновление системы и установка необходимых пакетов
echo -e "${YELLOW}📦 Шаг 1/7: Установка Node.js, Nginx и других инструментов...${NC}"
sudo apt update
sudo apt upgrade -y

# Установка Node.js 20.x
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}   Устанавливаем Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}   ✓ Node.js уже установлен: $(node -v)${NC}"
fi

# Установка Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}   Устанавливаем Nginx...${NC}"
    sudo apt install -y nginx
else
    echo -e "${GREEN}   ✓ Nginx уже установлен${NC}"
fi

# Установка Certbot для SSL
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}   Устанавливаем Certbot...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}   ✓ Certbot уже установлен${NC}"
fi

# Установка pnpm глобально
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}   Устанавливаем pnpm...${NC}"
    sudo npm install -g pnpm
else
    echo -e "${GREEN}   ✓ pnpm уже установлен: $(pnpm -v)${NC}"
fi

# Установка PM2 глобально
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}   Устанавливаем PM2...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}   ✓ PM2 уже установлен${NC}"
fi


# 2. Клонирование/обновление репозитория
echo -e "${YELLOW}📥 Шаг 2/7: Получение кода проекта...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}   Директория уже существует, обновляем...${NC}"
    cd "$PROJECT_DIR"
    git pull origin main || git pull origin master
else
    echo -e "${YELLOW}   Клонируем репозиторий...${NC}"
    git clone "$GIT_REPO" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# 3. Установка зависимостей
echo -e "${YELLOW}📦 Шаг 3/7: Установка зависимостей проекта...${NC}"
pnpm install --frozen-lockfile

# 4. Настройка переменных окружения
echo -e "${YELLOW}⚙️  Шаг 4/7: Настройка переменных окружения...${NC}"
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo -e "${YELLOW}   Создаём файл .env.production...${NC}"
    echo ""
    echo -e "${RED}⚠️  ВАЖНО: Вам нужно будет вручную добавить переменные окружения!${NC}"
    echo -e "${YELLOW}   Отредактируйте файл: $PROJECT_DIR/.env.production${NC}"
    echo -e "${YELLOW}   Необходимые переменные:${NC}"
    echo "   - NEXT_PUBLIC_TINA_CLIENT_ID"
    echo "   - TINA_TOKEN"
    echo "   - NEXT_PUBLIC_TINA_BRANCH=main"
    echo ""
    read -p "   Добавить переменные сейчас? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "   NEXT_PUBLIC_TINA_CLIENT_ID: " CLIENT_ID
        read -p "   TINA_TOKEN: " TOKEN
        read -p "   NEXT_PUBLIC_TINA_BRANCH [main]: " BRANCH
        BRANCH=${BRANCH:-main}
        
        cat > "$PROJECT_DIR/.env.production" << EOF
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_TINA_CLIENT_ID=$CLIENT_ID
TINA_TOKEN=$TOKEN
NEXT_PUBLIC_TINA_BRANCH=$BRANCH
EOF
        echo -e "${GREEN}   ✓ Переменные окружения сохранены${NC}"
    else
        cat > "$PROJECT_DIR/.env.production" << EOF
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_TINA_CLIENT_ID=замените_на_ваш_client_id
TINA_TOKEN=замените_на_ваш_token
NEXT_PUBLIC_TINA_BRANCH=main
EOF
        echo -e "${YELLOW}   ⚠️  Не забудьте отредактировать .env.production перед запуском!${NC}"
    fi
else
    echo -e "${GREEN}   ✓ Файл .env.production уже существует${NC}"
fi

# 5. Сборка проекта
echo -e "${YELLOW}🔨 Шаг 5/7: Сборка проекта...${NC}"
source "$PROJECT_DIR/.env.production" 2>/dev/null || true

# Пробуем собрать с TinaCMS, но если зависнет - используем только Next.js build
echo -e "${YELLOW}   Пробуем собрать с TinaCMS (может занять несколько минут)...${NC}"
timeout 300 pnpm run build-local 2>&1 || {
    echo -e "${YELLOW}   TinaCMS build завис или не удался, собираем только Next.js...${NC}"
    # Если tina файлы уже есть, просто собираем Next.js
    if [ -d "$PROJECT_DIR/tina/__generated__" ]; then
        echo -e "${YELLOW}   Tina файлы уже существуют, собираем только Next.js...${NC}"
        cd "$PROJECT_DIR"
        pnpm next build
    else
        echo -e "${YELLOW}   Пробуем собрать через обычный build...${NC}"
        timeout 180 pnpm run build 2>&1 || {
            echo -e "${RED}   ⚠️  Ошибка сборки. Пробуем только Next.js build...${NC}"
            cd "$PROJECT_DIR"
            pnpm next build
        }
    fi
}

# 6. Настройка PM2
echo -e "${YELLOW}⚙️  Шаг 6/7: Настройка PM2...${NC}"
if [ -f "$PROJECT_DIR/deploy/ecosystem.config.js" ]; then
    cp "$PROJECT_DIR/deploy/ecosystem.config.js" "$PROJECT_DIR/ecosystem.config.js"
    echo -e "${GREEN}   ✓ Конфигурация PM2 скопирована${NC}"
fi

# Делаем webhook сервер исполняемым
if [ -f "$PROJECT_DIR/deploy/webhook-server.js" ]; then
    chmod +x "$PROJECT_DIR/deploy/webhook-server.js"
    echo -e "${GREEN}   ✓ Webhook сервер настроен${NC}"
fi

# Запуск/перезапуск через PM2
if pm2 list | grep -q "seyla-fit"; then
    echo -e "${YELLOW}   Перезапускаем приложение...${NC}"
    pm2 delete seyla-fit 2>/dev/null || true
fi

if pm2 list | grep -q "webhook-server"; then
    pm2 delete webhook-server 2>/dev/null || true
fi

# Загружаем переменные из .env.production и запускаем PM2
if [ -f "$PROJECT_DIR/.env.production" ]; then
    echo -e "${YELLOW}   Запускаем приложение с переменными из .env.production...${NC}"
    set -a
    source "$PROJECT_DIR/.env.production"
    set +a
    # Запускаем PM2 с переменными окружения
    cd "$PROJECT_DIR"
    NEXT_PUBLIC_TINA_CLIENT_ID="$NEXT_PUBLIC_TINA_CLIENT_ID" \
    TINA_TOKEN="$TINA_TOKEN" \
    NEXT_PUBLIC_TINA_BRANCH="${NEXT_PUBLIC_TINA_BRANCH:-main}" \
    WEBHOOK_SECRET="${WEBHOOK_SECRET:-}" \
    NODE_ENV=production \
    PORT=3000 \
    pm2 start ecosystem.config.js
    echo -e "${GREEN}   ✓ Приложение и webhook сервер запущены${NC}"
else
    echo -e "${RED}   ⚠️  Файл .env.production не найден!${NC}"
    echo -e "${YELLOW}   Запускаем без переменных окружения (приложение может не работать корректно)${NC}"
    cd "$PROJECT_DIR"
    pm2 start ecosystem.config.js
fi

pm2 save

# Настройка автозапуска PM2
echo -e "${YELLOW}   Настраиваем автозапуск PM2...${NC}"
STARTUP_CMD=$(pm2 startup | grep -oP 'sudo .*' || true)
if [ ! -z "$STARTUP_CMD" ]; then
    eval "$STARTUP_CMD"
fi

# 7. Настройка Nginx и SSL
echo -e "${YELLOW}🌐 Шаг 7/7: Настройка Nginx и SSL...${NC}"

# Создаём конфигурацию Nginx
NGINX_CONF="/tmp/seyla-fit-nginx.conf"
cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name DOMAIN www.DOMAIN;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name DOMAIN www.DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Логи
    access_log /var/log/nginx/seyla-fit-access.log;
    error_log /var/log/nginx/seyla-fit-error.log;
    
    # Максимальный размер загружаемых файлов
    client_max_body_size 50M;
    
    # Проксирование на Next.js приложение
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Статические файлы
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
    
    location ~* \.(ico|jpg|jpeg|png|gif|svg|webp|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # GitHub Webhook для автоматического деплоя
    location /webhook {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-GitHub-Event $http_x_github_event;
        proxy_set_header X-Hub-Signature-256 $http_x_hub_signature_256;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}
EOF

# Заменяем DOMAIN на реальный домен
sed -i "s/DOMAIN/$DOMAIN/g" "$NGINX_CONF"

# Копируем конфигурацию
sudo cp "$NGINX_CONF" "/etc/nginx/sites-available/seyla-fit"
sudo ln -sf /etc/nginx/sites-available/seyla-fit /etc/nginx/sites-enabled/

# Удаляем default конфигурацию если есть
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Проверяем конфигурацию Nginx
if sudo nginx -t; then
    echo -e "${GREEN}   ✓ Конфигурация Nginx валидна${NC}"
else
    echo -e "${RED}   ❌ Ошибка в конфигурации Nginx${NC}"
    exit 1
fi

# Получаем SSL сертификат
if [ -z "$EMAIL" ]; then
    read -p "   Введите ваш email для SSL сертификата: " EMAIL
fi

echo -e "${YELLOW}   Получаем SSL сертификат...${NC}"
if sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect 2>/dev/null; then
    echo -e "${GREEN}   ✓ SSL сертификат получен${NC}"
else
    echo -e "${YELLOW}   ⚠️  Не удалось получить SSL сертификат автоматически${NC}"
    echo -e "${YELLOW}   Попробуйте получить вручную: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
    echo -e "${YELLOW}   Или настройте временно без SSL (не рекомендуется для продакшена)${NC}"
fi

# Перезагружаем Nginx
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}✅ Установка завершена!${NC}"
echo ""
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo "   1. Убедитесь, что DNS записи настроены на Beget:"
echo "      @       A       ваш-ip-адрес-сервера"
echo "      www     A       ваш-ip-адрес-сервера"
echo ""
echo "   2. Проверьте статус приложения:"
echo "      pm2 status"
echo "      pm2 logs seyla-fit"
echo ""
echo "   3. Откройте в браузере:"
echo "      https://$DOMAIN"
echo "      https://$DOMAIN/admin"
echo ""
echo "   4. Настройте автоматический деплой через GitHub webhook:"
echo "      См. инструкцию: deploy/WEBHOOK_SETUP.md"
echo "      Или запустите деплой вручную: bash deploy/deploy.sh"
echo ""
echo -e "${GREEN}🎉 Готово!${NC}"

