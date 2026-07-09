import os

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

load_dotenv()

_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        )
    return _supabase


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Extrae y verifica el JWT de Supabase desde el header Authorization.
    Retorna los datos del usuario autenticado.
    """
    token = credentials.credentials
    supabase = get_supabase()

    try:
        resp = supabase.auth.get_user(token)
        return dict(resp.user)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )


async def get_supabase_client(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Client:
    """
    Retorna un cliente Supabase autenticado con el token del usuario,
    para que las consultas respeten RLS.
    """
    token = credentials.credentials
    supabase = get_supabase()
    supabase.auth.set_session(access_token=token, refresh_token="")
    return supabase
