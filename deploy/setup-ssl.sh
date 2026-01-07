#!/bin/bash
# Скрипт для настройки SSL сертификата
# Использование: bash deploy/setup-ssl.sh

set -e

DOMAIN="seyla-fit.ru"
EMAIL="Vlad-home10@yandex.ru"

echo "🔒 Настройка SSL сертификата для $DOMAIN..."
echo ""

# Проверяем, что certbot установлен
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot не установлен. Устанавливаем..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Проверяем, что DNS указывает на этот сервер
echo "🌐 Проверяем DNS записи..."
SERVER_IP=$(hostname -I | awk '{print $1}')
DNS_IPS=$(dig +short $DOMAIN A)

echo "   IP сервера: $SERVER_IP"
echo "   DNS записи: $DNS_IPS"
echo ""

if echo "$DNS_IPS" | grep -q "$SERVER_IP"; then
    echo "✅ DNS указывает на этот сервер"
else
    echo "⚠️  ВНИМАНИЕ: DNS может не указывать на этот сервер!"
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

# Временно настраиваем HTTP конфигурацию для получения сертификата
echo "📝 Настраиваем временную HTTP конфигурацию..."
sudo tee /etc/nginx/sites-available/seyla-fit-temp > /dev/null <<EOF
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
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF

# Активируем временную конфигурацию
sudo rm -f /etc/nginx/sites-enabled/seyla-fit
sudo ln -sf /etc/nginx/sites-available/seyla-fit-temp /etc/nginx/sites-enabled/seyla-fit-temp
sudo rm -f /etc/nginx/sites-enabled/seyla-fit-temp
sudo ln -sf /etc/nginx/sites-available/seyla-fit-temp /etc/nginx/sites-enabled/seyla-fit

# Проверяем и перезагружаем Nginx
sudo nginx -t && sudo systemctl reload nginx

# Получаем SSL сертификат
echo ""
echo "📜 Получаем SSL сертификат от Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL сертификат успешно настроен!"
    echo ""
    echo "🔍 Проверяем конфигурацию..."
    sudo nginx -t
    sudo systemctl reload nginx
    
    echo ""
    echo "✅ Готово! Теперь ваш сайт доступен по HTTPS:"
    echo "   https://$DOMAIN"
    echo "   https://www.$DOMAIN"
else
    echo ""
    echo "❌ Не удалось получить SSL сертификат"
    echo ""
    echo "Возможные причины:"
    echo "1. DNS не указывает на этот сервер"
    echo "2. Порты 80/443 заблокированы фаерволом"
    echo "3. Домен уже используется другим сервисом"
    echo ""
    echo "Проверьте логи:"
    echo "   sudo tail -f /var/log/letsencrypt/letsencrypt.log"
fi

