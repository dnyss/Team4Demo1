from sqlalchemy.orm import Session
from typing import List, Optional
from models.user import User
from repositories.user_repository import UserRepository
from schemas.user_schemas import UserCreate, UserUpdate, UserResponse


class UserService:

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[UserResponse]:
        user = UserRepository.get_user_by_id(db, user_id)
        if user:
            return UserResponse.from_orm(user)
        return None

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[UserResponse]:
        user = UserRepository.get_user_by_email(db, email)
        if user:
            return UserResponse.from_orm(user)
        return None

    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        users = UserRepository.get_all_users(db, skip, limit)
        return [UserResponse.from_orm(user) for user in users]

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> UserResponse:
        existing_user = UserRepository.get_user_by_email(db, user_data.email)
        if existing_user:
            raise ValueError("Email already registered")

        # Create user
        user_dict = user_data.dict()
        db_user = UserRepository.create_user(db, user_dict)
        return UserResponse.from_orm(db_user)

    @staticmethod
    def update_user(db: Session, user_id: int, update_data: UserUpdate) -> Optional[UserResponse]:
        existing_user = UserRepository.get_user_by_id(db, user_id)
        if not existing_user:
            return None

        if update_data.email and update_data.email != existing_user.email:
            email_taken = UserRepository.get_user_by_email(db, update_data.email)
            if email_taken:
                raise ValueError("Email already taken by another user")

        update_dict = update_data.dict(exclude_unset=True)
        updated_user = UserRepository.update_user(db, user_id, update_dict)
        if updated_user:
            return UserResponse.from_orm(updated_user)
        return None

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        return UserRepository.delete_user(db, user_id)

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[UserResponse]:
        user = UserRepository.authenticate_user(db, email, password)
        if user:
            return UserResponse.from_orm(user)
        return None

    @staticmethod
    def get_user_recipes(db: Session, user_id: int):
        user = UserRepository.get_user_by_id(db, user_id)
        if user:
            return user.recipes
        return []