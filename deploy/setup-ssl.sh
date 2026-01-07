#!/bin/bash
# Скрипт для настройки/переустановки SSL сертификата
# Использование: bash deploy/setup-ssl.sh

set -e

DOMAIN="seyla-fit.ru"
EMAIL="Vlad-home10@yandex.ru"
NGINX_CONF="/etc/nginx/sites-available/seyla-fit"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔒 Настройка SSL сертификата для $DOMAIN...${NC}"
echo ""

# Проверяем, что certbot установлен
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}   Certbot не установлен. Устанавливаем...${NC}"
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Проверяем, что DNS указывает на этот сервер
echo -e "${YELLOW}🌐 Проверяем DNS записи...${NC}"
SERVER_IP=$(hostname -I | awk '{print $1}')
DNS_IPS=$(dig +short $DOMAIN A 2>/dev/null || echo "")

echo "   IP сервера: $SERVER_IP"
echo "   DNS записи: $DNS_IPS"
echo ""

if [ ! -z "$DNS_IPS" ] && echo "$DNS_IPS" | grep -q "$SERVER_IP"; then
    echo -e "${GREEN}   ✅ DNS указывает на этот сервер${NC}"
else
    echo -e "${YELLOW}   ⚠️  ВНИМАНИЕ: DNS может не указывать на этот сервер!${NC}"
    echo "   Убедитесь, что в DNS на Beget настроены A-записи:"
    echo "   @  →  A  →  $SERVER_IP"
    echo "   www  →  A  →  $SERVER_IP"
    echo ""
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Сохраняем текущую конфигурацию webhook, если она есть
HAS_WEBHOOK=false
if [ -f "$NGINX_CONF" ] && sudo grep -q "location /webhook" "$NGINX_CONF"; then
    HAS_WEBHOOK=true
    echo -e "${YELLOW}   📋 Сохраняем конфигурацию /webhook...${NC}"
    WEBHOOK_CONFIG=$(sudo grep -A 13 "location /webhook" "$NGINX_CONF")
fi

# Если конфигурация Nginx не существует, создаем базовую
if [ ! -f "$NGINX_CONF" ]; then
    echo -e "${YELLOW}   📝 Создаем базовую конфигурацию Nginx...${NC}"
    sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/seyla-fit
    sudo nginx -t && sudo systemctl reload nginx
fi

# Создаем резервную копию
BACKUP="${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp "$NGINX_CONF" "$BACKUP"
echo -e "${GREEN}   📋 Резервная копия: $BACKUP${NC}"

# Получаем SSL сертификат
echo ""
echo -e "${YELLOW}📜 Получаем SSL сертификат от Let's Encrypt...${NC}"
if sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect 2>&1; then
    
    echo ""
    echo -e "${GREEN}   ✅ SSL сертификат успешно получен!${NC}"
    
    # Проверяем и восстанавливаем webhook конфигурацию, если она была
    if [ "$HAS_WEBHOOK" = true ] && ! sudo grep -q "location /webhook" "$NGINX_CONF"; then
        echo -e "${YELLOW}   🔧 Восстанавливаем конфигурацию /webhook...${NC}"
        if [ -f "$(dirname "$0")/fix-webhook.sh" ]; then
            bash "$(dirname "$0")/fix-webhook.sh"
        else
            echo -e "${YELLOW}   ⚠️  Запустите fix-webhook.sh для восстановления webhook конфигурации${NC}"
        fi
    fi
    
    # Проверяем конфигурацию
    echo ""
    echo -e "${YELLOW}🔍 Проверяем конфигурацию...${NC}"
    if sudo nginx -t; then
        sudo systemctl reload nginx
        echo -e "${GREEN}   ✅ Nginx перезагружен${NC}"
    else
        echo -e "${RED}   ❌ Ошибка в конфигурации!${NC}"
        echo -e "${YELLOW}   Восстанавливаем резервную копию...${NC}"
        sudo cp "$BACKUP" "$NGINX_CONF"
        sudo nginx -t && sudo systemctl reload nginx
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✅ SSL сертификат успешно настроен!${NC}"
    echo ""
    echo "   Сайт доступен по HTTPS:"
    echo "   https://$DOMAIN"
    echo "   https://www.$DOMAIN"
    
    if [ "$HAS_WEBHOOK" = true ] && ! sudo grep -q "location /webhook" "$NGINX_CONF"; then
        echo ""
        echo -e "${YELLOW}   ⚠️  Не забудьте восстановить конфигурацию /webhook:${NC}"
        echo "   bash deploy/fix-webhook.sh"
    fi
else
    echo ""
    echo -e "${RED}❌ Не удалось получить SSL сертификат${NC}"
    echo ""
    echo "Возможные причины:"
    echo "1. DNS не указывает на этот сервер"
    echo "2. Порты 80/443 заблокированы фаерволом"
    echo "3. Домен уже используется другим сервисом"
    echo "4. Превышен лимит запросов Let's Encrypt (5 в неделю)"
    echo ""
    echo "Проверьте логи:"
    echo "   sudo tail -f /var/log/letsencrypt/letsencrypt.log"
    echo ""
    echo "Попробуйте вручную:"
    echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    exit 1
fi

