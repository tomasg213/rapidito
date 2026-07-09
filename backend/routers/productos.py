from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from auth import get_supabase
from schemas import (
    ActualizarProductoRequest,
    CrearProductoRequest,
    ProductoOut,
)

router = APIRouter(prefix="/v1/productos", tags=["productos"])
supabase = get_supabase()


@router.get("/{producto_id}", response_model=ProductoOut)
def obtener_producto(producto_id: UUID):
    resultado = (
        supabase.table("productos")
        .select("*")
        .eq("id", str(producto_id))
        .single()
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return resultado.data


@router.post("", response_model=ProductoOut, status_code=201)
def crear_producto(
    comercio_id: UUID,
    body: CrearProductoRequest,
):
    payload = body.model_dump()
    payload["comercio_id"] = str(comercio_id)
    resultado = supabase.table("productos").insert(payload).execute()
    return resultado.data[0]


@router.put("/{producto_id}", response_model=ProductoOut)
def actualizar_producto(
    producto_id: UUID,
    body: ActualizarProductoRequest,
):
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    resultado = (
        supabase.table("productos")
        .update(payload)
        .eq("id", str(producto_id))
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return resultado.data[0]


@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(producto_id: UUID):
    resultado = (
        supabase.table("productos")
        .delete()
        .eq("id", str(producto_id))
        .execute()
    )
    if not resultado.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
