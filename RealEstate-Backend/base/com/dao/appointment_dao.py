from datetime import date

from base import db
from base.com.vo.appointment_vo import AppointmentVO
from base.com.vo.property_vo import PropertyVO
from base.com.vo.user_vo import UserVO


class AppointmentDAO:
    def insert_appointment(self, appointment_vo):
        db.session.add(appointment_vo)
        db.session.commit()
        return appointment_vo.appointment_id

    def get_appointment_by_id(self, appointment_id):
        appointment_vo = AppointmentVO.query.get(appointment_id)
        return appointment_vo

    def get_appointments_by_buyer_id(self, buyer_id):
        appointment_vo_list = db.session.query(AppointmentVO, UserVO,
                                               PropertyVO) \
            .join(UserVO, AppointmentVO.seller_id == UserVO.user_id) \
            .join(PropertyVO,
                  AppointmentVO.property_id == PropertyVO.property_id) \
            .filter(AppointmentVO.buyer_id == buyer_id) \
            .all()
        return appointment_vo_list

    def get_appointments_by_seller_id(self, seller_id):
        appointment_vo_list = db.session.query(AppointmentVO, UserVO,
                                               PropertyVO) \
            .join(UserVO, AppointmentVO.buyer_id == UserVO.user_id) \
            .join(PropertyVO,
                  AppointmentVO.property_id == PropertyVO.property_id) \
            .filter(AppointmentVO.seller_id == seller_id) \
            .all()
        return appointment_vo_list

    def get_appointments_by_property_id(self, property_id):
        appointment_vo_list = AppointmentVO.query.filter_by(
            property_id=property_id).all()
        return appointment_vo_list

    def get_appointments_by_status(self, status):
        appointment_vo_list = AppointmentVO.query.filter_by(
            appointment_status=status).all()
        return appointment_vo_list

    def get_todays_appointments(self, user_id=None):
        today = date.today()
        query = AppointmentVO.query.filter(
            AppointmentVO.appointment_date == today)

        if user_id:
            query = query.filter(
                (AppointmentVO.buyer_id == user_id) |
                (AppointmentVO.seller_id == user_id)
            )

        appointment_vo_list = query.all()
        return appointment_vo_list

    def check_appointment_conflict(self, property_id, appointment_date,
                                   appointment_time):
        existing_appointment = AppointmentVO.query.filter_by(
            property_id=property_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            appointment_status='confirmed'
        ).first()
        return existing_appointment is not None

    def update_appointment(self, appointment_vo):
        db.session.merge(appointment_vo)
        db.session.commit()

    def delete_appointment(self, appointment_id):
        appointment_vo = AppointmentVO.query.get(appointment_id)
        if appointment_vo:
            db.session.delete(appointment_vo)
            db.session.commit()
            return True
        return False

    def update_appointment_status(self, appointment_id, status):
        appointment_vo = AppointmentVO.query.get(appointment_id)
        if appointment_vo:
            appointment_vo.appointment_status = status
            db.session.commit()
            return True
        return False
