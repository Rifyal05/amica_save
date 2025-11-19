from flask import Blueprint, render_template

web_bp = Blueprint('web', __name__)

@web_bp.route('/')
@web_bp.route('/login')
def login_page():
    return render_template('auth/login.html')

@web_bp.route('/register')
def register_page():
    return render_template('auth/register.html')

@web_bp.route('/forgot-password')
def forgot_password_page():
    return render_template('auth/forgot-password.html')

@web_bp.route('/feed')
def feed_page():
    return render_template('mainpage/feed.html')

@web_bp.route('/test-moderation')
def test_page():
    return render_template('test/test_page.html')