from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    dish_type = Column(String(50), nullable=False)
    ingredients = Column(Text, nullable=False)
    instructions = Column(Text, nullable=False)
    preparation_time = Column(String(50))
    origin = Column(String(100))
    servings = Column(Integer)
    creation_date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="recipes")
    comments = relationship("Comment", back_populates="recipe")

    def __repr__(self):
        return f"<Recipe(id={self.id}, title='{self.title}', dish_type='{self.dish_type}')>"