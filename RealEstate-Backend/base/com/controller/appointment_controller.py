from datetime import datetime

from flask import request, jsonify

from base import app
from base.com.dao.appointment_dao import AppointmentDAO
from base.com.vo.appointment_vo import AppointmentVO
from base.utils.decorators import token_required
from base.utils.helpers import format_response


@app.route('/api/appointments', methods=['POST'])
@token_required
def create_appointment(current_user):
    try:
        data = request.get_json()
        required_fields = ['property_id', 'seller_id', 'appointment_date',
                           'appointment_time']
        if not all(field in data for field in required_fields):
            return jsonify(format_response('error',
                                           'Property ID, seller ID, date and time are required')), 400

        appointment_dao = AppointmentDAO()
        conflict = appointment_dao.check_appointment_conflict(
            data['property_id'], data['appointment_date'],
            data['appointment_time'])

        if conflict:
            return jsonify(format_response('error',
                                           'This time slot is already booked for the property')), 400

        appointment_vo = AppointmentVO()
        appointment_vo.buyer_id = current_user['user_id']
        appointment_vo.seller_id = data['seller_id']
        appointment_vo.property_id = data['property_id']
        appointment_vo.appointment_date = datetime.strptime(
            data['appointment_date'], '%Y-%m-%d').date()
        appointment_vo.appointment_time = datetime.strptime(
            data['appointment_time'], '%H:%M').time()
        appointment_vo.message = data.get('message', '')

        appointment_id = appointment_dao.insert_appointment(appointment_vo)
        return jsonify(
            format_response('success', 'Appointment scheduled successfully',
                            {'appointment_id': appointment_id})), 201
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/appointments', methods=['GET'])
@token_required
def get_my_appointments(current_user):
    try:
        appointment_dao = AppointmentDAO()
        buyer_appointments = appointment_dao.get_appointments_by_buyer_id(
            current_user['user_id'])
        seller_appointments = appointment_dao.get_appointments_by_seller_id(
            current_user['user_id'])

        appointments = []

        for appointment_vo, seller_vo, property_vo in buyer_appointments:
            appointment_data = appointment_vo.as_dict()
            appointment_data['type'] = 'buyer'
            appointment_data['other_party_name'] = seller_vo.user_name
            appointment_data['property_title'] = property_vo.property_title
            appointments.append(appointment_data)

        for appointment_vo, buyer_vo, property_vo in seller_appointments:
            appointment_data = appointment_vo.as_dict()
            appointment_data['type'] = 'seller'
            appointment_data['other_party_name'] = buyer_vo.user_name
            appointment_data['property_title'] = property_vo.property_title
            appointments.append(appointment_data)

        return jsonify(
            format_response('success', 'My appointments', appointments)), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['GET'])
@token_required
def get_appointment(current_user, appointment_id):
    try:
        appointment_dao = AppointmentDAO()
        appointment_vo = appointment_dao.get_appointment_by_id(appointment_id)

        if not appointment_vo:
            return jsonify(
                format_response('error', 'Appointment not found')), 404

        if appointment_vo.buyer_id != current_user[
            'user_id'] and appointment_vo.seller_id != current_user['user_id']:
            return jsonify(format_response('error',
                                           'Unauthorized to view this appointment')), 403

        return jsonify(format_response('success', 'Appointment retrieved',
                                       appointment_vo.as_dict())), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
@token_required
def update_appointment_status(current_user, appointment_id):
    try:
        data = request.get_json()
        if 'status' not in data:
            return jsonify(format_response('error', 'Status is required')), 400

        appointment_dao = AppointmentDAO()
        appointment_vo = appointment_dao.get_appointment_by_id(appointment_id)

        if not appointment_vo:
            return jsonify(
                format_response('error', 'Appointment not found')), 404

        if current_user['user_role'] == 'admin' and current_user[
            'user_id'] == appointment_vo.seller_id:
            if data['status'] in ['confirmed', 'cancelled']:
                success = appointment_dao.update_appointment_status(
                    appointment_id, data['status'])
            else:
                return jsonify(format_response('error',
                                               'Invalid status update for admin/seller')), 400
        elif current_user['user_id'] == appointment_vo.buyer_id:
            if data['status'] == 'cancelled':
                success = appointment_dao.update_appointment_status(
                    appointment_id, data['status'])
            else:
                return jsonify(format_response('error',
                                               'Buyer can only cancel appointments')), 400
        else:
            return jsonify(format_response('error',
                                           'Unauthorized to update this appointment')), 403

        if success:
            return jsonify(format_response('success',
                                           f'Appointment {data["status"]} successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to update appointment')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@token_required
def delete_appointment(current_user, appointment_id):
    try:
        appointment_dao = AppointmentDAO()
        appointment_vo = appointment_dao.get_appointment_by_id(appointment_id)

        if not appointment_vo:
            return jsonify(
                format_response('error', 'Appointment not found')), 404

        if appointment_vo.buyer_id != current_user['user_id']:
            return jsonify(format_response('error',
                                           'Unauthorized to delete this appointment')), 403

        if appointment_vo.appointment_status != 'pending':
            return jsonify(format_response('error',
                                           'Only pending appointments can be deleted')), 400

        success = appointment_dao.delete_appointment(appointment_id)

        if success:
            return jsonify(format_response('success',
                                           'Appointment deleted successfully')), 200
        else:
            return jsonify(
                format_response('error', 'Failed to delete appointment')), 500
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500


@app.route('/api/appointments/today', methods=['GET'])
@token_required
def get_todays_appointments(current_user):
    try:
        appointment_dao = AppointmentDAO()
        appointments = appointment_dao.get_todays_appointments(
            current_user['user_id'])
        return jsonify(format_response('success', "Today's appointments",
                                       [appointment.as_dict() for appointment
                                        in appointments])), 200
    except Exception as e:
        return jsonify(format_response('error', str(e))), 500
