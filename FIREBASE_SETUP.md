# Firebase setup (10 minutes, free plan is enough)

Until you do this the website runs in **DEMO mode** (everything saved only in your own browser).
After this, real visitors are saved, and your admin changes go live for everyone.

## 1. Create the project
1. Open https://console.firebase.google.com → **Add project** → name it (e.g. `fundedx`). Analytics: off.

## 2. Turn on login
1. **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Google** (choose your support email) and **Email/Password**.
3. **Settings → Authorized domains** → **Add domain** → your Vercel domain (e.g. `your-site.vercel.app`) and your own domain later. `localhost` is already there.

## 3. Create the database
1. **Build → Firestore Database → Create database** → Production mode → pick a region near your users.
2. **Rules** tab → paste the contents of `firestore.rules` → replace `YOUR_ADMIN_EMAIL@gmail.com` with your admin Gmail → **Publish**.

## 4. Get the web keys
1. **Project settings (gear) → General → Your apps → Web (`</>`)** → register an app → copy the `firebaseConfig` values.

## 5. Add them to Vercel
Vercel → your project → **Settings → Environment Variables**, add (all environments):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |
| `NEXT_PUBLIC_ADMIN_EMAILS` | your admin Gmail (comma separated for more than one) |

Then **Deployments → ⋯ → Redeploy**.

## 6. Use it
- Log in with Google using the admin Gmail → open `https://your-site.vercel.app/admin`.
- Change prices → **Save changes** → refresh the homepage.

## Security notes
- The Firebase web keys above are public by design. Real protection is `firestore.rules`.
- Never put a **service account / private key JSON** in this project or share it with anyone.
- Admin access is decided by the email in `firestore.rules` (server side) AND `NEXT_PUBLIC_ADMIN_EMAILS` (only hides the page in the UI). Both must contain your email.
- Order prices are recorded from the browser for now. When you connect a payment gateway, recompute the price on the server from your saved plan config.
