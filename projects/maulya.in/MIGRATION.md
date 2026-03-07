# Maulya.in Migration & DNS Strategy

This document outlines the required DNS configuration for the standalone `maulya.in` marketing site and its associated application environments.

## DNS A-Records (Required)
Ensure the following records are set in your DNS provider pointing to your Traefik VPS IP:

- `A maulya.in -> [VPS_IP]`
- `A app.maulya.in -> [VPS_IP]`
- `A demo.maulya.in -> [VPS_IP]`

*(Note: Traefik redirect labels for `zenops.notalonestudios.com` managed in previous migration steps still apply for legacy traffic).*

## Application Routing Targets
- **Maulya Marketing Site**: Deployed statically to Hostinger (mapped to `maulya.in`)
- **Maulya Workspace App**: Handled via Traefik (mapped to `app.maulya.in`)
- **Maulya Demo App**: Handled via Traefik (mapped to `demo.maulya.in`)
