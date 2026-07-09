from fastapi import APIRouter, Depends

from auth import get_current_user, get_supabase
from schemas import ActualizarUsuarioRequest, UsuarioOut

router = APIRouter(prefix="/v1/usuarios", tags=["usuarios"])
supabase = get_supabase()


@router.get("/me", response_model=UsuarioOut)
def obtener_perfil(
    usuario: dict = Depends(get_current_user),
):
    resultado = (
        supabase.table("usuarios")
        .select("*")
        .eq("id", usuario["id"])
        .single()
        .execute()
    )
    return resultado.data[0]


@router.put("/me", response_model=UsuarioOut)
def actualizar_perfil(
    body: ActualizarUsuarioRequest,
    usuario: dict = Depends(get_current_user),
):
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    resultado = (
        supabase.table("usuarios")
        .update(payload)
        .eq("id", usuario["id"])
        .execute()
    )
    return resultado.data[0]
