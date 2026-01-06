#!/usr/bin/env node
/**
 * GitHub Webhook сервер для автоматического деплоя
 * Принимает webhook от GitHub и автоматически запускает deploy.sh
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || ''; // Секрет для проверки подлинности webhook
const PROJECT_DIR = process.env.PROJECT_DIR || path.join(require('os').homedir(), 'seyla-fit');
const DEPLOY_SCRIPT = path.join(PROJECT_DIR, 'deploy', 'deploy.sh');

// Логирование
const logFile = path.join(PROJECT_DIR, 'logs', 'webhook.log');
const logDir = path.dirname(logFile);

// Создаем директорию для логов если её нет
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(logFile, logMessage);
}

function verifySignature(payload, signature) {
    if (!SECRET) {
        log('WARNING: WEBHOOK_SECRET not set, skipping signature verification');
        return true; // Если секрет не установлен, пропускаем проверку
    }
    
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

function runDeploy(callback) {
    log('Starting deployment...');
    
    exec(`bash ${DEPLOY_SCRIPT}`, {
        cwd: PROJECT_DIR,
        env: {
            ...process.env,
            PATH: process.env.PATH
        }
    }, (error, stdout, stderr) => {
        if (error) {
            log(`Deployment error: ${error.message}`);
            callback(error);
            return;
        }
        
        log('Deployment completed successfully');
        log(`STDOUT: ${stdout}`);
        if (stderr) {
            log(`STDERR: ${stderr}`);
        }
        callback(null, stdout);
    });
}

const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    if (req.url !== '/webhook') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
    }

    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
        
        if (!verifySignature(body, signature)) {
            log('Invalid signature');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid signature' }));
            return;
        }

        try {
            const payload = JSON.parse(body);
            const event = req.headers['x-github-event'];
            
            log(`Received ${event} event for ${payload.repository?.full_name || 'unknown'}`);
            
            // Обрабатываем только push события в ветку main/master
            if (event === 'push') {
                const ref = payload.ref || '';
                const branch = ref.split('/').pop();
                
                if (branch === 'main' || branch === 'master') {
                    log(`Push to ${branch} detected, triggering deployment...`);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        message: 'Deployment triggered',
                        branch: branch
                    }));
                    
                    // Запускаем деплой асинхронно
                    runDeploy((error) => {
                        if (error) {
                            log(`Deployment failed: ${error.message}`);
                        }
                    });
                } else {
                    log(`Push to ${branch} ignored (not main/master)`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        message: 'Branch ignored',
                        branch: branch
                    }));
                }
            } else {
                log(`Event ${event} ignored`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Event ignored', event: event }));
            }
        } catch (error) {
            log(`Error processing webhook: ${error.message}`);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid payload' }));
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    log(`Webhook server listening on http://127.0.0.1:${PORT}/webhook`);
    log(`PROJECT_DIR: ${PROJECT_DIR}`);
    log(`DEPLOY_SCRIPT: ${DEPLOY_SCRIPT}`);
});

// Обработка ошибок
server.on('error', (error) => {
    log(`Server error: ${error.message}`);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        log('Server closed');
        process.exit(0);
    });
});

