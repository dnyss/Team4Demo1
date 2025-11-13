from typing import List, Optional

from sqlalchemy.orm import Session

from models.recipe import Recipe


class RecipeRepository:

    @staticmethod
    def get_recipe_by_id(db: Session, recipe_id: int) -> Optional[Recipe]:
        return db.query(Recipe).filter(Recipe.id == recipe_id).first()

    @staticmethod
    def get_recipes_by_user(db: Session, user_id: int) -> List[Recipe]:
        return db.query(Recipe).filter(Recipe.user_id == user_id).all()

    @staticmethod
    def get_recipes_by_dish_type(db: Session, dish_type: str) -> List[Recipe]:
        return db.query(Recipe).filter(Recipe.dish_type == dish_type).all()

    @staticmethod
    def search_recipes_by_title(db: Session, title: str) -> List[Recipe]:
        return db.query(Recipe).filter(Recipe.title.ilike(f"%{title}%")).all()

    @staticmethod
    def get_all_recipes(db: Session, skip: int = 0, limit: int = 100) -> List[Recipe]:
        return db.query(Recipe).offset(skip).limit(limit).all()

    @staticmethod
    def create_recipe(db: Session, recipe_data: dict) -> Recipe:
        db_recipe = Recipe(
            title=recipe_data["title"],
            dish_type=recipe_data["dish_type"],
            ingredients=recipe_data["ingredients"],
            instructions=recipe_data["instructions"],
            preparation_time=recipe_data.get("preparation_time"),
            origin=recipe_data.get("origin"),
            servings=recipe_data.get("servings"),
            user_id=recipe_data["user_id"]
        )
        db.add(db_recipe)
        db.commit()
        db.refresh(db_recipe)
        return db_recipe

    @staticmethod
    def update_recipe(db: Session, recipe_id: int, update_data: dict) -> Optional[Recipe]:
        db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if db_recipe:
            for key, value in update_data.items():
                if value is not None:
                    setattr(db_recipe, key, value)
            db.commit()
            db.refresh(db_recipe)
        return db_recipe

    @staticmethod
    def delete_recipe(db: Session, recipe_id: int) -> bool:
        db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if db_recipe:
            db.delete(db_recipe)
            db.commit()
            return True
        return False

    @staticmethod
    def get_recipe_with_user_info(db: Session, recipe_id: int) -> Optional[Recipe]:
        return db.query(Recipe).join(Recipe.user).filter(Recipe.id == recipe_id).first()

    @staticmethod
    def get_recipes_with_comments_count(
        db: Session, skip: int = 0, limit: int = 100
    ) -> List[Recipe]:
        return db.query(Recipe).offset(skip).limit(limit).all()
