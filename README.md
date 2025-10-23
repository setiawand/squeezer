# Squeezer — Image Compressor

Aplikasi kompresi gambar berbasis Next.js (frontend) dan FastAPI (backend). Dikemas dengan Docker Compose untuk kemudahan menjalankan secara lokal.

## Quick Start (Docker Compose)

Prasyarat:
- Docker & Docker Compose terpasang

Jalankan stack:

```bash
docker compose up -d --build
```

Akses:
- Frontend: http://localhost:3001/
- Backend: http://localhost:8001/ (Dokumentasi: http://localhost:8001/docs)

Hentikan:

```bash
docker compose down
```

Status & log:

```bash
docker compose ps
docker compose logs -f backend frontend
```

## Konfigurasi Penting

- `NEXT_PUBLIC_API_URL` (frontend)
  - Diset di `docker-compose.yml` ke `http://localhost:8001` (build arg + env var).
  - Digunakan oleh browser saat memanggil API backend.
- CORS (backend)
  - Sudah mengizinkan asal `http://localhost:3000` dan `http://localhost:3001` untuk pengembangan.
  - Ubah di `backend/main.py` bila perlu.

## Healthcheck & Restart

- Kedua layanan memiliki healthcheck:
  - Backend: `curl -fsS http://localhost:8001/`
  - Frontend: `curl -fsS http://localhost:3000/`
- Kebijakan restart: `restart: unless-stopped` (otomatis hidup kembali bila crash).
- Frontend menunggu backend sehat via `depends_on` (condition: `service_healthy`).

## Endpoint API

- `GET /` — Health
  - Respons: `{ "status": "ok" }`
- `POST /compress` — Kompres gambar
  - Form fields:
    - `image` (file, wajib)
    - `quality` (int, default 85, rentang 1–95)
    - `max_size` (int, default 1920)
    - `progressive` (bool, default true)
  - Contoh:

```bash
curl -X POST \
  -F "image=@path/to/your.jpg" \
  -F "quality=85" \
  -F "max_size=1920" \
  -F "progressive=true" \
  http://localhost:8001/compress \
  --output compressed.jpg
```

## Pengembangan (Opsional)

Frontend (Next.js):

```bash
cd frontend
npm install
npm run dev
# buka http://localhost:3000
```

Backend (FastAPI):

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

Catatan:
- Bila backend dev berjalan di 8001, hentikan container backend agar port tidak bentrok.
- CORS sudah mengizinkan `localhost:3000` dan `localhost:3001` untuk pengembangan.

## Struktur Proyek

```
image-compressor/
├── backend/            # FastAPI app (Dockerfile, main.py, requirements.txt)
├── frontend/           # Next.js app (Dockerfile, app/, components/ui/, lib/)
└── docker-compose.yml  # Orkestrasi layanan
```

## Troubleshooting

- Port 3000 di host terpakai:
  - Frontend dipetakan ke `3001:3000`, akses UI di `http://localhost:3001/`.
- CORS error:
  - Pastikan asal (origin) sesuai dan variabel `NEXT_PUBLIC_API_URL` mengarah ke backend.
- Healthcheck gagal:
  - Cek logs: `docker compose logs -f backend frontend`.

Selamat menggunakan Squeezer!