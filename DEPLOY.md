# CLAMS deployment guide

## What you need
- A Linux server with Docker and the Docker Compose plugin installed. A small VPS with 2 GB of RAM is a reasonable start; OCR scanning is the heaviest part.
- A domain name with a DNS A record pointing at the server's IP address.
- Ports 80 and 443 open in the server firewall.

## First deploy
1. Copy the project to the server (git clone, or upload it).
2. Run `cp .env.example .env` and fill in every value:
   - DOMAIN: your domain, for example clams.example.com
   - DB_PASSWORD and DB_ROOT_PASSWORD: long random values, letters and digits only
   - JWT_SECRET: generate one with `openssl rand -hex 32`
   - CORS_ORIGINS: https:// followed by your domain
3. Run `docker compose up -d --build`. The API applies database migrations on startup. Caddy requests the HTTPS certificate automatically, so the DNS record must already point at the server.
4. Create the first administrator (the demo seed is disabled in production). The password must be 12 to 72 characters:
   `docker compose exec -e ADMIN_SCHOOL_ID=your-admin-id -e ADMIN_PASSWORD='your-long-password' api node scripts/create-admin.js`
5. Open https://your-domain and sign in with that account.

## Low-cost server setup (do once, as root)
- Add swap so builds and OCR spikes do not crash a small server: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab`
- Firewall: `ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable`
- Turn on the provider's automatic server backups (usually a small extra monthly fee) in addition to the database dump below.
- Keep the dump files off the server too, for example in a free object-storage bucket.
- Pick a server with at least 2 GB of RAM. The memory limits in docker-compose.yml assume that.

## Updating
Pull the new code, then run `docker compose up -d --build`. Database migrations run automatically on start. If only the frontend changed, `docker compose up -d --build caddy` is enough.

## Backups
Take a database dump every day and keep copies off the server. Example, run from the project folder:
`docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" clams' > clams-backup.sql`
Test a restore before you rely on it.

## Checking on it
- `docker compose ps` shows whether each service is running and healthy.
- `docker compose logs -f api` follows the API logs.
- Do not use https://your-domain/ready as an uptime check. The web server answers every path outside /api with the frontend page, so it always looks healthy.