import datetime
import hashlib
import os
import uuid

import jwt
from werkzeug.utils import secure_filename

from base import SECRET_KEY

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def hash_password(password):
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(user_id, user_role):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'user_role': user_role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least one number"
    if not any(char.isupper() for char in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(char.islower() for char in password):
        return False, "Password must contain at least one lowercase letter"
    return True, "Password is valid"


def format_response(status, message, data=None):
    """Format API response"""
    response = {'status': status, 'message': message}
    if data is not None:
        response['data'] = data
    return response


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[
        1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_file(file, folder_name):
    """
    Save file into base/static/<folder_name>/ with unique filename.
    Returns (unique_filename, folder_path)
    """
    if not file or file.filename == "":
        return None, None
    if not allowed_file(file.filename):
        return None, None

    folder_path = f"base/static/{folder_name}/"
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    original_filename = secure_filename(file.filename)
    ext = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file.save(os.path.join(folder_path, unique_filename))
    return unique_filename, folder_path


def format_property_images(image_list, folder_name):
    """Return full URL paths for images"""
    if not image_list:
        return []
    return [f"/static/{folder_name}/{img}" for img in image_list]
