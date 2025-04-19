from dataclasses import field, fields
from pyexpat import model
from rest_framework import serializers
from .models import Appointment, Doctor, Patient, BlockchainUser

class DoctorSerializer(serializers.ModelSerializer):

  class Meta:
    model = Doctor
    fields = ('__all__')

class PatientSerializer(serializers.ModelSerializer):

  class Meta:
    model = Patient
    fields = ('__all__')

class AppointmentSerializer(serializers.ModelSerializer):

  class Meta:
    model = Appointment
    fields= ('__all__')

class BlockchainUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockchainUser
        fields = ['id', 'username', 'address', 'role', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'address', 'role']