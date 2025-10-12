from sqlalchemy.orm import Session
from typing import List, Optional
from models.recipe import Recipe
from repositories.recipe_repository import RecipeRepository
from schemas.recipe_schemas import RecipeCreate, RecipeUpdate, RecipeResponse, RecipeWithUserResponse, \
    RecipeWithCommentsResponse


class RecipeService:

    @staticmethod
    def get_recipe_by_id(db: Session, recipe_id: int) -> Optional[RecipeResponse]:
        recipe = RecipeRepository.get_recipe_by_id(db, recipe_id)
        if recipe:
            return RecipeResponse.from_orm(recipe)
        return None

    @staticmethod
    def get_recipes_by_user(db: Session, user_id: int) -> List[RecipeResponse]:
        recipes = RecipeRepository.get_recipes_by_user(db, user_id)
        return [RecipeResponse.from_orm(recipe) for recipe in recipes]

    @staticmethod
    def get_recipes_by_dish_type(db: Session, dish_type: str) -> List[RecipeResponse]:
        recipes = RecipeRepository.get_recipes_by_dish_type(db, dish_type)
        return [RecipeResponse.from_orm(recipe) for recipe in recipes]

    @staticmethod
    def search_recipes(db: Session, title: str) -> List[RecipeResponse]:
        recipes = RecipeRepository.search_recipes_by_title(db, title)
        return [RecipeResponse.from_orm(recipe) for recipe in recipes]

    @staticmethod
    def get_all_recipes(db: Session, skip: int = 0, limit: int = 100) -> List[RecipeResponse]:
        recipes = RecipeRepository.get_all_recipes(db, skip, limit)
        return [RecipeResponse.from_orm(recipe) for recipe in recipes]

    @staticmethod
    def create_recipe(db: Session, recipe_data: RecipeCreate) -> RecipeResponse:
        if len(recipe_data.title.strip()) == 0:
            raise ValueError("Recipe title cannot be empty")

        if len(recipe_data.ingredients.strip()) == 0:
            raise ValueError("Ingredients cannot be empty")

        if len(recipe_data.instructions.strip()) == 0:
            raise ValueError("Instructions cannot be empty")

        recipe_dict = recipe_data.model_dump()
        db_recipe = RecipeRepository.create_recipe(db, recipe_dict)
        return RecipeResponse.from_orm(db_recipe)

    @staticmethod
    def update_recipe(db: Session, recipe_id: int, update_data: RecipeUpdate) -> Optional[RecipeResponse]:
        existing_recipe = RecipeRepository.get_recipe_by_id(db, recipe_id)
        if not existing_recipe:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        updated_recipe = RecipeRepository.update_recipe(db, recipe_id, update_dict)
        if updated_recipe:
            return RecipeResponse.from_orm(updated_recipe)
        return None

    @staticmethod
    def delete_recipe(db: Session, recipe_id: int) -> bool:
        return RecipeRepository.delete_recipe(db, recipe_id)

    @staticmethod
    def get_recipe_with_user_details(db: Session, recipe_id: int) -> Optional[RecipeWithUserResponse]:
        recipe = RecipeRepository.get_recipe_with_user_info(db, recipe_id)
        if recipe:
            response_data = RecipeResponse.from_orm(recipe).model_dump()
            response_data["user_name"] = recipe.user.name
            response_data["user_email"] = recipe.user.email
            return RecipeWithUserResponse(**response_data)
        return None

    @staticmethod
    def get_recipe_with_comments(db: Session, recipe_id: int) -> Optional[RecipeWithCommentsResponse]:
        recipe = RecipeRepository.get_recipe_by_id(db, recipe_id)
        if recipe:
            response_data = RecipeResponse.from_orm(recipe).model_dump()
            response_data["comments_count"] = len(recipe.comments)

            comments_data = []
            for comment in recipe.comments:
                comments_data.append({
                    "id": comment.id,
                    "content": comment.content,
                    "rating": comment.rating,
                    "user_name": comment.user.name
                })
            response_data["comments"] = comments_data

            return RecipeWithCommentsResponse(**response_data)
        return None

    @staticmethod
    def get_user_recipes_with_stats(db: Session, user_id: int) -> List[dict]:
        recipes = RecipeRepository.get_recipes_by_user(db, user_id)
        result = []

        for recipe in recipes:
            recipe_data = RecipeResponse.from_orm(recipe).model_dump()
            recipe_data["comments_count"] = len(recipe.comments)
            result.append(recipe_data)

        return result