from datetime import datetime

from base import db
from base.com.vo.category_vo import CategoryVO
from base.com.vo.location_vo import LocationVO
from base.com.vo.user_vo import UserVO


class PropertyVO(db.Model):
    __tablename__ = 'property_table'
    property_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    property_title = db.Column('property_title', db.String(255),
                               nullable=False)
    property_description = db.Column('property_description', db.Text,
                                     nullable=False)
    property_type = db.Column('property_type', db.Enum('sale', 'rent'),
                              nullable=False)
    price = db.Column('price', db.Float, nullable=False)
    bedrooms = db.Column('bedrooms', db.Integer, nullable=False)
    bathrooms = db.Column('bathrooms', db.Integer, nullable=False)
    area_sqft = db.Column('area_sqft', db.Float, nullable=False)
    address = db.Column('address', db.Text, nullable=False)
    year_built = db.Column('year_built', db.Integer, nullable=True)
    parking_spots = db.Column('parking_spots', db.Integer, default=0)
    has_garden = db.Column('has_garden', db.Boolean, default=False)
    has_pool = db.Column('has_pool', db.Boolean, default=False)
    pet_friendly = db.Column('pet_friendly', db.Boolean, default=False)
    furnished = db.Column('furnished', db.Boolean, default=False)
    property_images = db.Column('property_images', db.JSON,
                                nullable=True)  # Array of image filenames
    property_status = db.Column('property_status',
                                db.Enum('available', 'sold', 'rented',
                                        'pending'), default='available')
    is_featured = db.Column('is_featured', db.Boolean, default=False)
    is_approved = db.Column('is_approved', db.Boolean, default=False)
    created_date = db.Column('created_date', db.DateTime,
                             default=datetime.utcnow)
    updated_date = db.Column('updated_date', db.DateTime,
                             default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    user_id = db.Column('user_id', db.Integer,
                        db.ForeignKey(UserVO.user_id, ondelete='CASCADE'),
                        nullable=False)
    category_id = db.Column('category_id', db.Integer,
                            db.ForeignKey(CategoryVO.category_id,
                                          ondelete='CASCADE'), nullable=False)
    location_id = db.Column('location_id', db.Integer,
                            db.ForeignKey(LocationVO.location_id,
                                          ondelete='CASCADE'), nullable=False)

    def as_dict(self):
        return {
            'property_id': self.property_id,
            'property_title': self.property_title,
            'property_description': self.property_description,
            'property_type': self.property_type,
            'price': self.price,
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'area_sqft': self.area_sqft,
            'address': self.address,
            'year_built': self.year_built,
            'parking_spots': self.parking_spots,
            'has_garden': self.has_garden,
            'has_pool': self.has_pool,
            'pet_friendly': self.pet_friendly,
            'furnished': self.furnished,
            'property_images': self.property_images,
            'property_status': self.property_status,
            'is_featured': self.is_featured,
            'is_approved': self.is_approved,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'location_id': self.location_id
        }
