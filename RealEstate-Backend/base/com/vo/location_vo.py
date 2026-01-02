from base import db


class LocationVO(db.Model):
    __tablename__ = 'location_table'
    location_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    location_name = db.Column('location_name', db.String(100), nullable=False)
    city = db.Column('city', db.String(100), nullable=False)
    state = db.Column('state', db.String(100), nullable=False)
    country = db.Column('country', db.String(100), nullable=False,
                        default='India')
    zip_code = db.Column('zip_code', db.String(20), nullable=True)
    latitude = db.Column('latitude', db.Float, nullable=True)
    longitude = db.Column('longitude', db.Float, nullable=True)
    is_active = db.Column('is_active', db.Boolean, default=True)

    def as_dict(self):
        return {
            'location_id': self.location_id,
            'location_name': self.location_name,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'zip_code': self.zip_code,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'is_active': self.is_active
        }
