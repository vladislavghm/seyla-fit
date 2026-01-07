#!/bin/bash
# Скрипт для проверки состояния сервера

echo "🔍 Проверка состояния сервера..."
echo ""

# 1. Проверка PM2
echo "1️⃣ Статус PM2:"
pm2 status
echo ""

# 2. Проверка Nginx
echo "2️⃣ Статус Nginx:"
sudo systemctl status nginx --no-pager | head -10
echo ""

# 3. Проверка порта 3000
echo "3️⃣ Проверка порта 3000:"
curl -s http://localhost:3000 | head -20 || echo "   ❌ Приложение не отвечает на порту 3000"
echo ""

# 4. Проверка конфигурации Nginx
echo "4️⃣ Конфигурация Nginx:"
sudo nginx -t
echo ""

# 5. Проверка сайтов в Nginx
echo "5️⃣ Настроенные сайты в Nginx:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "   Нет настроенных сайтов"
echo ""

# 6. Проверка конфигурации seyla-fit
if [ -f /etc/nginx/sites-enabled/seyla-fit ]; then
    echo "6️⃣ Конфигурация seyla-fit:"
    cat /etc/nginx/sites-enabled/seyla-fit | grep -E "server_name|listen|proxy_pass" | head -10
else
    echo "6️⃣ ❌ Конфигурация seyla-fit не найдена!"
fi
echo ""

# 7. Проверка DNS
echo "7️⃣ DNS записи для seyla-fit.ru:"
dig +short seyla-fit.ru A || nslookup seyla-fit.ru || echo "   Не удалось проверить DNS"
echo ""

echo "✅ Проверка завершена"

