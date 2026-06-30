from collections.abc import Generator
from typing import Any

from fastapi import Depends, Header, HTTPException, status


async def verify_tenant(slug: str | None = Header(None, alias="X-Tenant-Slug")) -> str:
    if not slug:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="X-Tenant-Slug header is required",
        )
    return slug


def get_db() -> Generator[Any, Any, Any]:
    """Placeholder: inyectará la conexión a Supabase/PostgreSQL."""
    raise NotImplementedError("Database session not yet configured")
