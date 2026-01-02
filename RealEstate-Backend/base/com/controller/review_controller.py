from flask import request, jsonify

from base import app
from base.com.dao.review_dao import ReviewDAO
from base.com.vo.review_vo import ReviewVO
from base.utils.decorators import token_required
from base.utils.helpers import format_response
from base.utils.validators import validate_rating


@app.route('/api/reviews', methods=['POST'])
@token_required
def create_review(current_user):
    try:
        data = request.get_json()

        if not all(field in data for field in ['property_id', 'rating']):
            return jsonify(format_response('error',
                                           'Property ID and rating are required')), 400

        if not validate_rating(data['rating']):
            return jsonify(format_response('error',
                                           'Rating must be between 1 and 5')), 400

        review_dao = ReviewDAO()
        existing_review = review_dao.get_review_by_user_and_property(
            current_user['user_id'], data['property_id'])

        if existing_review:
            return jsonify(format_response('error',
                                           'You have already reviewed this property')), 400

        review_vo = ReviewVO()
        review_vo.user_id = current_user['user_id']
        review_vo.property_id = data['property_id']
        review_vo.rating = data['rating']
        review_vo.comment = data.get('comment', '')
        review_vo.is_approved = False

        review_id = review_dao.insert_review(review_vo)
        return jsonify(format_response('success',
                                       'Review submitted successfully and waiting for approval',
                                       {'review_id': review_id})), 201
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/reviews/property/<int:property_id>', methods=['GET'])
def get_property_reviews(property_id):
    try:
        review_dao = ReviewDAO()
        reviews = review_dao.get_reviews_by_property_id(property_id)

        review_list = []
        for review_vo, user_vo in reviews:
            review_data = review_vo.as_dict()
            review_data['user_name'] = user_vo.user_name
            review_list.append(review_data)

        stats = review_dao.get_property_rating_stats(property_id)

        return jsonify(format_response('success', 'Reviews retrieved', {
            'reviews': review_list,
            'stats': {
                'total_reviews': stats.total_reviews if stats else 0,
                'average_rating': round(float(stats.average_rating),
                                        2) if stats and stats.average_rating else 0
            }
        })), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/reviews/my-reviews', methods=['GET'])
@token_required
def get_my_reviews(current_user):
    try:
        review_dao = ReviewDAO()
        reviews = review_dao.get_reviews_by_user_id(current_user['user_id'])
        return jsonify(format_response('success', 'My reviews',
                                       [review.as_dict() for review in
                                        reviews])), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/reviews/<int:review_id>', methods=['PUT'])
@token_required
def update_review(current_user, review_id):
    try:
        data = request.get_json()
        review_dao = ReviewDAO()
        existing_review = review_dao.get_review_by_id(review_id)

        if not existing_review:
            return jsonify(format_response('error', 'Review not found')), 404

        if existing_review.user_id != current_user['user_id']:
            return jsonify(format_response('error',
                                           'Unauthorized to update this review')), 403

        if 'rating' in data and not validate_rating(data['rating']):
            return jsonify(format_response('error',
                                           'Rating must be between 1 and 5')), 400

        review_vo = ReviewVO()
        review_vo.review_id = review_id
        review_vo.rating = data.get('rating', existing_review.rating)
        review_vo.comment = data.get('comment', existing_review.comment)
        review_vo.is_approved = False

        review_dao.update_review(review_vo)
        return jsonify(format_response('success',
                                       'Review updated successfully and sent for re-approval')), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/reviews/<int:review_id>', methods=['DELETE'])
@token_required
def delete_review(current_user, review_id):
    try:
        review_dao = ReviewDAO()
        existing_review = review_dao.get_review_by_id(review_id)

        if not existing_review:
            return jsonify(format_response('error', 'Review not found')), 404

        if existing_review.user_id != current_user['user_id'] and current_user[
            'user_role'] != 'admin':
            return jsonify(format_response('error',
                                           'Unauthorized to delete this review')), 403

        success = review_dao.delete_review(review_id)

        if success:
            return jsonify(
                format_response('success', 'Review deleted successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to delete review')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500
