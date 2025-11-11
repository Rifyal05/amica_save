from flask import Blueprint, render_template

web_bp = Blueprint('web', __name__)

@web_bp.route('/')
@web_bp.route('/login')
def login_page():
    return render_template('login.html')

@web_bp.route('/register')
def register_page():
    return render_template('register.html')

@web_bp.route('/forgot-password')
def forgot_password_page():
    return render_template('forgot-password.html')

@web_bp.route('/feed')
def feed_page():
    return render_template('feed.html')

@web_bp.route('/test-moderation')
def test_page():
    return render_template('test_page.html')