import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from supabase import Client, create_client

load_dotenv()

app = FastAPI(title="Rapidito API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

ESTADOS_VALIDOS: set[str] = {
    "pendiente",
    "en_preparacion",
    "en_camino",
    "entregado",
}


class ActualizarEstadoRequest(BaseModel):
    estado: str

    @field_validator("estado")
    @classmethod
    def estado_debe_ser_valido(cls, v: str) -> str:
        if v not in ESTADOS_VALIDOS:
            raise ValueError(
                f"Estado inválido. Debe ser uno de: {', '.join(sorted(ESTADOS_VALIDOS))}"
            )
        return v


@app.patch("/v1/pedidos/{pedido_id}/estado")
def actualizar_estado(pedido_id: str, body: ActualizarEstadoRequest):
    """
    Actualiza el estado de un pedido.
    Supabase Realtime propaga automáticamente el cambio a los clientes suscritos.
    """
    resultado = (
        supabase.table("pedidos")
        .update({"estado": body.estado})
        .eq("id", pedido_id)
        .execute()
    )

    if not resultado.data:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    return resultado.data[0]
