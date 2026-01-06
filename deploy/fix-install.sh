#!/bin/bash
# Скрипт для завершения установки после зависания

set -e

PROJECT_DIR="$HOME/seyla-fit"
DOMAIN="seyla-fit.ru"

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Завершение установки...${NC}"

cd "$PROJECT_DIR" || exit 1

# Проверяем свободное место на диске
echo -e "${YELLOW}💾 Проверяем свободное место на диске...${NC}"
AVAILABLE_SPACE=$(df -BG "$PROJECT_DIR" | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 2 ]; then
    echo -e "${RED}   ⚠️  Мало места на диске (${AVAILABLE_SPACE}GB свободно)${NC}"
    echo -e "${YELLOW}   Запускаем очистку...${NC}"
    if [ -f "$PROJECT_DIR/deploy/cleanup-disk.sh" ]; then
        bash "$PROJECT_DIR/deploy/cleanup-disk.sh"
    else
        echo -e "${YELLOW}   Очищаем кеши вручную...${NC}"
        pnpm store prune 2>/dev/null || true
        rm -rf "$PROJECT_DIR/.next/cache" 2>/dev/null || true
        sudo rm -rf /tmp/* 2>/dev/null || true
    fi
else
    echo -e "${GREEN}   ✓ Свободного места достаточно (${AVAILABLE_SPACE}GB)${NC}"
fi

# 1. Проверяем и генерируем админку TinaCMS
echo -e "${YELLOW}📦 Проверяем админку TinaCMS...${NC}"
if [ ! -d "public/admin" ] || [ ! -f "public/admin/index.html" ]; then
    echo -e "${YELLOW}   Админка не найдена, генерируем...${NC}"
    echo -e "${YELLOW}   Генерируем файлы TinaCMS (это нужно для админки)...${NC}"
    
    # Генерируем только файлы TinaCMS для админки (не полная сборка)
    export NODE_OPTIONS="--max-old-space-size=512"
    timeout 180 pnpm tinacms build --local --skip-indexing --skip-cloud-checks 2>&1 || {
        echo -e "${YELLOW}   ⚠️  TinaCMS build не удался, но продолжаем...${NC}"
        echo -e "${YELLOW}   Админка может не работать. Можно попробовать сгенерировать позже.${NC}"
    }
else
    echo -e "${GREEN}   ✓ Админка TinaCMS уже существует${NC}"
fi

# 2. Проверяем сборку Next.js
echo -e "${YELLOW}📦 Проверяем сборку Next.js...${NC}"
if [ ! -d ".next" ] || [ ! -d ".next/server" ]; then
    echo -e "${YELLOW}   Проект не собран или сборка неполная, собираем Next.js...${NC}"
    echo -e "${YELLOW}   Увеличиваем лимит памяти для Node.js...${NC}"
    
    # Увеличиваем лимит памяти
    export NODE_OPTIONS="--max-old-space-size=1024"
    
    # Собираем только Next.js (админка уже есть в public/admin)
    echo -e "${YELLOW}   Собираем Next.js (админка уже готова)...${NC}"
    pnpm run build-next-only || pnpm next build
    
    # Проверяем, что сборка успешна
    if [ -d ".next/server/app" ] || [ -d ".next/server/pages" ]; then
        echo -e "${GREEN}   ✓ Production build найден${NC}"
    else
        echo -e "${RED}   ⚠️  Сборка неполная${NC}"
    fi
else
    echo -e "${GREEN}   ✓ Проект уже собран${NC}"
fi

# 2. Копируем конфигурацию PM2 и webhook сервер
if [ -f "deploy/ecosystem.config.js" ]; then
    cp deploy/ecosystem.config.js ecosystem.config.js
    echo -e "${GREEN}   ✓ Конфигурация PM2 скопирована${NC}"
fi

# Копируем webhook сервер в корень (для PM2)
if [ -f "deploy/webhook-server.js" ]; then
    cp deploy/webhook-server.js webhook-server.js
    chmod +x webhook-server.js
    echo -e "${GREEN}   ✓ Webhook сервер скопирован${NC}"
fi

# 3. Создаем директорию для логов
mkdir -p logs

# 4. Запускаем приложение через PM2
echo -e "${YELLOW}🚀 Запускаем приложение...${NC}"

# Загружаем переменные окружения и запускаем PM2
if [ -f ".env.production" ]; then
    echo -e "${YELLOW}   Загружаем переменные из .env.production...${NC}"
    
    pm2 delete seyla-fit 2>/dev/null || true
    pm2 delete webhook-server 2>/dev/null || true
    
    # Загружаем переменные и экспортируем их
    set -a
    source .env.production
    set +a
    
    # Обновляем ecosystem.config.js с актуальными переменными через PM2 env
    # Или просто запускаем - ecosystem.config.js сам загрузит из .env.production
    pm2 start ecosystem.config.js --update-env
    
    echo -e "${GREEN}   ✓ Приложение запущено${NC}"
else
    echo -e "${RED}   ⚠️  Файл .env.production не найден!${NC}"
    pm2 start ecosystem.config.js
fi

pm2 save

# 5. Настраиваем Nginx
echo -e "${YELLOW}🌐 Настраиваем Nginx...${NC}"

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
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    access_log /var/log/nginx/seyla-fit-access.log;
    error_log /var/log/nginx/seyla-fit-error.log;
    
    client_max_body_size 50M;
    
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
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

sed -i "s/DOMAIN/$DOMAIN/g" "$NGINX_CONF"

# Проверяем, есть ли SSL сертификат
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}   ✓ SSL сертификат найден${NC}"
    sudo cp "$NGINX_CONF" "/etc/nginx/sites-available/seyla-fit"
else
    echo -e "${YELLOW}   ⚠️  SSL сертификат не найден, создаем временную конфигурацию без SSL${NC}"
    # Временная конфигурация без SSL
    cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name DOMAIN www.DOMAIN;
    
    access_log /var/log/nginx/seyla-fit-access.log;
    error_log /var/log/nginx/seyla-fit-error.log;
    
    client_max_body_size 50M;
    
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
    }
    
    location /webhook {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    sed -i "s/DOMAIN/$DOMAIN/g" "$NGINX_CONF"
    sudo cp "$NGINX_CONF" "/etc/nginx/sites-available/seyla-fit"
fi

# Активируем конфигурацию
sudo ln -sf /etc/nginx/sites-available/seyla-fit /etc/nginx/sites-enabled/

# Удаляем default
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Проверяем и перезагружаем Nginx
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}   ✓ Nginx настроен и перезагружен${NC}"
else
    echo -e "${RED}   ❌ Ошибка в конфигурации Nginx${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Установка завершена!${NC}"
echo ""
echo -e "${YELLOW}📊 Проверьте статус:${NC}"
pm2 status
echo ""
echo -e "${YELLOW}🌐 Проверьте сайт:${NC}"
echo "   http://$DOMAIN (или https://$DOMAIN если SSL настроен)"
echo ""
echo -e "${YELLOW}📝 Если нужно настроить SSL:${NC}"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

