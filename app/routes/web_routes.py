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
    return render_template('test/test_moderation_page.html')

@web_bp.route('/guidebook')
def guidebook_page():
    return render_template('mainpage/guidebook.html')

@web_bp.route('/guidebook/<int:article_id>')
def article_detail(article_id):
    # Nanti di sini kita ambil data dari DB: Article.query.get(article_id)
    return render_template('mainpage/article_detail.html')

@web_bp.route('/chat')
def chat_page():
    return render_template('mainpage/chat.html')

@web_bp.route('/notifications')
def notifications_page():
    return render_template('mainpage/notifications.html')

@web_bp.route('/discover')
def discover_page():
    return render_template('mainpage/discover.html')