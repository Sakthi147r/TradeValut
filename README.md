# TradeVault — Organic Wholesale Marketplace

TradeVault is a modern B2B wholesale marketplace built with React 19, Vite, Tailwind CSS, Express, tRPC, and Shopify Storefront API.

---

## Quick Start with VS Code

### 1. Open in VS Code
Open VS Code, press `Ctrl + O` (or `File -> Open Folder...`), and select:
```
D:\TradeValut\tradevalut
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Ensure your Shopify credentials are set if testing live commerce:
* `SHOPIFY_STORE_DOMAIN`
* `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN`

*(Note: The server will still boot without Shopify or Database credentials for local UI testing and fallback).*

### 3. Run Options in VS Code

#### Option A: One-Click Run & Debug (Recommended)
1. Press `F5` (or open the **Run & Debug** panel on the left sidebar: `Ctrl + Shift + D`).
2. Select **"Dev Server (Full Stack)"** from the dropdown at the top.
3. Click the green Play button ▶️ (or press `F5`).
4. The dev server will start at:
   ```
   http://localhost:3000/
   ```

#### Option B: Integrated Terminal
Open a terminal in VS Code (`Ctrl + ~` or `Terminal -> New Terminal`):
```powershell
npm run dev
# or if you use pnpm:
pnpm dev
```

#### Option C: VS Code Task Runner
1. Press `Ctrl + Shift + P` to open the Command Palette.
2. Type `Tasks: Run Task` and press Enter.
3. Select `npm: dev` to start the development server.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the full-stack development server with Vite HMR and Express API |
| `npm run build` | Builds client static assets and bundles the server for production |
| `npm run start` | Runs the compiled production server from `dist/` |
| `npm run check` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run test` | Runs the automated Vitest test suite |
| `npm run format` | Formats all source files with Prettier |
| `npm run shopify:probe` | Probes your connected Shopify Storefront API for catalog health |
