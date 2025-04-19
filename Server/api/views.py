from dataclasses import dataclass
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from api.models import Appointment, Doctor, Patient
from .serializers import AppointmentSerializer, DoctorSerializer, PatientSerializer
from rest_framework import viewsets
from web3 import Web3
import json

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
    def post(self, request):

        doctor = Doctor.objects.get(docID=request.data.get('docID'))
        patient = Patient.objects.get(patID=request.data.get('patID'))

        request.data._mutable = True
        request.data['docName'] = doctor.fName + ' ' + doctor.lName
        request.data['patName'] = patient.patName
        request.data._mutable = False

        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "error", "data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        appointments = Appointment.objects.all()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response({"status": "success", "data": serializer.data}, status.HTTP_200_OK)

    def put(self, request, id):
        appointment = Appointment.objects.get(id=id)
        appointment.status = True
        appointment.save()
        return Response({"status": "success", "data": appointment.status}, status.HTTP_200_OK)


@api_view(['GET'])
def getAppointmentDoc(self, id):

    appointment = Appointment.objects.filter(docID=id)
    serializer = AppointmentSerializer(appointment, many=True)
    return Response({"status": "success", "data": serializer.data}, status.HTTP_200_OK)


@api_view(['GET'])
def getAppointmentPat(self, id):

    appointment = Appointment.objects.filter(patID=id)
    serializer = AppointmentSerializer(appointment, many=True)
    return Response({"status": "success", "data": serializer.data}, status.HTTP_200_OK)


@api_view(['GET'])
def getCount(self):
    doctorCount = Doctor.objects.all().count()
    patientCount = Patient.objects.all().count()
    return Response({"status": "success", "docCount": doctorCount, "patCount": patientCount}, status.HTTP_200_OK)


@api_view(['GET'])
def clear(self):
    Doctor.objects.all().delete()
    Appointment.objects.alias().delete()
    Patient.objects.alias().delete()

    return Response({"status": "success"}, status.HTTP_200_OK)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

@api_view(['GET'])
def getAppointmentDoc(request, id):
    appointments = Appointment.objects.filter(docID=id)
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getAppointmentPat(request, id):
    appointments = Appointment.objects.filter(patID=id)
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

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

class BlockchainAuthView(APIView):
    def post(self, request):
        try:
            address = request.data.get('address')
            signature = request.data.get('signature')
            
            if not address or not signature:
                return Response(
                    {"error": "Address and signature are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify the signature (this is a basic implementation)
            # In a production environment, you would want to implement proper signature verification
            message = "Sign this message to authenticate with EHR system"
            
            # For now, we'll just check if the address is valid
            if not Web3.is_address(address):
                return Response(
                    {"error": "Invalid Ethereum address"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user exists in our system
            # For now, we'll just return a success response
            return Response({
                "token": "dummy-token",  # In production, generate a proper JWT token
                "user": {
                    "address": address,
                    "role": "user"  # Default role
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
