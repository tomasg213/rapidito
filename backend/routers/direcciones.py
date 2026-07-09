from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user, get_supabase
from schemas import (
    ActualizarDireccionRequest,
    CrearDireccionRequest,
    DireccionOut,
)

router = APIRouter(prefix="/v1/direcciones", tags=["direcciones"])


@router.get("", response_model=list[DireccionOut])
def listar_direcciones(
    usuario: dict = Depends(get_current_user),
):
    resultado = (
        get_supabase()
        .table("direcciones")
        .select("*")
        .eq("usuario_id", usuario["id"])
        .order("created_at")
        .execute()
    )
    return resultado.data


@router.post("", response_model=DireccionOut, status_code=201)
def crear_direccion(
    body: CrearDireccionRequest,
    usuario: dict = Depends(get_current_user),
):
    payload = body.model_dump()
    payload["usuario_id"] = usuario["id"]
    resultado = get_supabase().table("direcciones").insert(payload).execute()
    return resultado.data[0]


@router.put("/{direccion_id}", response_model=DireccionOut)
def actualizar_direccion(
    direccion_id: UUID,
    body: ActualizarDireccionRequest,
    usuario: dict = Depends(get_current_user),
):
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    resultado = (
        get_supabase()
        .table("direcciones")
        .update(payload)
        .eq("id", str(direccion_id))
        .eq("usuario_id", usuario["id"])
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Direccion no encontrada")
    return resultado.data[0]


@router.delete("/{direccion_id}", status_code=204)
def eliminar_direccion(
    direccion_id: UUID,
    usuario: dict = Depends(get_current_user),
):
    resultado = (
        get_supabase()
        .table("direcciones")
        .delete()
        .eq("id", str(direccion_id))
        .eq("usuario_id", usuario["id"])
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Direccion no encontrada")
