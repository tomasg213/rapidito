from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.comercios import router as comercios_router
from routers.pedidos import router as pedidos_router
from routers.productos import router as productos_router
from routers.direcciones import router as direcciones_router
from routers.usuarios import router as usuarios_router

app = FastAPI(title="Rapidito API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pedidos_router)
app.include_router(comercios_router)
app.include_router(productos_router)
app.include_router(usuarios_router)
app.include_router(direcciones_router)
