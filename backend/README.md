# Minha Saúde Feminina - API Backend

API REST Laravel para o sistema de gestão de artigos.

## Requisitos

- PHP 8.2+
- Composer 2.x
- Extensão PHP SQLite (pdo_sqlite)

## Instalação

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
```

## Executar

```bash
php artisan serve
```

A API estará disponível em `http://localhost:8000`.

## Banco de Dados

O projeto utiliza SQLite por padrão. O arquivo do banco está em `database/database.sqlite`.

## Verificar Saúde da API

```
GET http://localhost:8000/api/health
```

Resposta esperada: `{"status": "ok"}`
