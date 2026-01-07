#!/bin/bash
# Скрипт для создания/увеличения swap файла на VPS

set -e

SWAP_SIZE="6G"  # Размер swap файла (6GB для сборки Next.js с TinaCMS)

echo "📦 Проверяем и настраиваем swap файл..."

# Проверяем текущий swap
CURRENT_SWAP=$(swapon --show --noheadings --bytes 2>/dev/null | awk '{sum+=$3} END {print sum/1024/1024/1024}' || echo "0")

if [ -f /swapfile ]; then
    echo "⚠️  Swap файл уже существует"
    swapon --show
    echo ""
    
    # Проверяем размер текущего swap
    CURRENT_SIZE_GB=$(echo "$CURRENT_SWAP" | awk '{printf "%.1f", $1}')
    
    if (( $(echo "$CURRENT_SIZE_GB < 5.5" | bc -l 2>/dev/null || echo "1") )); then
        echo "📈 Текущий swap: ${CURRENT_SIZE_GB}GB, увеличиваем до 6GB..."
        
        # Отключаем текущий swap
        sudo swapoff /swapfile 2>/dev/null || true
        
        # Удаляем старый файл
        sudo rm -f /swapfile
        
        # Создаем новый swap файл 6GB
        sudo fallocate -l $SWAP_SIZE /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        
        echo "✅ Swap файл увеличен до 6GB!"
    else
        echo "✅ Swap файл уже достаточного размера (${CURRENT_SIZE_GB}GB)"
    fi
else
    echo "📦 Создаем swap файл 6GB..."
    
    # Создаем swap файл 6GB
    sudo fallocate -l $SWAP_SIZE /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    echo "✅ Swap файл создан!"
fi

# Делаем swap постоянным (добавляем в fstab)
if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap добавлен в fstab (будет активен после перезагрузки)"
fi

echo ""
echo "📊 Текущая память:"
free -h
echo ""
echo "✅ Готово! Теперь можно собирать проект."

