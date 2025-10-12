from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class RecipeBase(BaseModel):
    title: str
    dish_type: str
    ingredients: str
    instructions: str
    preparation_time: Optional[str] = None
    origin: Optional[str] = None
    servings: Optional[int] = None
    user_id: int

class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    dish_type: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    preparation_time: Optional[str] = None
    origin: Optional[str] = None
    servings: Optional[int] = None


class RecipeResponse(RecipeBase):
    id: int
    user_id: int
    creation_date: datetime

    class Config:
        from_attributes = True


class RecipeWithUserResponse(RecipeResponse):
    user_name: str
    user_email: str


class RecipeWithCommentsResponse(RecipeResponse):
    comments: List[dict] = []
    comments_count: int = 0