from flask import request, jsonify

from base import app
from base.com.dao.location_dao import LocationDAO
from base.com.vo.location_vo import LocationVO
from base.utils.decorators import token_required, admin_required
from base.utils.helpers import format_response


@app.route('/api/locations', methods=['POST'])
@token_required
@admin_required
def create_location(current_user):
    try:
        data = request.get_json()

        if not data or 'location_name' not in data or 'city' not in data or 'state' not in data:
            return jsonify(format_response('error',
                                           'Location name, city and state are required')), 400

        location_vo = LocationVO()
        location_dao = LocationDAO()

        location_vo.location_name = data['location_name']
        location_vo.city = data['city']
        location_vo.state = data['state']
        location_vo.country = data.get('country', 'India')
        location_vo.zip_code = data.get('zip_code', '')
        location_vo.latitude = data.get('latitude')
        location_vo.longitude = data.get('longitude')

        location_id = location_dao.insert_location(location_vo)
        return jsonify(
            format_response('success', 'Location created successfully',
                            {'location_id': location_id})), 201
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/locations', methods=['GET'])
def get_all_locations():
    try:
        location_dao = LocationDAO()
        locations = location_dao.get_all_locations()
        return jsonify(format_response('success', 'Locations retrieved',
                                       [location.as_dict() for location in
                                        locations])), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/locations/search', methods=['GET'])
def search_locations():
    try:
        search_term = request.args.get('q', '')

        if not search_term:
            return jsonify(
                format_response('error', 'Search term is required')), 400

        location_dao = LocationDAO()
        locations = location_dao.search_locations(search_term)
        return jsonify(format_response('success', 'Search results',
                                       [location.as_dict() for location in
                                        locations])), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/locations/city/<string:city>', methods=['GET'])
def get_locations_by_city(city):
    try:
        location_dao = LocationDAO()
        locations = location_dao.get_locations_by_city(city)
        return jsonify(format_response('success', 'Locations by city',
                                       [location.as_dict() for location in
                                        locations])), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/locations/<int:location_id>', methods=['GET'])
def get_location(location_id):
    try:
        location_dao = LocationDAO()
        location = location_dao.get_location_by_id(location_id)

        if location:
            return jsonify(format_response('success', 'Location retrieved',
                                           location.as_dict())), 200
        else:
            return jsonify(format_response('error', 'Location not found')), 404
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/locations/<int:location_id>', methods=['PUT'])
@token_required
@admin_required
def update_location(current_user, location_id):
    try:
        data = request.get_json()
        location_dao = LocationDAO()
        existing_location = location_dao.get_location_by_id(location_id)

        if not existing_location:
            return jsonify(format_response('error', 'Location not found')), 404

        location_vo = LocationVO()
        location_vo.location_id = location_id
        location_vo.location_name = data.get('location_name',
                                             existing_location.location_name)
        location_vo.city = data.get('city', existing_location.city)
        location_vo.state = data.get('state', existing_location.state)
        location_vo.country = data.get('country', existing_location.country)
        location_vo.zip_code = data.get('zip_code', existing_location.zip_code)
        location_vo.latitude = data.get('latitude', existing_location.latitude)
        location_vo.longitude = data.get('longitude',
                                         existing_location.longitude)

        location_dao.update_location(location_vo)
        return jsonify(
            format_response('success', 'Location updated successfully')), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/locations/<int:location_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_location(current_user, location_id):
    try:
        location_dao = LocationDAO()
        existing_location = location_dao.get_location_by_id(location_id)

        if not existing_location:
            return jsonify(format_response('error', 'Location not found')), 404

        success = location_dao.delete_location(location_id)

        if success:
            return jsonify(format_response('success',
                                           'Location deleted successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to delete location')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500
