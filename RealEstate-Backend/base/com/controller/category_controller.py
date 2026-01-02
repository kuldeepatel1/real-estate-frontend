from flask import request, jsonify

from base import app
from base.com.dao.category_dao import CategoryDAO
from base.com.vo.category_vo import CategoryVO
from base.utils.decorators import token_required, admin_required
from base.utils.helpers import format_response


@app.route('/api/categories', methods=['POST'])
@token_required
@admin_required
def create_category(current_user):
    try:
        data = request.get_json()

        if not data or 'category_name' not in data:
            return jsonify(
                format_response('error', 'Category name is required')), 400

        category_vo = CategoryVO()
        category_dao = CategoryDAO()

        category_vo.category_name = data['category_name']

        category_id = category_dao.insert_category(category_vo)
        return jsonify(
            format_response('success', 'Category created successfully',
                            {'category_id': category_id})), 201
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/categories', methods=['GET'])
def get_all_categories():
    try:
        category_dao = CategoryDAO()
        categories = category_dao.get_all_categories()
        return jsonify(format_response('success', 'Categories retrieved',
                                       [category.as_dict() for category in
                                        categories])), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    try:
        category_dao = CategoryDAO()
        category = category_dao.get_category_by_id(category_id)

        if category:
            return jsonify(format_response('success', 'Category retrieved',
                                           category.as_dict())), 200
        else:
            return jsonify(format_response('error', 'Category not found')), 404
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/categories/<int:category_id>', methods=['PUT'])
@token_required
@admin_required
def update_category(current_user, category_id):
    try:
        data = request.get_json()

        if not data or 'category_name' not in data:
            return jsonify(
                format_response('error', 'Category name is required')), 400

        category_dao = CategoryDAO()
        existing_category = category_dao.get_category_by_id(category_id)

        if not existing_category:
            return jsonify(format_response('error', 'Category not found')), 404

        category_vo = CategoryVO()
        category_vo.category_id = category_id
        category_vo.category_name = data['category_name']

        category_dao.update_category(category_vo)
        return jsonify(
            format_response('success', 'Category updated successfully')), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_category(current_user, category_id):
    try:
        category_dao = CategoryDAO()
        existing_category = category_dao.get_category_by_id(category_id)

        if not existing_category:
            return jsonify(format_response('error', 'Category not found')), 404

        success = category_dao.delete_category(category_id)

        if success:
            return jsonify(format_response('success',
                                           'Category deleted successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to delete category')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500
