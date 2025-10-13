from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CommentBase(BaseModel):
    content: str
    rating: Optional[float] = None
    user_id: int
    recipe_id: int

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    rating: Optional[float] = None

class CommentResponse(CommentBase):
    id: int
    comment_date: datetime

    class Config:
        from_attributes = True

class CommentWithUserResponse(CommentResponse):
    user_name: str
    user_email: str