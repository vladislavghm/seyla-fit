# Скрипт для генерации админки локально и загрузки на сервер
# Использование: .\deploy\upload-admin.ps1

Write-Host "🔧 Генерация админки TinaCMS локально..." -ForegroundColor Yellow

# Проверяем переменные окружения
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Файл .env.local не найден!" -ForegroundColor Red
    Write-Host "Создайте .env.local с переменными TinaCMS" -ForegroundColor Yellow
    exit 1
}

# Генерируем админку
Write-Host "📦 Генерируем админку..." -ForegroundColor Yellow
pnpm tinacms build

if (-not (Test-Path "public\admin\index.html")) {
    Write-Host "❌ Ошибка: админка не сгенерирована" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Админка сгенерирована!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Загружаем админку на сервер..." -ForegroundColor Yellow

# Загружаем на сервер
scp -r public/admin vladhoyl@155.212.188.120:~/seyla-fit/public/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Админка успешно загружена на сервер!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Теперь на сервере выполните:" -ForegroundColor Yellow
    Write-Host "   pm2 restart seyla-fit" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Админка будет доступна по адресу:" -ForegroundColor Green
    Write-Host "   https://seyla-fit.ru/admin" -ForegroundColor Cyan
} else {
    Write-Host "❌ Ошибка при загрузке на сервер" -ForegroundColor Red
    exit 1
}

