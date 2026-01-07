#!/bin/bash
# Скрипт для диагностики использования памяти

echo "📊 ДИАГНОСТИКА ПАМЯТИ СЕРВЕРА"
echo "================================"
echo ""

echo "1️⃣ Общая информация о памяти:"
free -h
echo ""

echo "2️⃣ Swap файл:"
swapon --show
echo ""

echo "3️⃣ Процессы Node.js (если есть):"
ps aux | grep -E "node|next|tinacms" | grep -v grep || echo "   Нет процессов Node.js"
echo ""

echo "4️⃣ Топ 10 процессов по использованию памяти:"
ps aux --sort=-%mem | head -11
echo ""

echo "5️⃣ Использование диска:"
df -h
echo ""

echo "6️⃣ Кеши в проекте:"
if [ -d "$HOME/seyla-fit" ]; then
    cd "$HOME/seyla-fit"
    echo "   .next: $(du -sh .next 2>/dev/null || echo 'не существует')"
    echo "   node_modules/.cache: $(du -sh node_modules/.cache 2>/dev/null || echo 'не существует')"
    echo "   tina/__generated__: $(du -sh tina/__generated__ 2>/dev/null || echo 'не существует')"
fi
echo ""

echo "7️⃣ Системные кеши:"
echo "   PageCache: $(cat /proc/meminfo | grep -i 'cached:' | awk '{print $2/1024/1024 " GB"}')"
echo "   Buffers: $(cat /proc/meminfo | grep -i 'buffers:' | awk '{print $2/1024/1024 " GB"}')"
echo ""

echo "✅ Диагностика завершена"

