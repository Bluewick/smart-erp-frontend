# SmartERP — Frontend

SmartERP is a web-based business management application with a Tally-inspired accounting and inventory workflow. This repository contains the **React frontend**. It connects to a separate REST API for authentication, company data, ledgers, stock items, vouchers, and reports.

- **Live application:** [smart-erp-mu.vercel.app](https://smart-erp-mu.vercel.app/)
- **Frontend repository:** [Bluewick/smart-erp-frontend](https://github.com/Bluewick/smart-erp-frontend)

> **Project status:** The application is under active development. The current frontend covers company setup, master data, purchase/sales voucher entry, inventory summaries, and profit-and-loss reporting. Some additional accounting options shown in the workspace menu are placeholders and may not yet be connected to functional screens.

## Features

### Authentication and company workspace

- User registration and login.
- JWT-based authenticated sessions.
- Protected application routes.
- Create, view, and edit company records.
- Company-specific workspace and navigation.
- Company settings for address, contact details, currency, and financial-year dates.

### Accounting and master data

- Create and edit accounting ledgers.
- Configure ledger groups, opening balances, credit settings, and relevant tax details.
- Create and edit stock items.
- Maintain stock item units, HSN/SAC information, GST settings, and opening stock details.
- Create and edit measurement units, including common unit presets.

### Vouchers and invoices

- Create purchase vouchers and sales vouchers.
- Select parties, account ledgers, and stock items from company records.
- Add or remove item rows dynamically.
- Calculate line amounts and voucher totals from quantity and rate.
- Print an invoice.
- Export invoice data to an Excel workbook.

### Reports

- Stock summary with quantity and value totals.
- Monthly stock movement summary for an individual item.
- Profit-and-loss view based on company financial data.

### Keyboard-first navigation

The workspace includes keyboard navigation and shortcuts inspired by desktop accounting software.

| Shortcut | Action |
| --- | --- |
| `C` | Open master creation |
| `A` | Open master alteration |
| `V` | Open vouchers |
| `P` | Open Profit & Loss |
| `S` | Open Stock Summary |
| `Q` | Return to the company list |
| `Alt + L` | Create a ledger |
| `Alt + A` | Open ledger alteration/list |
| `Alt + S` | Create a stock item |
| `Alt + U` | Create a unit |
| `F8` | Switch to Sales Voucher |
| `F9` | Switch to Purchase Voucher |
| `Esc` | Return to the company workspace |
| `Ctrl + Alt + P` | Print the invoice |
| `Ctrl + Alt + E` | Export the invoice to Excel |

Some shortcuts are context-specific and only work on the relevant screen.

## Tech stack

| Area | Technology |
| --- | --- |
| UI library | React 19 |
| Build tool and dev server | Vite 8 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Authentication token decoding | `jwt-decode` |
| Spreadsheet generation | ExcelJS |
| Linting | Oxlint |
| Language | JavaScript (ES modules) |

## Getting started

### Prerequisites

- Node.js and npm.
- Access to a running SmartERP backend API.

### 1. Clone the repository

```bash
git clone https://github.com/Bluewick/smart-erp-frontend.git
cd smart-erp-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend URL

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:5210
```

Set the value to the **base URL of your backend server**. Do not append `/api` to this value; the frontend adds the relevant `/api/...` paths when making requests.

For example, if the backend is deployed, use its public base URL:

```env
VITE_API_URL=https://your-backend-domain.example
```

Restart the Vite development server after changing environment variables. Vite exposes `VITE_` variables to frontend code, so do not put private API keys, database credentials, or other secrets in this file.

### 4. Start the development server

```bash
npm run dev
```

Vite starts the local development server (normally at [http://localhost:5173](http://localhost:5173)) and opens the app in your browser.

The backend must be running and configured to accept requests from the frontend's local origin. If requests fail in the browser, check the API URL, backend availability, and backend CORS configuration.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run Oxlint on the project. |

To verify a production build locally:

```bash
npm run build
npm run preview
```

## Application routes

The following routes are registered by the frontend router:

| Route | Screen |
| --- | --- |
| `/login` | User login |
| `/signup` | User registration |
| `/companies` | Company list and selection |
| `/companies/create` | Create a company |
| `/companies/edit/:id` | Edit a company |
| `/:companyId/gateway` | Company workspace |
| `/:companyId/ledger/create` | Create a ledger |
| `/:companyId/ledger/alter/:ledgerId` | Edit a ledger |
| `/:companyId/stock-item/create` | Create a stock item |
| `/:companyId/stock-item/alter/:itemId` | Edit a stock item |
| `/:companyId/unit/create` | Create a measurement unit |
| `/:companyId/unit/alter/:unitId` | Edit a measurement unit |
| `/:companyId/voucher/purchase` | Purchase and sales voucher entry |
| `/:companyId/stock-summary` | Stock summary |
| `/:companyId/stock-item-monthly-summary/:itemId` | Monthly summary for a stock item |
| `/:companyId/pnl` | Profit-and-loss report |

Company-specific routes are protected and require an authenticated session.

## Backend integration

The frontend communicates with the backend using HTTP `fetch` requests. Authenticated requests send the JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

The main API areas used by the frontend include:

| API path | Purpose |
| --- | --- |
| `POST /api/auth/signup` | Register a user |
| `POST /api/auth/login` | Authenticate a user |
| `/api/companies` | List, create, read, and update companies |
| `/api/:companyId/ledgers` | Read and manage company ledgers |
| `/api/:companyId/stock-items` | Read and manage stock items |
| `/api/:companyId/units` | Read and manage measurement units |
| `POST /api/:companyId/vouchers/purchase` | Save a purchase voucher |
| `POST /api/:companyId/vouchers/sales` | Save a sales voucher |
| `GET /api/:companyId/profit-loss` | Retrieve profit-and-loss data |
| `GET /api/:companyId/stock-items/:itemId/monthly-summary` | Retrieve monthly stock summary data |

The exact request and response contracts are defined by the backend API. Ensure the backend is running and its routes match the paths expected by this frontend.

## Project structure

```text
smart-erp-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared UI components and company list views
│   ├── contexts/           # React context, including authentication state
│   ├── modals/             # Master and record-selection dialogs
│   ├── pages/              # Application screens
│   ├── App.jsx             # Route configuration and route guards
│   ├── main.jsx            # React application entry point
│   └── index.css           # Global styles and Tailwind import
├── .env.local              # Local environment configuration (create locally)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Authentication notes

- The authentication context reads the JWT from browser `localStorage` using the key `authToken`.
- The token is decoded on the client to populate the current user context.
- Protected routes check for an available token before rendering company screens.
- Logging out removes the stored token.

Because the current implementation stores the token in `localStorage`, review the authentication and browser security requirements before using the application with production accounts or sensitive business data.

## Deployment

The frontend is deployed on Vercel:

[https://smart-erp-mu.vercel.app](https://smart-erp-mu.vercel.app)

For a Vercel deployment, configure `VITE_API_URL` in the project's Environment Variables for the relevant deployment environments, then redeploy so the value is included in the frontend build. The configured backend must allow requests from the deployed frontend origin.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Run `npm run lint` and `npm run build`.
5. Open a pull request with a clear description of the changes.

## License

No license is currently specified in this repository. Contact the repository owner before redistributing or using the code outside the permissions granted by the owner.
