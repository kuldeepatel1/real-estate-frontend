from flask import request, jsonify

from base import app
from base.com.dao.favorite_dao import FavoriteDAO
from base.com.vo.favorite_vo import FavoriteVO
from base.utils.decorators import token_required
from base.utils.helpers import format_response


@app.route('/api/favorites', methods=['POST'])
@token_required
def add_to_favorites(current_user):
    try:
        data = request.get_json()
        if 'property_id' not in data:
            return jsonify(
                format_response('error', 'Property ID is required')), 400

        favorite_dao = FavoriteDAO()
        existing_favorite = favorite_dao.get_favorite_by_user_and_property(
            current_user['user_id'], data['property_id'])

        if existing_favorite:
            return jsonify(format_response('error',
                                           'Property is already in favorites')), 400

        favorite_vo = FavoriteVO()
        favorite_vo.user_id = current_user['user_id']
        favorite_vo.property_id = data['property_id']

        favorite_id = favorite_dao.insert_favorite(favorite_vo)
        return jsonify(
            format_response('success', 'Property added to favorites',
                            {'favorite_id': favorite_id})), 201
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/favorites', methods=['GET'])
@token_required
def get_my_favorites(current_user):
    try:
        favorite_dao = FavoriteDAO()
        favorites = favorite_dao.get_favorites_by_user_id(
            current_user['user_id'])

        favorite_list = []
        for favorite_vo, property_vo in favorites:
            favorite_data = favorite_vo.as_dict()
            favorite_data['property'] = property_vo.as_dict()
            favorite_list.append(favorite_data)

        return jsonify(
            format_response('success', 'My favorites', favorite_list)), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/favorites/<int:property_id>', methods=['DELETE'])
@token_required
def remove_from_favorites(current_user, property_id):
    try:
        favorite_dao = FavoriteDAO()
        favorite_vo = favorite_dao.get_favorite_by_user_and_property(
            current_user['user_id'], property_id)

        if not favorite_vo:
            return jsonify(format_response('error',
                                           'Property not found in favorites')), 404

        success = favorite_dao.delete_favorite(favorite_vo.favorite_id)

        if success:
            return jsonify(format_response('success',
                                           'Property removed from favorites')), 200
        else:
            return jsonify(format_response('error',
                                           'Failed to remove from favorites')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/favorites/check/<int:property_id>', methods=['GET'])
@token_required
def check_if_favorited(current_user, property_id):
    try:
        favorite_dao = FavoriteDAO()
        is_favorited = favorite_dao.is_property_favorited(
            current_user['user_id'], property_id)
        return jsonify(format_response('success', 'Favorite status checked',
                                       {'is_favorited': is_favorited})), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500
