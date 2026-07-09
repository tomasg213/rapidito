from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from auth import get_current_user, get_supabase_client
from schemas import (
    ActualizarComercioRequest,
    ComercioOut,
    CrearComercioRequest,
    ProductoOut,
)

router = APIRouter(prefix="/v1/comercios", tags=["comercios"])


@router.get("", response_model=list[ComercioOut])
def listar_comercios(supabase: Client = Depends(get_supabase_client)):
    resultado = supabase.table("comercios").select("*").eq("activo", True).execute()
    return resultado.data


@router.get("/{comercio_id}", response_model=ComercioOut)
def obtener_comercio(comercio_id: UUID, supabase: Client = Depends(get_supabase_client)):
    resultado = (
        supabase.table("comercios").select("*").eq("id", str(comercio_id)).single().execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Comercio no encontrado")
    return resultado.data


@router.post("", response_model=ComercioOut, status_code=201)
def crear_comercio(
    body: CrearComercioRequest,
    usuario: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    payload = body.model_dump()
    payload["propietario_id"] = usuario["id"]
    resultado = supabase.table("comercios").insert(payload).execute()
    return resultado.data[0]


@router.put("/{comercio_id}", response_model=ComercioOut)
def actualizar_comercio(
    comercio_id: UUID,
    body: ActualizarComercioRequest,
    supabase: Client = Depends(get_supabase_client),
):
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    resultado = (
        supabase.table("comercios")
        .update(payload)
        .eq("id", str(comercio_id))
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Comercio no encontrado")
    return resultado.data[0]


@router.get("/{comercio_id}/productos", response_model=list[ProductoOut])
def listar_productos(comercio_id: UUID, supabase: Client = Depends(get_supabase_client)):
    resultado = (
        supabase.table("productos")
        .select("*")
        .eq("comercio_id", str(comercio_id))
        .eq("disponible", True)
        .execute()
    )
    return resultado.data
