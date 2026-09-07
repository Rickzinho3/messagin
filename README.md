# Private Signal

Aplicação Next.js para mensagens privadas entre duas pessoas, com persistência no Supabase e notificações push pelo OneSignal.

## Configuração

1. No Supabase, abra o SQL Editor e execute [`supabase/schema.sql`](supabase/schema.sql).
2. Na Vercel, adicione estas variáveis:

```env
NEXT_PUBLIC_ONESIGNAL_APP_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ONESIGNAL_REST_API_KEY=
```

3. No OneSignal, configure o app Web com o domínio publicado na Vercel.
4. Faça redeploy na Vercel depois de cadastrar as variáveis.

`SUPABASE_SERVICE_ROLE_KEY` e `ONESIGNAL_REST_API_KEY` são secrets de servidor. Nunca os exponha no frontend ou no GitHub.

## Desenvolvimento

```bash
npm install
npm run dev
```

O fluxo é dividido em entrada, sala, compositor e caixa de entrada. A sessão de nome e sala fica no navegador; as mensagens ficam no Supabase.
