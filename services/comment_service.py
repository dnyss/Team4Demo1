from typing import List, Optional

from sqlalchemy.orm import Session

from repositories.comment_repository import CommentRepository
from schemas.comment_schemas import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    CommentWithUserResponse
)


class CommentService:

    @staticmethod
    def get_comment_by_id(db: Session, comment_id: int) -> Optional[CommentResponse]:
        comment = CommentRepository.get_comment_by_id(db, comment_id)
        if comment:
            return CommentResponse.from_orm(comment)
        return None

    @staticmethod
    def get_comments_by_recipe(db: Session, recipe_id: int) -> List[CommentResponse]:
        comments = CommentRepository.get_comments_by_recipe(db, recipe_id)
        return [CommentResponse.from_orm(comment) for comment in comments]

    @staticmethod
    def get_comments_by_user(db: Session, user_id: int) -> List[CommentResponse]:
        comments = CommentRepository.get_comments_by_user(db, user_id)
        return [CommentResponse.from_orm(comment) for comment in comments]

    @staticmethod
    def get_all_comments(db: Session, skip: int = 0, limit: int = 100) -> List[CommentResponse]:
        comments = CommentRepository.get_all_comments(db, skip, limit)
        return [CommentResponse.from_orm(comment) for comment in comments]

    @staticmethod
    def create_comment(db: Session, comment_data: CommentCreate) -> CommentResponse:
        if comment_data.rating is not None and (comment_data.rating < 0 or comment_data.rating > 5):
            raise ValueError("Rating must be between 0 and 5")
        comment_dict = comment_data.model_dump()
        db_comment = CommentRepository.create_comment(db, comment_dict)
        return CommentResponse.from_orm(db_comment)

    @staticmethod
    def update_comment(
        db: Session, comment_id: int, update_data: CommentUpdate
    ) -> Optional[CommentResponse]:
        if update_data.rating is not None and (
            update_data.rating < 0 or update_data.rating > 5
        ):
            raise ValueError("Rating must be between 0 and 5")

        update_dict = update_data.model_dump(exclude_unset=True)
        updated_comment = CommentRepository.update_comment(db, comment_id, update_dict)
        if updated_comment:
            return CommentResponse.from_orm(updated_comment)
        return None

    @staticmethod
    def delete_comment(db: Session, comment_id: int) -> bool:
        return CommentRepository.delete_comment(db, comment_id)

    @staticmethod
    def get_comment_with_user_details(
        db: Session, comment_id: int
    ) -> Optional[CommentWithUserResponse]:
        comment = CommentRepository.get_comment_with_user_info(
            db, comment_id
        )
        if comment:
            response_data = CommentResponse.from_orm(comment).model_dump()
            response_data["user_name"] = comment.user.name
            response_data["user_email"] = comment.user.email
            return CommentWithUserResponse(**response_data)
        return None

    @staticmethod
    def get_recipe_comments_with_users(
        db: Session, recipe_id: int
    ) -> List[CommentWithUserResponse]:
        comments = CommentRepository.get_comments_by_recipe(
            db, recipe_id
        )
        result = []
        for comment in comments:
            response_data = CommentResponse.from_orm(comment).model_dump()
            response_data["user_name"] = comment.user.name
            response_data["user_email"] = comment.user.email
            result.append(CommentWithUserResponse(**response_data))
        return result
