from base import db


class CategoryVO(db.Model):
    __tablename__ = 'category_table'
    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column('category_name', db.String(100), nullable=False,
                              unique=True)
    is_active = db.Column('is_active', db.Boolean, default=True)

    def as_dict(self):
        return {
            'category_id': self.category_id,
            'category_name': self.category_name,
            'is_active': self.is_active
        }
