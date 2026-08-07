# 🚀 DropHub — Hub de Automação de Dropshipping Cross-Border

Sistema full-stack que automatiza o ciclo completo de **dropshipping cross-border** conectando AliExpress (fornecedor) com Mercado Livre e Shopee (canais de venda brasileiros).

## ✨ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Autenticação** | JWT local + OAuth2 para Mercado Livre e Shopee |
| **PIM (Produtos)** | Importação do AliExpress, edição de preços/margem, publicação automática em ML e Shopee |
| **Auto-Fulfillment** | Webhooks escutam vendas → cria pedido automático no AliExpress |
| **Rastreamento** | Cron job busca tracking no AliExpress → injeta no ML e Shopee |
| **Dashboard** | KPIs, gráficos de faturamento, pedidos recentes, status das integrações |

## 🏗️ Arquitetura

```
Frontend (React + Vite)  ←→  Backend (Express + Prisma/SQLite)
                                    ↕
                    AliExpress / Mercado Livre / Shopee APIs
```

## 📋 Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9

## 🚀 Instalação Rápida

```bash
# 1. Clone e entre no diretório
cd erp

# 2. Copie o arquivo de ambiente
copy .env.example .env

# 3. Edite o .env com suas credenciais de API

# 4. Instale tudo e configure o banco
cd backend
npm install
copy ..\.env .env
npx prisma generate
npx prisma migrate dev --name init
cd ../frontend
npm install
cd ..
```

## ▶️ Executando

```bash
# Backend (porta 3001)
cd backend
npm run dev

# Frontend (porta 5173)  — em outro terminal
cd frontend
npm run dev
```

Ou use o comando raiz:
```bash
npm install          # instala concurrently
npm run dev          # roda backend + frontend juntos
```

Acesse: **http://localhost:5173**

## 🔑 Configuração das APIs

### AliExpress Open Platform
1. Acesse [AliExpress Open Platform](https://openservice.aliexpress.com/)
2. Crie um App e obtenha AppKey + AppSecret
3. Cole no painel Settings do DropHub ou no `.env`

### Mercado Livre
1. Acesse [Mercado Livre Developers](https://developers.mercadolivre.com.br/)
2. Crie uma aplicação com redirect URI: `https://allydigitalpartners.com/api/auth/mercadolivre/callback`
3. Cole Client ID e Client Secret no `.env`
4. Clique em "Conectar" na tela de Settings do DropHub

### Shopee Open Platform
1. Acesse [Shopee Open Platform](https://open.shopee.com/)
2. Crie um App com callback URL: `https://allydigitalpartners.com/api/auth/shopee/callback`
3. Cole Partner ID e Partner Key no `.env`
4. Clique em "Conectar" na tela de Settings do DropHub

## 📁 Estrutura de Pastas

```
erp/
├── .env.example              # Template de variáveis de ambiente
├── package.json              # Scripts raiz (dev, build, setup)
├── backend/
│   ├── prisma/               # Schema + migrations SQLite
│   ├── src/
│   │   ├── config/           # Validação de env com Zod
│   │   ├── shared/           # Types, utils, middleware JWT
│   │   ├── modules/
│   │   │   ├── auth/         # JWT + OAuth2 ML/Shopee
│   │   │   ├── aliexpress/   # SDK AliExpress (HMAC-MD5)
│   │   │   ├── mercadolivre/ # SDK Mercado Livre
│   │   │   ├── shopee/       # SDK Shopee (HMAC-SHA256)
│   │   │   ├── products/     # CRUD + import + publish + sync
│   │   │   ├── orders/       # CRUD + auto-fulfillment
│   │   │   ├── tracking/     # Tracking sync service
│   │   │   ├── webhooks/     # Handlers ML + Shopee
│   │   │   └── dashboard/    # Stats + charts data
│   │   ├── jobs/             # node-cron scheduler
│   │   └── server.ts         # Express entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/              # Axios clients tipados
    │   ├── components/       # UI: Sidebar, Header, Card, Button, Modal...
    │   ├── pages/            # Dashboard, Products, Orders, Tracking, Settings
    │   ├── store/            # Zustand (auth, ui)
    │   └── styles/           # Design system CSS (dark theme)
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

## 🔄 Cron Jobs Automáticos

| Job | Intervalo | Descrição |
|-----|-----------|-----------|
| Product Sync | 1h | Atualiza preço/estoque do AliExpress → ML e Shopee |
| Tracking Sync | 30min | Busca tracking no AliExpress → injeta em ML e Shopee |
| Token Refresh | 4h | Renova access tokens do ML e Shopee |

## 📡 Webhooks (URLs para configurar nos Marketplaces)

- **Mercado Livre**: `https://allydigitalpartners.com/api/webhooks/mercadolivre`
- **Shopee**: `https://allydigitalpartners.com/api/webhooks/shopee`

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Recharts + Zustand
- **Backend**: Node.js + Express + TypeScript + Prisma + SQLite
- **Estilo**: CSS puro com design system (dark theme, glassmorphism)
- **Jobs**: node-cron
- **Auth**: JWT + OAuth2

---

Desenvolvido para **Ally Digital Partners** 🇧🇷
