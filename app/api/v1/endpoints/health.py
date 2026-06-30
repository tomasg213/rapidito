from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG,
    }
