#!/bin/bash
# Скрипт для очистки места на диске (агрессивная очистка)

set -e

echo "🧹 КРИТИЧЕСКАЯ ОЧИСТКА МЕСТА НА ДИСКЕ..."

# Проверяем текущее использование
echo "📊 Текущее использование диска:"
df -h

echo ""
echo "🧹 Начинаем агрессивную очистку..."

# 1. Очищаем кеш npm/pnpm (освобождает много места)
echo "1️⃣  Очищаем pnpm/npm кеш..."
if command -v pnpm &> /dev/null; then
    pnpm store prune 2>/dev/null || true
fi
if command -v npm &> /dev/null; then
    npm cache clean --force 2>/dev/null || true
fi

# 2. Очищаем кеш Next.js
echo "2️⃣  Очищаем кеш Next.js..."
if [ -d "$HOME/seyla-fit/.next/cache" ]; then
    rm -rf "$HOME/seyla-fit/.next/cache" 2>/dev/null || true
fi

# 3. Удаляем полностью старую сборку (пересоберем потом)
echo "3️⃣  Удаляем старую сборку Next.js..."
rm -rf "$HOME/seyla-fit/.next" 2>/dev/null || true

# 4. Очищаем логи PM2
echo "4️⃣  Очищаем логи PM2..."
if command -v pm2 &> /dev/null; then
    pm2 flush 2>/dev/null || true
    rm -rf "$HOME/.pm2/logs/*" 2>/dev/null || true
fi

# 5. Очищаем временные файлы
echo "5️⃣  Очищаем временные файлы..."
sudo rm -rf /tmp/* 2>/dev/null || true
sudo rm -rf /var/tmp/* 2>/dev/null || true
rm -rf /tmp/* 2>/dev/null || true

# 6. Очищаем системные логи
echo "6️⃣  Очищаем старые системные логи..."
sudo journalctl --vacuum-time=1d 2>/dev/null || true
sudo find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true
sudo find /var/log -type f -name "*.gz" -delete 2>/dev/null || true

# 7. Очищаем кеш apt (если есть)
echo "7️⃣  Очищаем кеш apt..."
sudo apt-get clean 2>/dev/null || true
sudo apt-get autoclean 2>/dev/null || true

# 8. Находим большие файлы
echo "8️⃣  Ищем большие файлы..."
echo "   Топ 10 самых больших директорий:"
du -h --max-depth=1 "$HOME" 2>/dev/null | sort -hr | head -10 || true

# 9. Очищаем кеш TinaCMS (если есть)
echo "9️⃣  Очищаем кеш TinaCMS..."
rm -rf "$HOME/seyla-fit/tina/__generated__/.cache" 2>/dev/null || true
rm -rf "$HOME/.tinacms" 2>/dev/null || true

# 10. Очищаем node_modules кеш (опционально, но освобождает много места)
echo "🔟 Проверяем node_modules..."
if [ -d "$HOME/seyla-fit/node_modules" ]; then
    echo "   node_modules занимает:"
    du -sh "$HOME/seyla-fit/node_modules" 2>/dev/null || true
    echo "   (node_modules можно переустановить через pnpm install)"
fi

echo ""
echo "✅ Очистка завершена!"
echo ""
echo "📊 Использование диска после очистки:"
df -h

# Показываем, сколько места освободили
echo ""
echo "💡 Если места все еще мало, можно:"
echo "   1. Удалить node_modules и переустановить: rm -rf node_modules && pnpm install"
echo "   2. Увеличить диск в панели Beget"
echo "   3. Удалить ненужные файлы вручную"


