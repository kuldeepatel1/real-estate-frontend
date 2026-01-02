from base import db
from base.com.vo.favorite_vo import FavoriteVO
from base.com.vo.property_vo import PropertyVO


class FavoriteDAO:
    def insert_favorite(self, favorite_vo):
        db.session.add(favorite_vo)
        db.session.commit()
        return favorite_vo.favorite_id

    def get_favorite_by_id(self, favorite_id):
        favorite_vo = FavoriteVO.query.get(favorite_id)
        return favorite_vo

    def get_favorites_by_user_id(self, user_id):
        favorite_vo_list = db.session.query(FavoriteVO, PropertyVO) \
            .join(PropertyVO, FavoriteVO.property_id == PropertyVO.property_id) \
            .filter(FavoriteVO.user_id == user_id) \
            .all()
        return favorite_vo_list

    def get_favorite_by_user_and_property(self, user_id, property_id):
        favorite_vo = FavoriteVO.query.filter_by(
            user_id=user_id,
            property_id=property_id
        ).first()
        return favorite_vo

    def is_property_favorited(self, user_id, property_id):
        favorite_vo = FavoriteVO.query.filter_by(
            user_id=user_id,
            property_id=property_id
        ).first()
        return favorite_vo is not None

    def delete_favorite(self, favorite_id):
        favorite_vo = FavoriteVO.query.get(favorite_id)
        if favorite_vo:
            db.session.delete(favorite_vo)
            db.session.commit()
            return True
        return False

    def delete_favorite_by_user_and_property(self, user_id, property_id):
        favorite_vo = FavoriteVO.query.filter_by(
            user_id=user_id,
            property_id=property_id
        ).first()
        if favorite_vo:
            db.session.delete(favorite_vo)
            db.session.commit()
            return True
        return False

    def get_favorite_count_by_property(self, property_id):
        count = FavoriteVO.query.filter_by(property_id=property_id).count()
        return count
