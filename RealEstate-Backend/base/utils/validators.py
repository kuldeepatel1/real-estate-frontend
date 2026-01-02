import re


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^[0-9]{10}$'
    return bool(re.match(pattern, phone))


def validate_rating(rating):
    """Validate rating (1-5)"""
    try:
        rating = int(rating)
        return 1 <= rating <= 5
    except:
        return False


def validate_price(price):
    """Validate price is positive"""
    try:
        price = float(price)
        return price > 0
    except:
        return False


def validate_bedrooms(bedrooms):
    """Validate bedrooms count"""
    try:
        bedrooms = int(bedrooms)
        return bedrooms >= 0
    except:
        return False


def validate_bathrooms(bathrooms):
    """Validate bathrooms count"""
    try:
        bathrooms = int(bathrooms)
        return bathrooms >= 0
    except:
        return False
