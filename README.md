# Portaria digital — deploy

App do prédio (mural de avisos, financeiro, unidades) pronto para publicar
com banco de dados real (Neon Postgres) na Vercel.

## O que já está pronto neste projeto
- `index.html` — o app inteiro (frontend), já configurado para salvar/ler
  dados via `/api/data` em vez do armazenamento do Claude.
- `api/data.js` — função serverless que lê/grava os dados no Postgres (Neon).
- `package.json` — dependência do driver do Neon.

Não é preciso build nem framework: a Vercel serve o `index.html` como
página estática e o `api/data.js` como função serverless automaticamente.

## Passo 1 — Criar o banco no Neon
1. Crie uma conta em https://neon.tech (tem plano gratuito).
2. Crie um projeto novo (qualquer nome, região `sa-east-1` se quiser mais perto do Brasil).
3. No painel do projeto, vá em **Connection Details** e copie a
   **connection string** no formato *pooled* (contém `-pooler` no nome do host).
   Algo como:
   `postgres://usuario:senha@ep-xxxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require`

Não precisa criar tabela manualmente — a função `api/data.js` cria a
tabela `predio_data` sozinha no primeiro acesso.

## Passo 2 — Subir o código para o GitHub
Dentro desta pasta:

```bash
git init
git add .
git commit -m "Portaria digital - versao inicial"
```

Depois, crie um repositório vazio no GitHub (https://github.com/new) e rode
os comandos que o próprio GitHub mostra na tela "…or push an existing
repository from the command line", algo como:

```bash
git remote add origin https://github.com/SEU-USUARIO/predio-app.git
git branch -M main
git push -u origin main
```

## Passo 3 — Deploy na Vercel
1. Crie uma conta em https://vercel.com (pode entrar direto com o GitHub).
2. Clique em **Add New → Project** e selecione o repositório que você acabou
   de subir.
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - `DATABASE_URL` = a connection string que você copiou do Neon no Passo 1.
4. Clique em **Deploy**.

Em ~1 minuto a Vercel te dá um link tipo `https://predio-app.vercel.app` —
esse é o link que você compartilha com o síndico e o financeiro. Funciona
igual no celular e no computador.

## Atualizações futuras
Sempre que eu (ou você) editar o `index.html` ou o `api/data.js`, é só:

```bash
git add .
git commit -m "descricao da mudanca"
git push
```

A Vercel publica a nova versão automaticamente a cada push.

## Observação sobre o armazenamento
Todos os dados (unidades, avisos, financeiro, fundo de obra, contas fixas)
ficam em uma única linha JSON na tabela `predio_data` do Neon — mesma lógica
que já era usada dentro do Claude, só que agora num banco de verdade que
não depende do Claude para funcionar.
