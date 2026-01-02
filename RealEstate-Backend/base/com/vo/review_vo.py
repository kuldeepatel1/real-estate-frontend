from datetime import datetime

from base import db
from base.com.vo.property_vo import PropertyVO
from base.com.vo.user_vo import UserVO


class ReviewVO(db.Model):
    __tablename__ = 'review_table'
    review_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rating = db.Column('rating', db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column('comment', db.Text, nullable=True)
    is_approved = db.Column('is_approved', db.Boolean, default=False)
    created_date = db.Column('created_date', db.DateTime,
                             default=datetime.utcnow)

    # Foreign Keys
    user_id = db.Column('user_id', db.Integer,
                        db.ForeignKey(UserVO.user_id, ondelete='CASCADE'),
                        nullable=False)
    property_id = db.Column('property_id', db.Integer,
                            db.ForeignKey(PropertyVO.property_id,
                                          ondelete='CASCADE'), nullable=False)

    # Unique constraint to prevent duplicate reviews
    __table_args__ = (db.UniqueConstraint('user_id', 'property_id',
                                          name='unique_user_property_review'),)

    def as_dict(self):
        return {
            'review_id': self.review_id,
            'rating': self.rating,
            'comment': self.comment,
            'is_approved': self.is_approved,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'user_id': self.user_id,
            'property_id': self.property_id
        }
