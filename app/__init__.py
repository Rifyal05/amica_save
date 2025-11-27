from flask import Flask, jsonify
from .config import Config
from .database import db
from .routes.auth_routes import auth_bp, bcrypt
from .routes.post_routes import post_bp
from .routes.sdq_routes import sdq_bp
from .routes.web_routes import web_bp
from .routes.test_routes import test_bp
from .routes.comment_routes import comment_bp 
from .routes.user_routes import user_bp
from .routes.feedback_routes import feedback_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    bcrypt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(post_bp, url_prefix='/api/posts')
    app.register_blueprint(sdq_bp, url_prefix='/api/sdq')
    app.register_blueprint(test_bp, url_prefix='/api/test')
    app.register_blueprint(comment_bp, url_prefix='/api/comments') 
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(web_bp, url_prefix='/')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')

        
    return app