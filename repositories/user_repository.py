from sqlalchemy.orm import Session
from typing import List, Optional
from models.user import User
import hashlib


class UserRepository:

    @staticmethod
    def hash_password(password: str) -> str:

        return hashlib.sha256(password.encode()).hexdigest()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def create_user(db: Session, user_data: dict) -> User:
        hashed_password = UserRepository.hash_password(user_data["password"])
        db_user = User(
            name=user_data["name"],
            email=user_data["email"],
            password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update_user(db: Session, user_id: int, update_data: dict) -> Optional[User]:
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            for key, value in update_data.items():
                if value is not None:
                    if key == "password":
                        value = UserRepository.hash_password(value)
                    setattr(db_user, key, value)
            db.commit()
            db.refresh(db_user)
        return db_user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            db.delete(db_user)
            db.commit()
            return True
        return False

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        hashed_password = UserRepository.hash_password(password)
        return db.query(User).filter(
            User.email == email,
            User.password == hashed_password
        ).first()