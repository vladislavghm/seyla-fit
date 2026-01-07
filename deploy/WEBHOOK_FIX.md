# Исправление конфигурации webhook в Nginx

Если автоматический скрипт не сработал, добавьте конфигурацию вручную:

## Шаг 1: Найдите файл конфигурации

```bash
sudo readlink -f /etc/nginx/sites-enabled/seyla-fit
```

Обычно это `/etc/nginx/sites-available/seyla-fit-temp` или `/etc/nginx/sites-available/seyla-fit`

## Шаг 2: Откройте файл для редактирования

```bash
sudo nano /etc/nginx/sites-available/seyla-fit-temp
```

(или тот файл, который показала команда выше)

## Шаг 3: Найдите блок server с `listen 443`

Найдите строку:

```nginx
server {
    listen 443 ssl http2;
```

## Шаг 4: Добавьте конфигурацию webhook

Найдите последний `location` блок перед закрывающей скобкой `}` блока `server` и добавьте перед ней:

```nginx
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
```

**Важно:** Конфигурация должна быть внутри блока `server { ... }` с `listen 443`, перед его последней закрывающей скобкой `}`.

## Шаг 5: Проверьте и перезагрузите

```bash
# Проверка конфигурации
sudo nginx -t

# Если проверка прошла успешно, перезагрузите Nginx
sudo systemctl reload nginx
```

## Шаг 6: Проверьте работу

```bash
bash deploy/check-webhook.sh
```

Или проверьте в GitHub: Settings → Webhooks → Recent Deliveries
