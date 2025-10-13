from sqlalchemy.orm import Session
from typing import List, Optional
from models.comment import Comment


class CommentRepository:

    @staticmethod
    def get_comment_by_id(db: Session, comment_id: int) -> Optional[Comment]:
        return db.query(Comment).filter(Comment.id == comment_id).first()

    @staticmethod
    def get_comments_by_recipe(db: Session, recipe_id: int) -> List[Comment]:
        return db.query(Comment).filter(Comment.recipe_id == recipe_id).all()

    @staticmethod
    def get_comments_by_user(db: Session, user_id: int) -> List[Comment]:
        return db.query(Comment).filter(Comment.user_id == user_id).all()

    @staticmethod
    def get_all_comments(db: Session, skip: int = 0, limit: int = 100) -> List[Comment]:
        return db.query(Comment).offset(skip).limit(limit).all()

    @staticmethod
    def create_comment(db: Session, comment_data: dict) -> Comment:
        db_comment = Comment(
            content=comment_data["content"],
            rating=comment_data.get("rating"),
            user_id=comment_data["user_id"],
            recipe_id=comment_data["recipe_id"]
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return db_comment

    @staticmethod
    def update_comment(db: Session, comment_id: int, update_data: dict) -> Optional[Comment]:
        db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if db_comment:
            for key, value in update_data.items():
                if value is not None:
                    setattr(db_comment, key, value)
            db.commit()
            db.refresh(db_comment)
        return db_comment

    @staticmethod
    def delete_comment(db: Session, comment_id: int) -> bool:
        db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if db_comment:
            db.delete(db_comment)
            db.commit()
            return True
        return False

    @staticmethod
    def get_comment_with_user_info(db: Session, comment_id: int) -> Optional[Comment]:
        return db.query(Comment).join(Comment.user).filter(Comment.id == comment_id).first()