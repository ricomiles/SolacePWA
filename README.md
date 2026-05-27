# Solace

A zero-knowledge encrypted journaling PWA. Your entries are encrypted on-device before they ever leave your phone. Nobody — not the server, not Supabase, not even the developer — can read them.

## Quick start

```bash
cp .env.example .env.local
# fill in your Supabase credentials (see below)
npm install
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

## Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**
3. Paste and run the contents of `supabase/migration.sql`
4. Copy your project URL and anon key from **Project Settings → API**
5. Add them to `.env.local`

## Vercel deployment

1. Push this repo to GitHub
2. Import it in [Vercel](https://vercel.com) — it auto-detects Vite
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Project Settings → Environment Variables**
4. Deploy

The `vercel.json` at the root already handles SPA routing rewrites.

## iOS install

Safari doesn't show PWA install prompts automatically. The app displays a one-time banner:
> "Tap Share → Add to Home Screen to install Solace"

## Encryption architecture

**Key derivation:** When you sign up, the app generates a random 12-word BIP39 mnemonic and a random 16-byte salt. It derives an AES-256 key via PBKDF2 (600,000 iterations, SHA-256) from `mnemonic + salt`. The salt is stored in Supabase; the mnemonic is shown once and then cached in IndexedDB on the device.

**Entry encryption:** Each entry is encrypted with AES-GCM using a fresh random 12-byte IV. Only the ciphertext and IV are stored in Supabase — the server never sees plaintext.

**New device:** You enter your 12-word mnemonic. The app fetches the salt from Supabase, re-derives the key, and validates it against an existing entry.

**Lock:** The "Lock journal" action in Settings wipes the cached mnemonic from IndexedDB and the key from memory. On next open, you must re-enter your phrase.

**No recovery:** If you lose your mnemonic and have no device with a cached copy, your entries are permanently inaccessible. This is by design.
