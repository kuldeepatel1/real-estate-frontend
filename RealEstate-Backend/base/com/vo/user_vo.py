from datetime import datetime

from base import db


class UserVO(db.Model):
    __tablename__ = 'user_table'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_name = db.Column('user_name', db.String(100), nullable=False)
    user_email = db.Column('user_email', db.String(255), unique=True,
                           nullable=False)
    user_password = db.Column('user_password', db.String(255), nullable=False)
    user_phone = db.Column('user_phone', db.String(20), nullable=True)
    user_address = db.Column('user_address', db.Text, nullable=True)
    user_role = db.Column('user_role', db.Enum('user', 'admin'),
                          default='user')
    user_profile_picture = db.Column('user_profile_picture', db.String(255),
                                     nullable=True)
    is_verified = db.Column('is_verified', db.Boolean, default=False)
    is_active = db.Column('is_active', db.Boolean, default=True)
    created_date = db.Column('created_date', db.DateTime,
                             default=datetime.utcnow)
    updated_date = db.Column('updated_date', db.DateTime,
                             default=datetime.utcnow, onupdate=datetime.utcnow)

    def as_dict(self):
        return {
            'user_id': self.user_id,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'user_phone': self.user_phone,
            'user_address': self.user_address,
            'user_role': self.user_role,
            'user_profile_picture': self.user_profile_picture,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None
        }
