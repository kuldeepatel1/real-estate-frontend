import os

from flask import request, jsonify

from base import app
from base.com.dao.user_dao import UserDAO
from base.com.vo.user_vo import UserVO
from base.utils.decorators import token_required
from base.utils.helpers import (
    hash_password,
    generate_token,
    format_response,
    validate_password,
    save_uploaded_file,
)
from base.utils.validators import validate_email, validate_phone

folder_name = "profile_pictures"


@app.route('/api/register', methods=['POST'])
def register_user():
    try:
        profile_picture_filename = None
        if request.content_type and 'multipart/form-data' in request.content_type:
            profile_picture = request.files.get('user_profile_picture')
            if profile_picture and profile_picture.filename != '':
                profile_picture_filename, _ = save_uploaded_file(
                    profile_picture, folder_name)
            data = request.form
        else:
            data = request.get_json()
            profile_picture_filename = data.get('user_profile_picture', None)

        user_name = data.get('user_name')
        user_email = data.get('user_email')
        user_password = data.get('user_password')
        user_phone = data.get('user_phone', '')
        user_address = data.get('user_address', '')

        if not all([user_name, user_email, user_password]):
            return jsonify(format_response('error',
                                           'Name, email and password are required')), 400

        if not validate_email(user_email):
            return jsonify(
                format_response('error', 'Invalid email format')), 400

        is_valid, message = validate_password(user_password)
        if not is_valid:
            return jsonify(format_response('error', message)), 400

        if user_phone and not validate_phone(user_phone):
            return jsonify(
                format_response('error', 'Invalid phone number format')), 400

        user_dao = UserDAO()
        if user_dao.get_user_by_email(user_email):
            return jsonify(format_response('error',
                                           'User with this email already exists')), 400

        user_vo = UserVO()
        user_vo.user_name = user_name
        user_vo.user_email = user_email
        user_vo.user_password = hash_password(user_password)
        user_vo.user_phone = user_phone
        user_vo.user_address = user_address
        user_vo.user_role = 'user'
        user_vo.user_profile_picture = profile_picture_filename

        user_id = user_dao.insert_user(user_vo)
        return jsonify(
            format_response('success', 'User registered successfully',
                            {'user_id': user_id})), 201

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        if not all(field in data for field in ['user_email', 'user_password']):
            return jsonify(format_response('error',
                                           'Email and password are required')), 400

        user_vo = UserDAO().get_user_by_email(data['user_email'])
        if not user_vo or user_vo.user_password != hash_password(
                data['user_password']):
            return jsonify(
                format_response('error', 'Invalid email or password')), 401

        if not user_vo.is_active:
            return jsonify(
                format_response('error', 'Account is deactivated')), 401

        token = generate_token(user_vo.user_id, user_vo.user_role)
        user_data = user_vo.as_dict()
        if user_data['user_profile_picture']:
            user_data[
                'user_profile_picture'] = f"/static/{folder_name}/{user_data['user_profile_picture']}"
        else:
            user_data['user_profile_picture'] = None

        return jsonify(format_response('success', 'Login successful',
                                       {'token': token,
                                        'user': user_data})), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    try:
        user_vo = UserDAO().get_user_by_id(current_user['user_id'])
        if not user_vo:
            return jsonify(format_response('error', 'User not found')), 404

        user_data = user_vo.as_dict()
        if user_data['user_profile_picture']:
            user_data[
                'user_profile_picture'] = f"/static/{folder_name}/{user_data['user_profile_picture']}"
        else:
            user_data['user_profile_picture'] = None

        return jsonify(
            format_response('success', 'Profile retrieved', user_data)), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    try:
        user_vo = UserDAO().get_user_by_id(current_user['user_id'])
        if not user_vo:
            return jsonify(format_response('error', 'User not found')), 404

        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form
            if 'user_name' in data:
                user_vo.user_name = data['user_name']
            if 'user_phone' in data:
                phone = data['user_phone']
                if not validate_phone(phone):
                    return jsonify(format_response('error',
                                                   'Invalid phone number format')), 400
                user_vo.user_phone = phone
            if 'user_address' in data:
                user_vo.user_address = data['user_address']

            # Handle profile picture removal
            if 'remove_profile_picture' in data and data['remove_profile_picture'] == 'true':
                # Delete old picture if exists
                if user_vo.user_profile_picture:
                    old_path = f"base/static/{folder_name}/{user_vo.user_profile_picture}"
                    if os.path.exists(old_path):
                        os.remove(old_path)
                user_vo.user_profile_picture = None

            profile_picture = request.files.get('user_profile_picture')
            if profile_picture and profile_picture.filename != '':
                filename, _ = save_uploaded_file(profile_picture, folder_name)
                if filename:
                    # Delete old picture if exists
                    if user_vo.user_profile_picture:
                        old_path = f"base/static/{folder_name}/{user_vo.user_profile_picture}"
                        if os.path.exists(old_path):
                            os.remove(old_path)
                    user_vo.user_profile_picture = filename

        else:
            data = request.get_json()
            if 'user_name' in data:
                user_vo.user_name = data['user_name']
            if 'user_phone' in data:
                if not validate_phone(data['user_phone']):
                    return jsonify(format_response('error',
                                                   'Invalid phone number format')), 400
                user_vo.user_phone = data['user_phone']
            if 'user_address' in data:
                user_vo.user_address = data['user_address']
            if 'user_profile_picture' in data:
                user_vo.user_profile_picture = data['user_profile_picture']
            # Handle profile picture removal via JSON
            if 'remove_profile_picture' in data and data['remove_profile_picture'] == True:
                # Delete old picture if exists
                if user_vo.user_profile_picture:
                    old_path = f"base/static/{folder_name}/{user_vo.user_profile_picture}"
                    if os.path.exists(old_path):
                        os.remove(old_path)
                user_vo.user_profile_picture = None

        UserDAO().update_user(user_vo)
        
        # Return updated user data
        user_data = user_vo.as_dict()
        if user_data['user_profile_picture']:
            user_data['user_profile_picture'] = f"/static/{folder_name}/{user_data['user_profile_picture']}"
        else:
            user_data['user_profile_picture'] = None
            
        return jsonify(
            format_response('success', 'Profile updated successfully', user_data)), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    try:
        data = request.get_json()
        if not all(field in data for field in
                   ['current_password', 'new_password']):
            return jsonify(format_response('error',
                                           'Current and new password are required')), 400

        is_valid, message = validate_password(data['new_password'])
        if not is_valid:
            return jsonify(format_response('error', message)), 400

        user_vo = UserDAO().get_user_by_id(current_user['user_id'])
        if not user_vo:
            return jsonify(format_response('error', 'User not found')), 404

        if user_vo.user_password != hash_password(data['current_password']):
            return jsonify(
                format_response('error', 'Current password is incorrect')), 400

        user_vo.user_password = hash_password(data['new_password'])
        UserDAO().update_user(user_vo)
        return jsonify(
            format_response('success', 'Password changed successfully')), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    try:
        all_users = UserDAO().get_all_users()
        regular_users = [user for user in all_users if
                         user.user_role == 'user']

        users_data = []
        for user in regular_users:
            user_data = user.as_dict()
            if user_data['user_profile_picture']:
                user_data[
                    'user_profile_picture'] = f"/static/{folder_name}/{user_data['user_profile_picture']}"
            else:
                user_data['user_profile_picture'] = None
            users_data.append(user_data)

        return jsonify(
            format_response('success', 'Users retrieved', users_data)), 200

    except Exception as e:
        return jsonify(format_response('error', str(e))), 500
