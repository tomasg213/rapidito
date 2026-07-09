import os

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

load_dotenv()

_security = HTTPBearer()
_supabase: Client | None = None


def get_supabase() -> Client:
    """Retorna el cliente Supabase (service-role). Lazy: solo se conecta al usarlo."""
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError(
                "Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY "
                "en backend/.env"
            )
        _supabase = create_client(url, key)
    return _supabase


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> dict:
    """Verifica el JWT contra Supabase Auth y retorna {id} del usuario."""
    try:
        resp = get_supabase().auth.get_user(credentials.credentials)
        return {"id": str(resp.user.id)}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
