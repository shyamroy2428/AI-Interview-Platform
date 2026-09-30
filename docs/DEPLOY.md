# Deployment

Simplest: any Docker host.
```bash
docker-compose -f docker-compose.yml up -d --build
```

For production:
- put nginx / Caddy in front, terminate TLS
- swap the local Postgres for a managed instance (RDS/Neon/Supabase)
- set strong `JWT_SECRET`, restrict `CORS_ORIGINS`
- build frontend static (`npm run build`) and serve from nginx or a CDN
