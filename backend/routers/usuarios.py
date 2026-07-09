from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user, get_supabase
from schemas import ActualizarUsuarioRequest, UsuarioOut

router = APIRouter(prefix="/v1/usuarios", tags=["usuarios"])


@router.get("/me", response_model=UsuarioOut)
def obtener_perfil(
    usuario: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    resultado = (
        supabase.table("usuarios")
        .select("*")
        .eq("id", usuario["id"])
        .single()
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return resultado.data


@router.put("/me", response_model=UsuarioOut)
def actualizar_perfil(
    body: ActualizarUsuarioRequest,
    usuario: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    resultado = (
        supabase.table("usuarios")
        .update(payload)
        .eq("id", usuario["id"])
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return resultado.data[0]
