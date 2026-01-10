from flask import request, jsonify
from base import app
from base.com.dao.property_dao import PropertyDAO
from base.com.vo.property_vo import PropertyVO
from base.utils.decorators import token_required
from base.utils.helpers import format_response, save_uploaded_file, \
    format_property_images
from base.utils.validators import validate_price, validate_bedrooms, \
    validate_bathrooms
from flask import request, jsonify

from base import app
from base.com.dao.property_dao import PropertyDAO
from base.com.vo.property_vo import PropertyVO
from base.utils.decorators import token_required
from base.utils.helpers import format_response, save_uploaded_file, \
    format_property_images
from base.utils.validators import validate_price, validate_bedrooms, \
    validate_bathrooms

folder_name = "property_images"


@app.route('/api/properties', methods=['POST'])
@token_required
def create_property(current_user):
    try:
        if 'property_images' not in request.files:
            return jsonify(
                format_response('error', 'Property images are required')), 400

        files = request.files.getlist('property_images')
        image_filenames = []

        for file in files:
            filename, _ = save_uploaded_file(file, folder_name)
            if filename:
                image_filenames.append(filename)

        if not image_filenames:
            return jsonify(format_response('error',
                                           'At least one valid image is required')), 400

        try:
            price = float(request.form.get('price'))
            bedrooms = int(request.form.get('bedrooms'))
            bathrooms = int(request.form.get('bathrooms'))
            area_sqft = float(request.form.get('area_sqft'))
        except ValueError:
            return jsonify(
                format_response('error', 'Invalid numeric values')), 400

        if not validate_price(price):
            return jsonify(
                format_response('error', 'Price must be positive')), 400
        if not validate_bedrooms(bedrooms):
            return jsonify(
                format_response('error', 'Invalid bedrooms count')), 400
        if not validate_bathrooms(bathrooms):
            return jsonify(
                format_response('error', 'Invalid bathrooms count')), 400

        property_vo = PropertyVO()
        property_vo.property_title = request.form.get('property_title')
        property_vo.property_description = request.form.get(
            'property_description')
        property_vo.property_type = request.form.get('property_type')
        property_vo.price = price
        property_vo.bedrooms = bedrooms
        property_vo.bathrooms = bathrooms
        property_vo.area_sqft = area_sqft
        property_vo.address = request.form.get('address')
        property_vo.year_built = request.form.get('year_built')
        property_vo.parking_spots = int(request.form.get('parking_spots', 0))
        property_vo.has_garden = request.form.get('has_garden') == 'true'
        property_vo.has_pool = request.form.get('has_pool') == 'true'
        property_vo.pet_friendly = request.form.get('pet_friendly') == 'true'
        property_vo.furnished = request.form.get('furnished') == 'true'
        property_vo.property_images = image_filenames
        property_vo.user_id = current_user['user_id']
        property_vo.category_id = int(request.form.get('category_id'))
        property_vo.location_id = int(request.form.get('location_id'))
        property_vo.is_approved = current_user['user_role'] == 'admin'

        message = "Property created successfully and approved" if property_vo.is_approved else \
            "Property created successfully - waiting for approval"

        property_id = PropertyDAO().insert_property(property_vo)
        return jsonify(format_response('success', message,
                                       {'property_id': property_id})), 201

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/properties', methods=['GET'])
def get_all_properties():
    try:
        properties = PropertyDAO().get_all_properties()
        result = []

        for property_vo, user_vo, category_vo, location_vo in properties:
            item = property_vo.as_dict()
            item["property_images"] = format_property_images(
                item.get("property_images"), folder_name)
            item["user_name"] = user_vo.user_name
            item["category_name"] = category_vo.category_name
            item["location_name"] = location_vo.location_name
            item["city"] = location_vo.city
            result.append(item)

        return jsonify(
            format_response('success', 'Properties retrieved', result)), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/properties/<int:property_id>', methods=['GET'])
def get_property(property_id):
    try:
        property_vo = PropertyDAO().get_property_by_id(property_id)
        if not property_vo:
            return jsonify(format_response('error', 'Property not found')), 404

        item = property_vo.as_dict()
        item["property_images"] = format_property_images(
            item.get("property_images"), folder_name)
        return jsonify(
            format_response('success', 'Property retrieved', item)), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/my-properties', methods=['GET'])
@token_required
def get_my_properties(current_user):
    try:
        properties = PropertyDAO().get_properties_by_user_id(
            current_user['user_id'])
        result = []

        for p in properties:
            item = p.as_dict()
            item["property_images"] = format_property_images(
                item.get("property_images"), folder_name)
            result.append(item)

        return jsonify(
            format_response('success', 'My properties', result)), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/properties/<int:property_id>/sold', methods=['PUT'])
@token_required
def mark_property_sold(current_user, property_id):
    try:
        property_dao = PropertyDAO()
        property_vo = property_dao.get_property_by_id(property_id)

        if not property_vo:
            return jsonify(format_response('error', 'Property not found')), 404

        # Only owner or admin can mark as sold
        if property_vo.user_id != current_user['user_id'] and current_user['user_role'] != 'admin':
            return jsonify(format_response('error', 'Unauthorized')), 403

        success = property_dao.mark_property_sold(property_id)
        if success:
            return jsonify(format_response('success', 'Property marked as sold')), 200
        else:
            return jsonify(format_response('error', 'Failed to mark property as sold')), 500

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/properties/<int:property_id>/pending', methods=['PUT'])
@token_required
def mark_property_pending(current_user, property_id):
    try:
        property_dao = PropertyDAO()
        property_vo = property_dao.get_property_by_id(property_id)

        if not property_vo:
            return jsonify(format_response('error', 'Property not found')), 404

        # Only owner or admin can mark as pending
        if property_vo.user_id != current_user['user_id'] and current_user['user_role'] != 'admin':
            return jsonify(format_response('error', 'Unauthorized')), 403

        success = property_dao.mark_property_pending(property_id)
        if success:
            return jsonify(format_response('success', 'Property marked as pending')), 200
        else:
            return jsonify(format_response('error', 'Failed to mark property as pending')), 500

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/properties/sold', methods=['GET'])
@token_required
def get_sold_properties(current_user):
    try:
        property_dao = PropertyDAO()
        properties = property_dao.get_sold_properties()
        result = []

        for property_vo, user_vo, category_vo, location_vo in properties:
            item = property_vo.as_dict()
            item["property_images"] = format_property_images(
                item.get("property_images"), folder_name)
            item["user_name"] = user_vo.user_name
            item["category_name"] = category_vo.category_name
            item["location_name"] = location_vo.location_name
            item["city"] = location_vo.city
            result.append(item)

        return jsonify(
            format_response('success', 'Sold properties', result)), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/properties/pending-status', methods=['GET'])
@token_required
def get_pending_status_properties(current_user):
    try:
        property_dao = PropertyDAO()
        properties = property_dao.get_pending_properties()
        result = []

        for property_vo, user_vo, category_vo, location_vo in properties:
            item = property_vo.as_dict()
            item["property_images"] = format_property_images(
                item.get("property_images"), folder_name)
            item["user_name"] = user_vo.user_name
            item["category_name"] = category_vo.category_name
            item["location_name"] = location_vo.location_name
            item["city"] = location_vo.city
            result.append(item)

        return jsonify(
            format_response('success', 'Pending status properties', result)), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500
