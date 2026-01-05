from sqlalchemy import func

from base import db
from base.com.vo.property_vo import PropertyVO
from base.com.vo.review_vo import ReviewVO
from base.com.vo.user_vo import UserVO


class ReviewDAO:
    def insert_review(self, review_vo):
        db.session.add(review_vo)
        db.session.commit()
        return review_vo.review_id

    def get_review_by_id(self, review_id):
        review_vo = ReviewVO.query.get(review_id)
        return review_vo

    def get_reviews_by_property_id(self, property_id):
        review_vo_list = db.session.query(ReviewVO, UserVO) \
            .join(UserVO, ReviewVO.user_id == UserVO.user_id) \
            .filter(ReviewVO.property_id == property_id) \
            .filter(ReviewVO.is_approved == True) \
            .all()
        return review_vo_list

    def get_reviews_by_user_id(self, user_id):
        review_vo_list = ReviewVO.query.filter_by(user_id=user_id).all()
        return review_vo_list

    def get_review_by_user_and_property(self, user_id, property_id):
        review_vo = ReviewVO.query.filter_by(
            user_id=user_id,
            property_id=property_id
        ).first()
        return review_vo

    def get_pending_reviews(self):
        review_vo_list = ReviewVO.query.filter_by(is_approved=False).all()
        return review_vo_list

    def get_property_rating_stats(self, property_id):
        stats = db.session.query(
            func.count(ReviewVO.review_id).label('total_reviews'),
            func.avg(ReviewVO.rating).label('average_rating')
        ).filter(
            ReviewVO.property_id == property_id,
            ReviewVO.is_approved == True
        ).first()
        return stats

    def update_review(self, review_vo):
        db.session.merge(review_vo)
        db.session.commit()

    def delete_review(self, review_id):
        review_vo = ReviewVO.query.get(review_id)
        if review_vo:
            db.session.delete(review_vo)
            db.session.commit()
            return True
        return False

    def approve_review(self, review_id):
        review_vo = ReviewVO.query.get(review_id)
        if review_vo:
            review_vo.is_approved = True
            db.session.commit()
            return True
        return False

    def get_recent_reviews(self, limit=10):
        review_vo_list = db.session.query(ReviewVO, UserVO, PropertyVO) \
            .join(UserVO, ReviewVO.user_id == UserVO.user_id) \
            .join(PropertyVO, ReviewVO.property_id == PropertyVO.property_id) \
            .filter(ReviewVO.is_approved == True) \
            .order_by(ReviewVO.created_date.desc()) \
            .limit(limit) \
            .all()
        return review_vo_list
