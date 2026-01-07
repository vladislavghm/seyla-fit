#!/bin/bash
# Простой скрипт для добавления конфигурации /webhook в Nginx

NGINX_AVAILABLE="/etc/nginx/sites-available/seyla-fit"
NGINX_ENABLED="/etc/nginx/sites-enabled/seyla-fit"

# Определяем, какой файл использовать (если sites-enabled - симлинк, используем исходный файл)
if [ -L "$NGINX_ENABLED" ]; then
    # Если это симлинк, получаем реальный путь
    REAL_PATH=$(sudo readlink -f "$NGINX_ENABLED")
    NGINX_CONF="$REAL_PATH"
elif [ -f "$NGINX_ENABLED" ] && [ ! -f "$NGINX_AVAILABLE" ]; then
    # Если файл есть только в sites-enabled (редкий случай)
    NGINX_CONF="$NGINX_ENABLED"
else
    # По умолчанию используем sites-available
    NGINX_CONF="$NGINX_AVAILABLE"
fi

if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Файл конфигурации не найден: $NGINX_CONF"
    exit 1
fi

if sudo grep -q "location /webhook" "$NGINX_CONF"; then
    echo "✅ Конфигурация /webhook уже присутствует в $NGINX_CONF"
    # Проверяем, что симлинк правильный
    if [ -L "$NGINX_ENABLED" ]; then
        REAL_PATH=$(sudo readlink -f "$NGINX_ENABLED")
        if [ "$REAL_PATH" != "$NGINX_AVAILABLE" ]; then
            echo "⚠️  Предупреждение: sites-enabled указывает на другой файл: $REAL_PATH"
        fi
    fi
    # Все равно проверяем конфигурацию и перезагружаем
    if sudo nginx -t > /dev/null 2>&1; then
        sudo systemctl reload nginx
        echo "✅ Nginx перезагружен"
    fi
    exit 0
fi

BACKUP="${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp "$NGINX_CONF" "$BACKUP"
echo "📋 Резервная копия: $BACKUP"

# Добавляем конфигурацию перед последней закрывающей скобкой блока server
sudo python3 << EOF
import sys

nginx_conf = "$NGINX_CONF"

webhook_config = """    # GitHub Webhook для автоматического деплоя
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
"""

try:
    with open(nginx_conf, 'r') as f:
        content = f.read()
    
    # Находим последнюю закрывающую скобку перед концом server блока
    # Ищем позицию перед последней строкой "}"
    lines = content.split('\n')
    
    # Находим последний location блок
    last_loc_idx = -1
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip().startswith('location'):
            last_loc_idx = i
            break
    
    # Находим конец последнего location блока
    insert_pos = len(lines) - 1
    if last_loc_idx >= 0:
        # Ищем закрывающую скобку location блока
        brace_count = 0
        for i in range(last_loc_idx, len(lines)):
            line = lines[i]
            brace_count += line.count('{') - line.count('}')
            if brace_count == 0 and '}' in line:
                insert_pos = i + 1
                break
    
    # Вставляем конфигурацию
    lines.insert(insert_pos, webhook_config.rstrip())
    
    with open(nginx_conf, 'w') as f:
        f.write('\n'.join(lines))
    
    print("✅ Конфигурация добавлена")
    sys.exit(0)
except Exception as e:
    print(f"❌ Ошибка: {e}")
    sys.exit(1)
EOF

if [ $? -eq 0 ] && sudo nginx -t > /dev/null 2>&1; then
    sudo systemctl reload nginx
    echo "✅ Nginx перезагружен"
    echo "✅ Готово!"
else
    echo "❌ Ошибка! Восстанавливаем резервную копию..."
    sudo cp "$BACKUP" "$NGINX_CONF"
    echo "Пожалуйста, добавьте конфигурацию вручную"
    exit 1
fi

