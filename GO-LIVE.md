# Going live: the new Ospreyn site on ospreyn.com

This replaces the earlier Ospreyn platform (the version with accounts, a database and payments) with the new Ospreyn policy site.

Do the steps in order. Menu names on GitHub, Netlify and Paystack change over time, so follow their current documentation where the wording here differs.

## Part 1: Retire Ospreyn safely

Ospreyn holds other people's information: names, emails, phone numbers, IP addresses, song records, confirmation records and uploaded documents. Turning it off carelessly can hurt the people who used it, so do this part before anything else.

1. **Tell your users.** Email everyone with an account and every contributor with a pending invitation. Give a shutdown date and a window (two to four weeks is reasonable) to export their records. People may need their confirmed splits as evidence later.
2. **Offer an export.** The platform already has a per-song evidence export. Make sure users know how to get it, or send exports yourself on request.
3. **Cancel paid subscriptions first.** In Paystack, cancel every active subscription before you switch off the server. Customers keep getting charged for a service that no longer exists if you skip this.
4. **Decide what to do with the data.** After the export window, delete the database and the storage bucket, or keep a secured copy for the period you are legally required to. You hold personal information, so check your obligations under POPIA, ideally with a lawyer, before deleting or keeping it.
5. **Shut down the services.** Stop the API host, the Postgres database, the storage bucket, and the email and WhatsApp accounts. Revoke the API keys (Paystack, Twilio, email provider, storage) so they cannot be used if they leak.
6. **Keep the code, not the running system.** In GitHub, make the Ospreyn repository private and archive it (Settings, then Archive this repository). Archiving keeps your work without leaving it online. Do not delete it unless you are certain.

## Part 2: Put the new site on GitHub

Recommended: use a **new repository** (for example `ospreyn-site`) rather than overwriting the Ospreyn one. Nothing can be lost that way.

1. Create a new empty repository on GitHub.
2. Unzip `the project zip`, open the folder in a terminal and run:

```bash
git init
git add .
git commit -m "Ospreyn"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

3. Open `public/admin/config.yml` and change `repo:` to `YOUR-USERNAME/YOUR-REPOSITORY`, and check that the two `site_url` lines say `https://ospreyn.com`. Commit and push.

## Part 3: Deploy on Netlify (you already host Ospreyn there)

**Option A, recommended: relink your existing Netlify site to the new repository.** Your domain, DNS and HTTPS certificate stay exactly as they are, so there is nothing to move.

1. Make sure Part 1 is done, because the old Ospreyn front end disappears from your domain when the new site is published.
2. In Netlify, open your Ospreyn site, then **Project configuration, Build & deploy, Continuous deployment, Repository**. Select **Manage repository**, then **Link to a different repository**, and pick the new repository. Netlify may ask you to give its GitHub app access to the new repository.
3. **Check the build settings.** The command should be `npm run build` and the publish folder `dist`. These are also set in `netlify.toml`, which pins Node 22 because the project's build tool (Vite 8) needs Node 20.19 or newer.
4. **Remove the old Ospreyn environment variables** (Project configuration, Environment variables). Netlify does not clear them when you change the repository, and the new site needs none of them. Delete anything for the old API address, Paystack, Twilio, storage or email. Also delete any `NODE_VERSION` variable set to an old version, because it would override the one in `netlify.toml`.
5. **Preview before it goes public (optional).** On the site's Deploys page, use **Stop auto publishing**. The next build then runs but is not published, so you can open that deploy's own preview address, check it and publish it when happy.
6. Trigger a deploy (or push a commit) and open your domain to confirm the new site is live. Check `/admin` loads, and that a deep link such as `/indicators/gdp` works when you open it directly.

**Option B: create a new Netlify site** from the new repository and move the domain. In the old site, remove the custom domain first, because Netlify will not let two sites use it at once. Then add it to the new site. If your DNS is hosted elsewhere, point your records at the new site's Netlify address. This route gives a short gap while the certificate is reissued.

## Part 4: Turn on the admin page

Sveltia CMS signs in through GitHub, so only people with write access to your repository can edit. Turn on two-factor authentication on your GitHub account first.

**Simplest option (one user): personal access token.** In GitHub, create a fine-grained personal access token limited to this one repository, with permission to read and write repository contents. Open `/admin`, choose to sign in with a token, and paste it. Keep the token private and set an expiry date.

**Alternative: GitHub sign-in button.** On Netlify you can use its built-in OAuth client. Create a GitHub OAuth application, then add its client ID and secret in your Netlify site's access and security settings, following Netlify's current instructions for the GitHub backend.

## Part 5: First edits

1. Open `/admin` and sign in.
2. Open **Data, then Repo rate** and confirm the most recent decisions are right.
3. Work through section 3 of `VERIFY.md` and correct anything that does not match the source.
4. Write your first article, add its sources and publish it.
5. Edit the overview text after you have read the October 2026 mid-term budget.

## Security notes

- Never put passwords, tokens or API keys in this repository.
- The admin page only edits content files, so it cannot expose a database or server.
- Every change is a commit, so you can undo any edit from the GitHub history.
- The site is public, but only people you give GitHub write access to can change it.
