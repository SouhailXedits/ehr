from dataclasses import dataclass
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from api.models import Appointment, Doctor, Patient, BlockchainUser
from .serializers import (
    AppointmentSerializer, DoctorSerializer, PatientSerializer,
    BlockchainUserSerializer
)
from rest_framework import viewsets
from web3 import Web3
import json
import logging
from django.core.cache import cache
from django.conf import settings
from eth_account.messages import encode_defunct
from eth_account import Account
import time
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .services.blockchain import BlockchainService
from datetime import datetime

logger = logging.getLogger(__name__)

# Create your views here.


class DoctorView(APIView):
    def post(self, request):
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "error", "data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None):
        print(id)
        if id:
            doctor = Doctor.objects.filter(docID=id)
            serializer = DoctorSerializer(doctor,many = True)
            print(serializer.data)
            return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        doctors = Doctor.objects.all()
        serializer = DoctorSerializer(doctors, many=True)
        return Response({"status": "success", "data": serializer.data}, status.HTTP_200_OK)

    def delete(self, request, id=None):
        doctor = Doctor.objects.filter(docID=id)
        doctor.delete()
        
        return Response({"status": "success", "data": True})


class PatientView(APIView):
    def post(self, request):
        serializer = PatientSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "error", "data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None):
        if id:
            patient = Patient.objects.filter(patID=id)
            serializer = PatientSerializer(patient, many=True)
            return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        patients = Patient.objects.all()
        serializer = PatientSerializer(patients, many=True)
        return Response({"status": "success", "data": serializer.data}, status.HTTP_200_OK)


class AppointmentView(APIView):
    blockchain_service = None

    def __init__(self):
        super().__init__()
        try:
            print("\n=== Initializing AppointmentView ===")
            self.blockchain_service = BlockchainService()
            print("=== AppointmentView Initialization Complete ===\n")
        except Exception as e:
            print(f"\n=== Error Initializing AppointmentView ===")
            print(f"Error: {str(e)}")
            print("==========================================\n")
            raise

    def post(self, request):
        try:
            doctor = Doctor.objects.get(docID=request.data.get('docID'))
            patient = Patient.objects.get(patID=request.data.get('patID'))

            # Get patient's blockchain address
            patient_address = request.data.get('patient_address')
            if not patient_address:
                logger.error("No patient blockchain address provided")
                return Response(
                    {"error": "Patient blockchain address is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if doctor has a blockchain address
            if not doctor.address:
                logger.error("No doctor blockchain address available")
                return Response(
                    {"error": "Doctor blockchain address is not set. Please update the doctor's blockchain address."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Convert date and time to timestamp
            appointment_date = request.data.get('date')
            appointment_time = request.data.get('time')
            timestamp = int(datetime.combine(
                datetime.strptime(appointment_date, '%Y-%m-%d').date(),
                datetime.strptime(appointment_time, '%H:%M').time()
            ).timestamp())

            logger.info(f"Creating appointment on blockchain with patient_address: {patient_address}, doctor_address: {doctor.address}, timestamp: {timestamp}")

            # Create appointment on blockchain
            blockchain_result = self.blockchain_service.create_appointment(
                patient_address=patient_address,
                doctor_address=doctor.address,
                timestamp=timestamp
            )

            logger.info(f"Blockchain result: {blockchain_result}")

            if not blockchain_result['success']:
                logger.error(f"Blockchain error: {blockchain_result['error']}")
                return Response(
                    {"error": f"Blockchain error: {blockchain_result['error']}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Create appointment in database
            appointment_data = request.data.copy()
            appointment_data['docName'] = doctor.fName + ' ' + doctor.lName
            appointment_data['patName'] = patient.patName
            appointment_data['blockchain_id'] = blockchain_result.get('appointment_id')
            appointment_data['blockchain_tx'] = blockchain_result['transaction_hash']

            serializer = AppointmentSerializer(data=appointment_data)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Appointment created successfully with blockchain_id: {blockchain_result.get('appointment_id')}")
                return Response({
                    "status": "success",
                    "data": serializer.data,
                    "blockchain": {
                        "id": blockchain_result.get('appointment_id'),
                        "transaction": blockchain_result['transaction_hash']
                    }
                }, status=status.HTTP_200_OK)
            else:
                logger.error(f"Serializer errors: {serializer.errors}")
                return Response({
                    "status": "error",
                    "data": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Doctor.DoesNotExist:
            return Response({
                "error": "Doctor not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Patient.DoesNotExist:
            return Response({
                "error": "Patient not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        appointments = Appointment.objects.all()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response({"status": "success", "data": serializer.data}, status.HTTP_200_OK)

    def put(self, request, id):
        try:
            appointment = Appointment.objects.get(id=id)
            doctor = Doctor.objects.get(docID=appointment.docID)

            # Check if doctor has a blockchain address
            if not doctor.address:
                logger.error("No doctor blockchain address available")
                return Response(
                    {"error": "Doctor blockchain address is not set. Please update the doctor's blockchain address."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update appointment status on blockchain
            blockchain_result = self.blockchain_service.complete_appointment(
                doctor_address=doctor.address,
                appointment_id=appointment.blockchain_id
            )

            if not blockchain_result['success']:
                return Response({
                    "error": f"Blockchain error: {blockchain_result['error']}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Update appointment in database
            appointment.status = True
            appointment.save()

            return Response({
                "status": "success",
                "data": {
                    "status": appointment.status,
                    "blockchain": {
                        "transaction": blockchain_result['transaction_hash']
                    }
                }
            }, status=status.HTTP_200_OK)

        except Appointment.DoesNotExist:
            return Response({
                "error": "Appointment not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Doctor.DoesNotExist:
            return Response({
                "error": "Doctor not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, id):
        try:
            appointment = Appointment.objects.get(id=id)
            patient = Patient.objects.get(patID=appointment.patID)

            # Check if patient has a blockchain address
            if not patient.address:
                logger.error("No patient blockchain address available")
                return Response(
                    {"error": "Patient blockchain address is not set. Please update the patient's blockchain address."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Cancel appointment on blockchain
            blockchain_result = self.blockchain_service.cancel_appointment(
                user_address=patient.address,
                appointment_id=appointment.blockchain_id
            )

            if not blockchain_result['success']:
                return Response({
                    "error": f"Blockchain error: {blockchain_result['error']}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Delete appointment from database
            appointment.delete()

            return Response({
                "status": "success",
                "data": True,
                "blockchain": {
                    "transaction": blockchain_result['transaction_hash']
                }
            }, status=status.HTTP_200_OK)

        except Appointment.DoesNotExist:
            return Response({
                "error": "Appointment not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Patient.DoesNotExist:
            return Response({
                "error": "Patient not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def getAppointmentDoc(request, id):
    appointments = Appointment.objects.filter(docID=id)
    serializer = AppointmentSerializer(appointments, many=True)
    return Response({"status": "success", "data": serializer.data}, status.HTTP_200_OK)


@api_view(['GET'])
def getAppointmentPat(request, id=None, pat_id=None):
    # If string ID is provided, use that
    patient_id = pat_id if pat_id is not None else id
    
    # Filter appointments by patID
    appointments = Appointment.objects.filter(patID=patient_id)
    serializer = AppointmentSerializer(appointments, many=True)
    return Response({"status": "success", "data": serializer.data}, status.HTTP_200_OK)


@api_view(['GET'])
def getCount(request):
    doctor_count = Doctor.objects.count()
    patient_count = Patient.objects.count()
    return Response({
        'doctor_count': doctor_count,
        'patient_count': patient_count
    })


@api_view(['POST'])
def clear(request):
    Doctor.objects.all().delete()
    Patient.objects.all().delete()
    Appointment.objects.all().delete()
    return Response({'message': 'All data cleared successfully'})


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    blockchain_service = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            print("\n=== Initializing AppointmentViewSet ===")
            self.blockchain_service = BlockchainService()
            print("=== AppointmentViewSet Initialization Complete ===\n")
        except Exception as e:
            print(f"\n=== Error Initializing AppointmentViewSet ===")
            print(f"Error: {str(e)}")
            print("==========================================\n")
            raise

    def create(self, request, *args, **kwargs):
        try:
            doctor = Doctor.objects.get(docID=request.data.get('docID'))
            patient = Patient.objects.get(patID=request.data.get('patID'))

            # Get patient's blockchain address
            patient_address = request.data.get('patient_address')
            if not patient_address:
                return Response(
                    {"error": "Patient blockchain address is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if doctor has a blockchain address
            if not doctor.address:
                return Response(
                    {"error": "Doctor blockchain address is not set. Please update the doctor's blockchain address."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Convert date and time to timestamp
            appointment_date = request.data.get('date')
            appointment_time = request.data.get('time')
            
            # Parse date and time
            appointment_datetime = datetime.combine(
                datetime.strptime(appointment_date, '%Y-%m-%d').date(),
                datetime.strptime(appointment_time, '%H:%M').time()
            )
            
            # Validate that appointment is in the future
            current_time = datetime.now()
            if appointment_datetime <= current_time:
                return Response(
                    {"error": "Appointment must be scheduled for a future date and time"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            timestamp = int(appointment_datetime.timestamp())

            print(f"\n=== Creating Blockchain Appointment ===")
            print(f"Patient Address: {patient_address}")
            print(f"Doctor Address: {doctor.address}")
            print(f"Timestamp: {timestamp}")
            print(f"Current Time: {int(current_time.timestamp())}")
            print(f"Appointment Time: {appointment_datetime}")

            # Create appointment on blockchain
            blockchain_result = self.blockchain_service.create_appointment(
                patient_address=patient_address,
                doctor_address=doctor.address,
                timestamp=timestamp
            )

            print(f"Blockchain Result: {blockchain_result}")

            if not blockchain_result['success']:
                return Response(
                    {"error": f"Blockchain error: {blockchain_result['error']}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Create appointment in database
            appointment_data = request.data.copy()
            appointment_data['docName'] = doctor.fName + ' ' + doctor.lName
            appointment_data['patName'] = patient.patName
            appointment_data['blockchain_id'] = blockchain_result.get('appointment_id')
            appointment_data['blockchain_tx'] = blockchain_result['transaction_hash']

            serializer = self.get_serializer(data=appointment_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            
            return Response({
                "status": "success",
                "data": serializer.data,
                "blockchain": {
                    "id": blockchain_result.get('appointment_id'),
                    "transaction": blockchain_result['transaction_hash']
                }
            }, status=status.HTTP_201_CREATED, headers=headers)

        except Doctor.DoesNotExist:
            return Response({
                "error": "Doctor not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Patient.DoesNotExist:
            return Response({
                "error": "Patient not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"\n=== Error Creating Appointment ===")
            print(f"Error: {str(e)}")
            print("==================================\n")
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BlockchainAuthView(APIView):
    authentication_classes = []  # No authentication required
    permission_classes = []  # No permissions required

    def post(self, request):
        try:
            address = request.data.get('address')
            signature = request.data.get('signature')
            
            if not address or not signature:
                return Response(
                    {"error": "Address and signature are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Normalize the address
            address = Web3.to_checksum_address(address)
            
            # Get or create user
            user, created = BlockchainUser.objects.get_or_create(
                address=address,
                defaults={
                    'username': f'user_{address[:8]}',
                    'is_active': True
                }
            )
            
            # Generate a new nonce if needed
            if not user.nonce:
                user.generate_nonce()
            
            # Verify the signature
            try:
                message = encode_defunct(text=f"Sign this message to authenticate with EHR system. Nonce: {user.nonce}")
                recovered_address = Account.recover_message(message, signature=signature)
                
                if recovered_address.lower() != address.lower():
                    logger.warning(f"Signature verification failed for address {address}")
                    return Response(
                        {"error": "Invalid signature"}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Exception as e:
                logger.error(f"Signature verification error: {str(e)}")
                return Response(
                    {"error": "Signature verification failed"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            # Update user's last login
            user.save()
            
            # Generate new nonce for next login
            user.generate_nonce()
            
            return Response({
                "token": access_token,
                "refresh": str(refresh),
                "user": BlockchainUserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return Response(
                {"error": "Authentication failed"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SessionVerificationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            if not isinstance(user, BlockchainUser):
                return Response(
                    {"error": "Invalid user type"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Check if the session is still valid
            if not user.is_active:
                return Response(
                    {"error": "User account is inactive"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Update last activity timestamp
            user.last_login = timezone.now()
            user.save()
            
            return Response({
                "user": BlockchainUserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Session verification error: {str(e)}")
            return Response(
                {"error": "Session verification failed"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GetNonceView(APIView):
    authentication_classes = []  # No authentication required
    permission_classes = []  # No permissions required

    def get(self, request, address):
        try:
            # Normalize the address
            address = Web3.to_checksum_address(address)
            
            # Get or create user
            user, created = BlockchainUser.objects.get_or_create(
                address=address,
                defaults={
                    'username': f'user_{address[:8]}',
                    'is_active': True
                }
            )
            
            # Generate a new nonce
            nonce = user.generate_nonce()
            
            return Response({'nonce': nonce}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating nonce: {str(e)}")
            return Response(
                {"error": "Failed to generate nonce"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
