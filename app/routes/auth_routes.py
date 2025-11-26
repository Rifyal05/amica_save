from flask import Blueprint, request, jsonify
from ..models import User
from ..database import db
from flask_bcrypt import Bcrypt
import jwt
from datetime import datetime, timedelta, timezone
import os

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            print("Error: Request body kosong atau bukan JSON.")
            return jsonify({"error": "Request body tidak valid"}), 400
        
        print(f"Data yang diterima: {data}")

        if not all(key in data for key in ['email', 'password', 'username', 'display_name']):
            print("Error: Field yang dibutuhkan kurang.")
            return jsonify({"error": "Semua field (display_name, username, email, password) harus diisi"}), 400

        email = data.get('email').lower()
        username = data.get('username').lower()

        if User.query.filter_by(email=email).first():
            print(f"Error: Email {email} sudah ada.")
            return jsonify({"error": "Email sudah terdaftar"}), 409

        if User.query.filter_by(username=username).first():
            print(f"Error: Username {username} sudah ada.")
            return jsonify({"error": "Username sudah digunakan"}), 409

        hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')

        new_user = User(
            email=email, # type: ignore
            username=username, # type: ignore
            password_hash=hashed_password, # type: ignore
            display_name=data.get('display_name') # type: ignore
        )
        
        print("Mencoba menyimpan user baru ke database...")
        db.session.add(new_user)
        db.session.commit()
        
        print("User berhasil didaftarkan!")
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"!!! TERJADI EXCEPTION DI ENDPOINT REGISTER: {str(e)}")
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
    
    token = jwt.encode({
        'user_id': str(user.id),
        'exp': datetime.now(timezone.utc) + timedelta(days=30)
    }, os.environ.get('SECRET_KEY'), algorithm="HS256")
    
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