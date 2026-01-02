from base import db
from base.com.vo.user_vo import UserVO


class UserDAO:
    def insert_user(self, user_vo):
        db.session.add(user_vo)
        db.session.commit()
        return user_vo.user_id

    def get_user_by_id(self, user_id):
        user_vo = UserVO.query.get(user_id)
        return user_vo

    def get_user_by_email(self, user_email):
        user_vo = UserVO.query.filter_by(user_email=user_email).first()
        return user_vo

    def get_all_users(self):
        user_vo_list = UserVO.query.all()
        return user_vo_list

    def get_users_by_role(self, user_role):
        user_vo_list = UserVO.query.filter_by(user_role=user_role).all()
        return user_vo_list

    def update_user(self, user_vo):
        db.session.merge(user_vo)
        db.session.commit()

    def delete_user(self, user_id):
        user_vo = UserVO.query.get(user_id)
        if user_vo:
            db.session.delete(user_vo)
            db.session.commit()
            return True
        return False

    def update_user_role(self, user_id, new_role):
        user_vo = UserVO.query.get(user_id)
        if user_vo:
            user_vo.user_role = new_role
            db.session.commit()
            return True
        return False

    def verify_user(self, user_id):
        user_vo = UserVO.query.get(user_id)
        if user_vo:
            user_vo.is_verified = True
            db.session.commit()
            return True
        return False
