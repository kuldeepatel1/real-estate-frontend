from base import db
from base.com.vo.location_vo import LocationVO


class LocationDAO:
    def insert_location(self, location_vo):
        db.session.add(location_vo)
        db.session.commit()
        return location_vo.location_id

    def get_location_by_id(self, location_id):
        location_vo = LocationVO.query.get(location_id)
        return location_vo

    def get_locations_by_city(self, city):
        location_vo_list = LocationVO.query.filter_by(city=city,
                                                      is_active=True).all()
        return location_vo_list

    def get_locations_by_state(self, state):
        location_vo_list = LocationVO.query.filter_by(state=state,
                                                      is_active=True).all()
        return location_vo_list

    def get_all_locations(self):
        location_vo_list = LocationVO.query.filter_by(is_active=True).all()
        return location_vo_list

    def search_locations(self, search_term):
        location_vo_list = LocationVO.query.filter(
            (LocationVO.location_name.ilike(f'%{search_term}%')) |
            (LocationVO.city.ilike(f'%{search_term}%')) |
            (LocationVO.state.ilike(f'%{search_term}%'))
        ).filter_by(is_active=True).all()
        return location_vo_list

    def update_location(self, location_vo):
        db.session.merge(location_vo)
        db.session.commit()

    def delete_location(self, location_id):
        location_vo = LocationVO.query.get(location_id)
        if location_vo:
            location_vo.is_active = False
            db.session.commit()
            return True
        return False

    def activate_location(self, location_id):
        location_vo = LocationVO.query.get(location_id)
        if location_vo:
            location_vo.is_active = True
            db.session.commit()
            return True
        return False
