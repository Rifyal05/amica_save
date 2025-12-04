import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from flask import Blueprint, request, jsonify
from ..models import User
from ..database import db
from flask_bcrypt import Bcrypt
import jwt
from datetime import datetime, timedelta, timezone
import os
import uuid
import secrets

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

cred_path = 'serviceAccountKey.json'
if not firebase_admin._apps:
    try:
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
    except Exception:
        pass

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body tidak valid"}), 400
        
        if not all(key in data for key in ['email', 'password', 'username', 'display_name']):
            return jsonify({"error": "Semua field (display_name, username, email, password) harus diisi"}), 400

        email = data.get('email').lower()
        username = data.get('username').lower()

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email sudah terdaftar"}), 409

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username sudah digunakan"}), 409

        hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')

        new_user = User(
            id=uuid.uuid4(),# type: ignore
            email=email,# type: ignore
            username=username,# type: ignore
            password_hash=hashed_password,# type: ignore
            display_name=data.get('display_name'),# type: ignore
            role='user'# type: ignore
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Terjadi kesalahan di server", "details": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email dan password harus diisi"}), 400
    
    email = data.get('email').lower()
    user = User.query.filter_by(email=email).first()
    
    if not user or not bcrypt.check_password_hash(user.password_hash, data.get('password')):
        return jsonify({"error": "Email atau password salah"}), 401
    
    secret_key = os.environ.get('SECRET_KEY')
    if not secret_key:
        return jsonify({"error": "Konfigurasi server bermasalah (SECRET_KEY missing)"}), 500

    token = jwt.encode({
        'user_id': str(user.id),
        'exp': datetime.now(timezone.utc) + timedelta(days=30)
    }, secret_key, algorithm="HS256")
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user.id),
            "display_name": user.display_name,
            "username": user.username,
            "avatar_url": user.avatar_url
        }
    }), 200

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token tidak ditemukan'}), 400

        try:
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token['uid']
            email = decoded_token['email']
            name = decoded_token.get('name', 'User')
            picture = decoded_token.get('picture', '')
        except Exception:
            return jsonify({'error': 'Token Google tidak valid'}), 401

        user = User.query.filter((User.google_uid == uid) | (User.email == email)).first()

        if user:
            updated = False
            if not user.google_uid:
                user.google_uid = uid
                user.auth_provider = 'google'
                updated = True
            if not user.avatar_url and picture:
                user.avatar_url = picture
                updated = True
            
            if updated:
                db.session.commit()
        else:
            base_username = email.split('@')[0]
            clean_username = "".join(c for c in base_username if c.isalnum() or c == '_')[:20]
            
            final_username = clean_username
            counter = 1
            while User.query.filter_by(username=final_username).first():
                final_username = f"{clean_username}{counter}"
                counter += 1

            random_password = secrets.token_urlsafe(16)
            hashed_password = bcrypt.generate_password_hash(random_password).decode('utf-8')

            user = User(
                id=uuid.uuid4(),# type: ignore
                email=email,# type: ignore
                username=final_username,# type: ignore
                display_name=name,# type: ignore
                password_hash=hashed_password,# type: ignore
                google_uid=uid,# type: ignore
                auth_provider='google',# type: ignore
                avatar_url=picture,# type: ignore
                role='user' # type: ignore
            )
            db.session.add(user)
            db.session.commit()

        secret_key = os.environ.get('SECRET_KEY')
        if not secret_key:
            return jsonify({"error": "Konfigurasi server bermasalah (SECRET_KEY missing)"}), 500

        jwt_token = jwt.encode({
            'user_id': str(user.id),
            'exp': datetime.now(timezone.utc) + timedelta(days=30)
        }, secret_key, algorithm="HS256")

        return jsonify({
            "message": "Google login successful",
            "token": jwt_token,
            "user": {
                "id": str(user.id),
                "display_name": user.display_name,
                "username": user.username,
                "avatar_url": user.avatar_url
            }
        }), 200

    except Exception as e:
        return jsonify({"error": "Terjadi kesalahan server", "details": str(e)}), 500
    
@auth_bp.route('/logout', methods=['POST', 'GET'])
def logout():
    return jsonify({"message": "Logout berhasil"}), 200