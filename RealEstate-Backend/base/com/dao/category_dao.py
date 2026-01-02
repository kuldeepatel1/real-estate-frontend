from base import db
from base.com.vo.category_vo import CategoryVO


class CategoryDAO:
    def insert_category(self, category_vo):
        db.session.add(category_vo)
        db.session.commit()
        return category_vo.category_id

    def get_category_by_id(self, category_id):
        return CategoryVO.query.get(category_id)

    def get_category_by_name(self, category_name):
        return CategoryVO.query.filter_by(category_name=category_name).first()

    def get_all_categories(self):
        return CategoryVO.query.filter_by(is_active=True).all()

    def get_all_categories_with_inactive(self):
        return CategoryVO.query.all()

    def update_category(self, category_vo):
        db.session.merge(category_vo)
        db.session.commit()

    def delete_category(self, category_id):
        category_vo = CategoryVO.query.get(category_id)
        if category_vo:
            category_vo.is_active = False
            db.session.commit()
            return True
        return False

    def activate_category(self, category_id):
        category_vo = CategoryVO.query.get(category_id)
        if category_vo:
            category_vo.is_active = True
            db.session.commit()
            return True
        return False
