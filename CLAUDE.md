# BeachPass

> Sistema de suscripcion para alquiler de sombrillas y equipamiento playero
> Version actual: v0.1

## Stack
- Frontend: Vite 6 + React 19 + Tailwind v4 + Zustand 5 + Leaflet + react-leaflet
- Backend: Express 5 + JSON file storage
- QR: qrcode (backend) + qrcode.react (frontend)
- Puertos: Frontend 3082, API 3083

## Estructura
```
beachpass/
├── data/          # JSON storage
├── server/        # Express API
├── src/
│   ├── lib/       # Utilidades, constantes
│   ├── store/     # Zustand stores
│   └── components/
│       ├── layout/        # AppShell, Sidebar, Header
│       ├── ui/            # Componentes reutilizables
│       ├── map/           # Mapa Leaflet
│       ├── stations/      # Estaciones
│       ├── subscriptions/ # Planes y suscripciones
│       ├── rentals/       # Alquiler + QR
│       ├── reservations/  # Reservas
│       ├── account/       # Login + perfil
│       └── admin/         # Panel admin
```

## Comandos
```bash
npm run dev      # Frontend (3082) + API (3083)
npm run server   # Solo API
npm run client   # Solo frontend
npm run seed     # Regenerar datos demo
```

## Datos
- 20 estaciones Barcelona + 20 Mallorca con coordenadas reales
- Tiers: Basic (sombrilla) y Premium (sombrilla UV + hamacas)
- Auth simple: email + PIN 4 digitos

---

## Changelog
