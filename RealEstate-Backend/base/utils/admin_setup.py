from base.com.dao.user_dao import UserDAO
from base.com.vo.user_vo import UserVO
from base.utils.helpers import hash_password


def create_admin_user():
    try:
        user_dao = UserDAO()

        # Check if admin already exists
        existing_admin = user_dao.get_user_by_email('admin@gmail.com')

        if existing_admin:
            print("Admin user already exists!")
            return

        # Create admin user
        admin_vo = UserVO()
        admin_vo.user_name = "Admin"
        admin_vo.user_email = "admin@gmail.com"

        # Hash password
        password = 'admin@123'
        admin_vo.user_password = hash_password(password)

        admin_vo.user_role = 'admin'
        admin_vo.is_verified = True
        admin_vo.user_phone = "0000000000"

        user_dao.insert_user(admin_vo)
        print("Admin user created successfully!")

    except Exception as e:
        print(f"Error creating admin user: {str(e)}")


if __name__ == '__main__':
    create_admin_user()
