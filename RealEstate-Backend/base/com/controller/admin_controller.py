from flask import jsonify

from base import app
from base.com.dao.property_dao import PropertyDAO
from base.com.dao.review_dao import ReviewDAO
from base.com.dao.user_dao import UserDAO
from base.utils.decorators import token_required, admin_required
from base.utils.helpers import format_response


@app.route('/api/admin/dashboard', methods=['GET'])
@token_required
@admin_required
def admin_dashboard(current_user):
    try:
        user_dao = UserDAO()
        property_dao = PropertyDAO()
        review_dao = ReviewDAO()

        total_users = len(user_dao.get_all_users())
        total_properties = len(property_dao.get_all_properties())
        pending_approvals = len(property_dao.get_pending_approvals())
        pending_reviews = len(review_dao.get_pending_reviews())

        return jsonify(format_response('success', 'Dashboard data retrieved', {
            'total_users': total_users,
            'total_properties': total_properties,
            'pending_approvals': pending_approvals,
            'pending_reviews': pending_reviews
        })), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/admin/properties/pending', methods=['GET'])
@token_required
@admin_required
def get_pending_properties(current_user):
    try:
        property_dao = PropertyDAO()
        properties = property_dao.get_pending_approvals()
        return jsonify(
            format_response('success', 'Pending properties retrieved',
                            [property.as_dict() for property in
                             properties])), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/admin/properties/<int:property_id>/approve', methods=['POST'])
@token_required
@admin_required
def approve_property(current_user, property_id):
    try:
        property_dao = PropertyDAO()
        success = property_dao.approve_property(property_id)

        if success:
            return jsonify(format_response('success',
                                           'Property approved successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to approve property')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/admin/properties/<int:property_id>/feature', methods=['POST'])
@token_required
@admin_required
def feature_property(current_user, property_id):
    try:
        property_dao = PropertyDAO()
        success = property_dao.feature_property(property_id)

        if success:
            return jsonify(format_response('success',
                                           'Property featured successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to feature property')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/admin/users/<int:user_id>/verify', methods=['POST'])
@token_required
@admin_required
def verify_user(current_user, user_id):
    try:
        user_dao = UserDAO()
        success = user_dao.verify_user(user_id)

        if success:
            return jsonify(
                format_response('success', 'User verified successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to verify user')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/admin/users/<int:user_id>/deactivate', methods=['POST'])
@token_required
@admin_required
def deactivate_user(current_user, user_id):
    try:
        user_dao = UserDAO()
        user_vo = user_dao.get_user_by_id(user_id)

        if user_vo:
            user_vo.is_active = False
            user_dao.update_user(user_vo)
            return jsonify(format_response('success',
                                           'User deactivated successfully')), 200
        else:
            return jsonify(format_response('error', 'User not found')), 404
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/admin/users/<int:user_id>/activate', methods=['POST'])
@token_required
@admin_required
def activate_user(current_user, user_id):
    try:
        user_dao = UserDAO()
        user_vo = user_dao.get_user_by_id(user_id)

        if user_vo:
            user_vo.is_active = True
            user_dao.update_user(user_vo)
            return jsonify(
                format_response('success', 'User activated successfully')), 200
        else:
            return jsonify(format_response('error', 'User not found')), 404
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/admin/reviews/pending', methods=['GET'])
@token_required
@admin_required
def get_pending_reviews(current_user):
    try:
        review_dao = ReviewDAO()
        reviews = review_dao.get_pending_reviews()
        return jsonify(format_response('success', 'Pending reviews retrieved',
                                       [review.as_dict() for review in
                                        reviews])), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/admin/reviews/<int:review_id>/approve', methods=['POST'])
@token_required
@admin_required
def approve_review(current_user, review_id):
    try:
        review_dao = ReviewDAO()
        success = review_dao.approve_review(review_id)

        if success:
            return jsonify(format_response('success',
                                           'Review approved successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to approve review')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500
