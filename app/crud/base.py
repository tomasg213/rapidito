from typing import Any, Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: type[ModelType]):
        self.model = model

    async def create(
        self, db: AsyncSession, *, obj_in: CreateSchemaType
    ) -> ModelType:
        db_obj = self.model(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get(self, db: AsyncSession, id: Any) -> ModelType | None:
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> list[ModelType]:
        result = await db.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
