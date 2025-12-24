from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers.health import router as health_router
from server.routers.businesses import router as businesses_router
import logging

logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

app = FastAPI(title="FSA Maps API")

# TODO: make this stricter
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(businesses_router, prefix="/api")

@app.get("/")
async def main():
    return {"status": "ok"}

