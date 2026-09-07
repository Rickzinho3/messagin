# Notificações Safadas 🔥

App Next.js pra trocar mensagens quentes com **notificações na barra de status** do celular.

## O que você precisa fazer (obrigatório pro push funcionar)

### 1. Gerar as chaves VAPID
```bash
npx web-push generate-vapid-keys
```

Vai aparecer algo assim:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib27...
Private Key: 3K7v... 
```

### 2. Colocar as chaves no código

**Arquivo 1:** `src/app/page.tsx`  
Procure por:
```ts
const VAPID_PUBLIC_KEY = "COLE_SUA_VAPID_PUBLIC_KEY_AQUI";
```
Cole a **Public Key**.

**Arquivo 2:** `src/app/api/notify/route.ts`  
Procure por:
```ts
const VAPID_PUBLIC_KEY = "COLE_SUA_VAPID_PUBLIC_KEY_AQUI";
const VAPID_PRIVATE_KEY = "COLE_SUA_VAPID_PRIVATE_KEY_AQUI";
```
Cole as duas chaves (Public + Private).

### 3. Instalar e rodar
```bash
npm install
npm run dev
```

### 4. Testar
- Abre no celular (ou Chrome)
- Entra na sala
- Quando pedir permissão de notificação → **Permitir**
- A outra pessoa faz o mesmo (mesmo código de sala)
- Manda uma mensagem → deve aparecer na barra de status

> **Importante:**  
> - Funciona melhor em HTTPS (ou localhost)  
> - No iPhone o suporte a Web Push ainda é limitado  
> - No Android + Chrome funciona bem  
> - As mensagens em memória somem se você reiniciar o servidor

## Estrutura
- `/api/notify` → backend (mensagens + push)
- `public/sw.js` → Service Worker (mostra a notificação)
- `public/manifest.json` → PWA
