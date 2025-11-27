# app/routes/user_routes.py

from flask import Blueprint, jsonify
from ..services.user_action_service import UserActionService
# Import dekorator otentikasi yang kamu miliki
from ..utils.decorators import token_required 
import uuid

user_bp = Blueprint('user', __name__, url_prefix='/api/user')
user_action_service = UserActionService()

# Helper function untuk konversi User object ke dictionary
def user_to_dict(user):
    # Pastikan ID dikonversi ke string karena UUID tidak diserialisasi oleh JSON secara default
    return {
        'id': str(user.id), 
        'username': user.username, 
        'display_name': user.display_name,
        'avatar_url': user.avatar_url,
    }

@user_bp.route('/block/<string:target_uuid>', methods=['POST'])
@token_required
# Menerima objek current_user dari dekorator
def handle_block_user(current_user, target_uuid): 
    try:
        # Kita ambil ID pengguna yang sedang login dari objek User
        blocker_id = current_user.id
        target_id = uuid.UUID(target_uuid)
    except ValueError:
        return jsonify({'error': 'Invalid UUID format for target user'}), 400

    success = user_action_service.block_user(blocker_id, target_id)
    
    if success:
        return jsonify({'message': 'User blocked successfully'}), 200
    if blocker_id == target_id:
        return jsonify({'error': 'Cannot block yourself'}), 400
        
    return jsonify({'error': 'Failed to process block request'}), 500


@user_bp.route('/unblock/<string:target_uuid>', methods=['POST'])
@token_required
# Menerima objek current_user dari dekorator
def handle_unblock_user(current_user, target_uuid): 
    try:
        blocker_id = current_user.id
        target_id = uuid.UUID(target_uuid)
    except ValueError:
        return jsonify({'error': 'Invalid UUID format for target user'}), 400
        
    success = user_action_service.unblock_user(blocker_id, target_id)
    
    if success:
        return jsonify({'message': 'User unblocked successfully'}), 200
    return jsonify({'error': 'User was not found in blocked list or failed to unblock'}), 404


@user_bp.route('/blocked_list', methods=['GET'])
@token_required
# Menerima objek current_user dari dekorator
def get_blocked_list(current_user): 
    blocker_id = current_user.id
    blocked_users = user_action_service.get_blocked_users(blocker_id)
    
    # Konversi list objek User ke JSON
    blocked_data = [user_to_dict(u) for u in blocked_users]
    
    return jsonify(blocked_data), 200