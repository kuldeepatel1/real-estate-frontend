from datetime import datetime

from base import db
from base.com.vo.property_vo import PropertyVO
from base.com.vo.user_vo import UserVO


class AppointmentVO(db.Model):
    __tablename__ = 'appointment_table'
    appointment_id = db.Column(db.Integer, primary_key=True,
                               autoincrement=True)
    appointment_date = db.Column('appointment_date', db.Date, nullable=False)
    appointment_time = db.Column('appointment_time', db.Time, nullable=False)
    appointment_status = db.Column('appointment_status',
                                   db.Enum('pending', 'confirmed', 'cancelled',
                                           'completed'), default='pending')
    message = db.Column('message', db.Text, nullable=True)
    created_date = db.Column('created_date', db.DateTime,
                             default=datetime.utcnow)

    # Foreign Keys
    buyer_id = db.Column('buyer_id', db.Integer,
                         db.ForeignKey(UserVO.user_id, ondelete='CASCADE'),
                         nullable=False)
    seller_id = db.Column('seller_id', db.Integer,
                          db.ForeignKey(UserVO.user_id, ondelete='CASCADE'),
                          nullable=False)
    property_id = db.Column('property_id', db.Integer,
                            db.ForeignKey(PropertyVO.property_id,
                                          ondelete='CASCADE'), nullable=False)

    def as_dict(self):
        return {
            'appointment_id': self.appointment_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_time': self.appointment_time.isoformat() if self.appointment_time else None,
            'appointment_status': self.appointment_status,
            'message': self.message,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'buyer_id': self.buyer_id,
            'seller_id': self.seller_id,
            'property_id': self.property_id
        }
