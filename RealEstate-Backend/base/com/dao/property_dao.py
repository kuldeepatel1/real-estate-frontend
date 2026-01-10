from sqlalchemy import or_

from base import db
from base.com.vo.category_vo import CategoryVO
from base.com.vo.location_vo import LocationVO
from base.com.vo.property_vo import PropertyVO
from base.com.vo.user_vo import UserVO


class PropertyDAO:
    def insert_property(self, property_vo):
        db.session.add(property_vo)
        db.session.commit()
        return property_vo.property_id

    def get_property_by_id(self, property_id):
        property_vo = PropertyVO.query.get(property_id)
        return property_vo

    def get_all_properties(self):
        property_vo_list = db.session.query(PropertyVO, UserVO, CategoryVO,
                                            LocationVO) \
            .join(UserVO, PropertyVO.user_id == UserVO.user_id) \
            .join(CategoryVO, PropertyVO.category_id == CategoryVO.category_id) \
            .join(LocationVO, PropertyVO.location_id == LocationVO.location_id) \
            .filter(PropertyVO.is_approved == True) \
            .all()
        return property_vo_list

    def get_properties_by_user_id(self, user_id):
        property_vo_list = PropertyVO.query.filter_by(user_id=user_id).all()
        return property_vo_list

    def get_properties_by_category_id(self, category_id):
        property_vo_list = PropertyVO.query.filter_by(
            category_id=category_id,
            is_approved=True
        ).all()
        return property_vo_list

    def get_properties_by_location_id(self, location_id):
        property_vo_list = PropertyVO.query.filter_by(
            location_id=location_id,
            is_approved=True
        ).all()
        return property_vo_list

    def get_properties_by_type(self, property_type):
        property_vo_list = PropertyVO.query.filter_by(
            property_type=property_type,
            is_approved=True
        ).all()
        return property_vo_list

    def get_featured_properties(self):
        property_vo_list = PropertyVO.query.filter_by(
            is_featured=True,
            is_approved=True,
            property_status='available'
        ).all()
        return property_vo_list

    def search_properties(self, filters):
        query = PropertyVO.query.filter_by(is_approved=True)

        if filters.get('property_type'):
            query = query.filter_by(property_type=filters['property_type'])

        if filters.get('category_id'):
            query = query.filter_by(category_id=filters['category_id'])

        if filters.get('location_id'):
            query = query.filter_by(location_id=filters['location_id'])

        if filters.get('min_price'):
            query = query.filter(PropertyVO.price >= filters['min_price'])

        if filters.get('max_price'):
            query = query.filter(PropertyVO.price <= filters['max_price'])

        if filters.get('min_bedrooms'):
            query = query.filter(
                PropertyVO.bedrooms >= filters['min_bedrooms'])

        if filters.get('min_bathrooms'):
            query = query.filter(
                PropertyVO.bathrooms >= filters['min_bathrooms'])

        if filters.get('min_area'):
            query = query.filter(PropertyVO.area_sqft >= filters['min_area'])

        if filters.get('search_term'):
            search_term = f"%{filters['search_term']}%"
            query = query.filter(
                or_(
                    PropertyVO.property_title.ilike(search_term),
                    PropertyVO.property_description.ilike(search_term),
                    PropertyVO.address.ilike(search_term)
                )
            )

        property_vo_list = query.all()
        return property_vo_list

    def update_property(self, property_vo):
        db.session.merge(property_vo)
        db.session.commit()

    def delete_property(self, property_id):
        property_vo = PropertyVO.query.get(property_id)
        if property_vo:
            db.session.delete(property_vo)
            db.session.commit()
            return True
        return False

    def approve_property(self, property_id):
        property_vo = PropertyVO.query.get(property_id)
        if property_vo:
            property_vo.is_approved = True
            db.session.commit()
            return True
        return False

    def feature_property(self, property_id):
        property_vo = PropertyVO.query.get(property_id)
        if property_vo:
            property_vo.is_featured = True
            db.session.commit()
            return True
        return False

    def update_property_status(self, property_id, status):
        property_vo = PropertyVO.query.get(property_id)
        if property_vo:
            property_vo.property_status = status
            db.session.commit()
            return True
        return False

    def get_pending_approvals(self):
        property_vo_list = PropertyVO.query.filter_by(is_approved=False).all()
        return property_vo_list

    def mark_property_sold(self, property_id):
        property_vo = PropertyVO.query.get(property_id)
        if property_vo:
            property_vo.property_status = 'sold'
            db.session.commit()
            return True
        return False

    def mark_property_pending(self, property_id):
        property_vo = PropertyVO.query.get(property_id)
        if property_vo:
            property_vo.property_status = 'pending'
            db.session.commit()
            return True
        return False

    def get_sold_properties(self):
        property_vo_list = db.session.query(PropertyVO, UserVO, CategoryVO,
                                            LocationVO) \
            .join(UserVO, PropertyVO.user_id == UserVO.user_id) \
            .join(CategoryVO, PropertyVO.category_id == CategoryVO.category_id) \
            .join(LocationVO, PropertyVO.location_id == LocationVO.location_id) \
            .filter(PropertyVO.property_status == 'sold') \
            .all()
        return property_vo_list

    def get_pending_properties(self):
        property_vo_list = db.session.query(PropertyVO, UserVO, CategoryVO,
                                            LocationVO) \
            .join(UserVO, PropertyVO.user_id == UserVO.user_id) \
            .join(CategoryVO, PropertyVO.category_id == CategoryVO.category_id) \
            .join(LocationVO, PropertyVO.location_id == LocationVO.location_id) \
            .filter(PropertyVO.property_status == 'pending') \
            .all()
        return property_vo_list
