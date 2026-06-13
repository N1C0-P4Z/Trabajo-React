# OC-Proxy — NVIDIA → OpenCode Go Fallback

## Qué es

OC-Proxy es un servidor proxy local que actúa como intermediario entre OpenCode y los proveedores de LLM. Intenta primero con **NVIDIA** (gratuito); si NVIDIA responde con error 429 (rate limit) o 5xx, cae automáticamente a **OpenCode Go** (pago). Esto permite usar modelos potentes gratis la mayoría del tiempo, con un respaldo confiable cuando NVIDIA limita.

### Flujo de una petición

```
OpenCode → localhost:8731 → NVIDIA API
                              ↓ (429/5xx)
                            OpenCode Go API
```

## Requisitos

- Node.js 22+ (ya instalado en el sistema)
- Claves API: `NVIDIA_API_KEY` y `OPENCODE_GO_API_KEY`
- Systemd (para ejecutar como servicio de usuario)

## Modelo de mapeo

| Nombre corto (proxy) | ID NVIDIA                   | ID OpenCode Go    |
|----------------------|-----------------------------|-------------------|
| `deepseek-v4-pro`    | `deepseek-ai/deepseek-v4-pro` | `deepseek-v4-pro` |
| `deepseek-v4-flash`  | `deepseek-ai/deepseek-v4-flash` | `deepseek-v4-flash` |
| `glm-5.1`            | `z-ai/glm-5.1`              | `glm-5.1`         |
| `kimi-k2`            | `moonshotai/kimi-k2`         | `kimi-k2.6`       |
| `nemotron-3-ultra`    | `nvidia/nemotron-3-ultra-550b-a55b` | (sin fallback) |

> `nemotron-3-ultra` **no tiene fallback** — es exclusivo de NVIDIA. Si NVIDIA lo limita, la petición falla.

## Instalación

Los archivos ya están creados:

| Archivo | Ubicación |
|--------|-----------|
| Proxy server | `~/.local/bin/oc-proxy.mjs` |
| Config OpenCode | `~/.config/opencode/opencode.json` |
| Service systemd | `~/.local/share/systemd/user/oc-proxy.service` |
| Variables de entorno | `~/.config/oc-proxy/env` |

### Arranque

```bash
# Recargar systemd de usuario
systemctl --user daemon-reload

# Habilitar e iniciar el servicio
systemctl --user enable --now oc-proxy.service

# Verificar estado
systemctl --user status oc-proxy.service
```

## Verificación

### Comprobar que el proxy está corriendo

```bash
# Ver logs del servicio
journalctl --user -u oc-proxy.service -f

# Probar endpoint de modelos
curl -s http://localhost:8731/v1/models | python3 -m json.tool
```

### Probar una completión (no-streaming)

```bash
curl -s http://localhost:8731/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Di hola"}],
    "max_tokens": 20
  }' | python3 -m json.tool
```

### Probar streaming

```bash
curl -N http://localhost:8731/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.1",
    "messages": [{"role": "user", "content": "Contá hasta 5"}],
    "stream": true,
    "max_tokens": 50
  }'
```

### Verificar fallback

Si ves en los logs:

```
[oc-proxy] NVIDIA OK for deepseek-v4-flash
```

→ NVIDIA respondió correctamente.

```
[oc-proxy] NVIDIA 429, falling back to Go for deepseek-v4-flash
[oc-proxy] Go OK for deepseek-v4-flash
```

→ NVIDIA limitó, y Go tomó el relevo correctamente.

## Troubleshooting

### El proxy no arranca

```bash
# Verificar que Node.js existe
node --version

# Verificar que el puerto 8731 no está en uso
ss -tlnp | grep 8731

# Ver logs completos
journalctl --user -u oc-proxy.service --no-pager
```

### Error "No API keys found"

Verificar que `~/.config/oc-proxy/env` contenga las claves, o que las variables de entorno `NVIDIA_API_KEY` y `OPENCODE_GO_API_KEY` estén configuradas. El proxy lee las claves en este orden:

1. Variables de entorno (`NVIDIA_API_KEY`, `OPENCODE_GO_API_KEY`)
2. Archivo `~/.local/share/opencode/auth.json` (nvidia.key y opencode-go.key)

### Error de conexión a NVIDIA

NVIDIA puede tardar hasta 60s en responder. Esto es normal. El proxy tiene timeouts configurados:
- **Conexión**: 60 segundos
- **Idle**: 120 segundos

### OpenCode no encuentra el modelo

Verificar que `opencode.json` tiene el proveedor `nvidia-fallback` configurado con `baseURL: "http://localhost:8731/v1"`. Si OpenCode muestra un error de conexión, verificar que el proxy esté corriendo:

```bash
systemctl --user status oc-proxy.service
```

### Reinstalar después de cambios

```bash
# Si se modifica oc-proxy.mjs
systemctl --user restart oc-proxy.service

# Si se modifica el archivo .service
systemctl --user daemon-reload
systemctl --user restart oc-proxy.service
```

## Cómo desactivar

### Desactivar permanentemente (volver a OpenCode Go directo)

1. En `~/.config/opencode/opencode.json`, cambiar todos los agentes de `nvidia-fallback/XYZ` de vuelta a `opencode-go/XYZ` (usando los IDs reales del proveedor Go)
2. Detener el servicio:

```bash
systemctl --user disable --now oc-proxy.service
```

3. OpenCode usará `opencode-go` directamente sin pasar por el proxy.

### Desactivar temporalmente

```bash
systemctl --user stop oc-proxy.service
# Para reactivar:
systemctl --user start oc-proxy.service
```

## Archivos involucrados

| Archivo | Propósito |
|--------|-----------|
| `~/.local/bin/oc-proxy.mjs` | Servidor proxy (Node.js, sin dependencias) |
| `~/.config/opencode/opencode.json` | Config de OpenCode con provider `nvidia-fallback` |
| `~/.local/share/systemd/user/oc-proxy.service` | Servicio systemd de usuario |
| `~/.config/oc-proxy/env` | Variables de entorno (API keys) |
| `~/.local/share/opencode/auth.json` | Auth.json (backup de claves, leído por el proxy) |