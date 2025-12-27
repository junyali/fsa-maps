from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from server.routers.health import router as health_router
from server.routers.businesses import router as businesses_router
from server.routers.metadata import router as metadata_router
import logging

logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["10/second"],
)

app = FastAPI(title="FSA Maps API")

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

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
app.include_router(metadata_router, prefix="/api")

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded"}
    )

@app.get("/")
async def main():
    return {"status": "ok"}

