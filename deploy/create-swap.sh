#!/bin/bash
# Скрипт для создания swap файла на VPS

set -e

echo "📦 Создаем swap файл 2GB..."

# Проверяем, есть ли уже swap
if [ -f /swapfile ]; then
    echo "⚠️  Swap файл уже существует"
    swapon --show
    exit 0
fi

# Создаем swap файл 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Делаем swap постоянным (добавляем в fstab)
if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "✅ Swap файл создан!"
echo ""
echo "📊 Текущая память:"
free -h

