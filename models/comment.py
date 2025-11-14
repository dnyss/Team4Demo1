from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    comment_date = Column(DateTime, default=datetime.utcnow)
    rating = Column(Float, nullable=True)  # Optional, can be None

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)

    user = relationship("User", back_populates="comments")
    recipe = relationship("Recipe", back_populates="comments")

    def __repr__(self):
        return f"<Comment(id={self.id}, user_id={self.user_id}, recipe_id={self.recipe_id})>"
