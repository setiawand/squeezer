import io
import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image

app = FastAPI(title="Squeezer API")

# CORS untuk frontend dev
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://localhost:3001",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _resample_filter():
    resampling = getattr(Image, "Resampling", None)
    if resampling is not None:
        return resampling.LANCZOS
    return getattr(Image, "LANCZOS", Image.ANTIALIAS)


def compress_image_bytes(file_bytes: bytes, max_dim: int = 1920, quality: int = 85, progressive: bool = True) -> io.BytesIO:
    img = Image.open(io.BytesIO(file_bytes))
    img.thumbnail((max_dim, max_dim), _resample_filter())
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    out_buf = io.BytesIO()
    img.save(
        out_buf,
        format="JPEG",
        quality=max(1, min(int(quality), 95)),
        optimize=True,
        progressive=bool(progressive),
        subsampling=2,
    )
    out_buf.seek(0)
    return out_buf


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/compress")
def compress(
    image: UploadFile = File(...),
    quality: int = Form(85),
    max_size: int = Form(1920),
    progressive: bool = Form(True),
):
    if not image:
        raise HTTPException(status_code=400, detail="File gambar wajib diunggah")

    file_bytes = image.file.read()
    try:
        buf = compress_image_bytes(file_bytes, max_dim=max_size, quality=quality, progressive=progressive)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal mengompresi: {e}")

    name, _ = os.path.splitext(image.filename or "image")
    download_name = f"{name}_compressed.jpg"

    return StreamingResponse(
        buf,
        media_type="image/jpeg",
        headers={
            "Content-Disposition": f"attachment; filename={download_name}",
        },
    )