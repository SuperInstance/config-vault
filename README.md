# config-vault

Fleet-wide configuration management system — feature flags, secrets, environments, and per-vessel overrides, all on Cloudflare Workers.

## What This Gives You

- **Environment management** — isolated configs for prod, staging, and custom environments
- **Feature flags** — toggle features dynamically without redeployment
- **Encrypted secret storage** — API keys and tokens with rotation tracking
- **Version control** — full change history with author attribution and one-click rollback
- **Per-vessel overrides** — customize individual vessel configs while keeping fleet standards
- **Audit logging** — every configuration change tracked with diffs

## Quick Start

```bash
wrangler deploy

# Get current configuration
curl https://config-vault.<your-subdomain>.workers.dev/api/config

# Toggle a feature flag
curl -X POST https://config-vault.<your-subdomain>.workers.dev/api/flag \
  -H "Content-Type: application/json" \
  -d '{"key": "new_dashboard", "value": true, "environments": ["staging"], "author": "ops"}'

# List secrets metadata
curl https://config-vault.<your-subdomain>.workers.dev/api/secrets
```

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/config` | Full config with environment filtering |
| `POST` | `/api/flag` | Create or update feature flags |
| `GET` | `/api/secrets` | List secret metadata (values encrypted) |
| `GET` | `/health` | Service health check |

## How It Fits

A Cocapn Fleet vessel providing centralized configuration for the SuperInstance ecosystem.

Related repos:
- [cocapn-fleet-integration](https://github.com/SuperInstance/cocapn-fleet-integration) — fleet orchestration
- [cost-optimizer](https://github.com/SuperInstance/cost-optimizer) — AI cost optimization
- [cocapn-shells](https://github.com/SuperInstance/cocapn-shells) — fleet shell infrastructure

## License

Apache 2.0
