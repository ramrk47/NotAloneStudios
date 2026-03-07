# Maulya Migration Guide (Domain & Rebrand)

This document contains the release engineer instructions for executing the Domain Migration and Rebrand from ZenOps to Maulya on your deployment infrastructure.

## 1. DNS Configuration Updates

You must configure the following A Records on your DNS provider to point to your VPS IP:
- `A maulya.in -> [VPS_IP]`
- `A app.maulya.in -> [VPS_IP]`
- `A demo.maulya.in -> [VPS_IP]`

*(Ensure `zenops.notalonestudios.com` and `demo.zenops.notalonestudios.com` records remain intact to handle the 301 redirects.)*

## 2. Docker Compose & Traefik Updates

Update your `docker-compose.yml` (or Traefik dynamic configuration) to add the new routers and configure the 301 legacy redirects. 

### A. New App & Demo Routers

**App (Pilot) Router:**
```yaml
labels:
  - "traefik.http.routers.app-maulya.rule=Host(`app.maulya.in`)"
  - "traefik.http.routers.app-maulya.entrypoints=websecure"
  - "traefik.http.routers.app-maulya.tls=true"
  - "traefik.http.routers.app-maulya.tls.certresolver=YOUR_RESOLVER"
  - "traefik.http.routers.app-maulya.service=YOUR_APP_SERVICE"
```

**Demo Router:**
```yaml
labels:
  - "traefik.http.routers.demo-maulya.rule=Host(`demo.maulya.in`)"
  - "traefik.http.routers.demo-maulya.entrypoints=websecure"
  - "traefik.http.routers.demo-maulya.tls=true"
  - "traefik.http.routers.demo-maulya.tls.certresolver=YOUR_RESOLVER"
  - "traefik.http.routers.demo-maulya.service=YOUR_DEMO_SERVICE"
```

### B. Legacy Host 301 Web Redirect Rules (RedirectRegex)

Create these specific routers to permanently redirect old traffic to the new domains, preserving paths:

**ZenOps -> Maulya App Redirect:**
```yaml
labels:
  - "traefik.http.routers.zenops-legacy.rule=Host(`zenops.notalonestudios.com`)"
  - "traefik.http.routers.zenops-legacy.entrypoints=websecure"
  - "traefik.http.routers.zenops-legacy.tls=true"
  - "traefik.http.routers.zenops-legacy.middlewares=zenops-to-maulya"
  - "traefik.http.middlewares.zenops-to-maulya.redirectregex.regex=^https?://zenops\.notalonestudios\.com(.*)"
  - "traefik.http.middlewares.zenops-to-maulya.redirectregex.replacement=https://app.maulya.in$${1}"
  - "traefik.http.middlewares.zenops-to-maulya.redirectregex.permanent=true"
```

**Demo ZenOps -> Demo Maulya Redirect:**
```yaml
labels:
  - "traefik.http.routers.zenops-demo-legacy.rule=Host(`demo.zenops.notalonestudios.com`)"
  - "traefik.http.routers.zenops-demo-legacy.entrypoints=websecure"
  - "traefik.http.routers.zenops-demo-legacy.tls=true"
  - "traefik.http.routers.zenops-demo-legacy.middlewares=zenops-demo-to-maulya"
  - "traefik.http.middlewares.zenops-demo-to-maulya.redirectregex.regex=^https?://demo\.zenops\.notalonestudios\.com(.*)"
  - "traefik.http.middlewares.zenops-demo-to-maulya.redirectregex.replacement=https://demo.maulya.in$${1}"
  - "traefik.http.middlewares.zenops-demo-to-maulya.redirectregex.permanent=true"
```

## 3. Environment & Conf Updates

Ensure these variables are passed to the app and demo instances:

**For the Pilot Instance:**
```bash
PUBLIC_BASE_URL=https://app.maulya.in
COOKIE_PREFIX=maulya_pilot
APP_INSTANCE=pilot
CORS_ALLOWED_ORIGINS=https://maulya.in,https://app.maulya.in
```

**For the Demo Instance:**
```bash
PUBLIC_BASE_URL=https://demo.maulya.in
COOKIE_PREFIX=maulya_demo
APP_INSTANCE=demo
CORS_ALLOWED_ORIGINS=https://maulya.in,https://demo.maulya.in
```
*(Optionally include Vite prefixes `VITE_API_BASE_URL=https://app.maulya.in/api` if building the frontend on the VPS).*

## 4. QA Evidence Checklist

Run these curls locally after spinning up the new infrastructure:

### Redirect Validation
1. **Pilot Redirect**
   `curl -I https://zenops.notalonestudios.com/`
   *Expected: HTTP 301 -> Location: https://app.maulya.in/*
2. **Demo Redirect**
   `curl -I https://demo.zenops.notalonestudios.com/login`
   *Expected: HTTP 301 -> Location: https://demo.maulya.in/login*

### Application Validation
1. **New App Reachability**
   `curl -I https://app.maulya.in/`
   *Expected: HTTP 200 or active 302 login redirect.*
2. **New Demo Reachability**
   `curl -I https://demo.maulya.in/login`
   *Expected: HTTP 200 payload.*
3. **Smoke Test**
   - Attempt login on `app.maulya.in` and `demo.maulya.in`.
   - Verify Marketing CTAs on `maulya.in` resolve properly.
   - Access `maulya.in/products/zenops/` to confirm the static HTML 0-second redirect triggers.
