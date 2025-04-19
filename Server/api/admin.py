from django.contrib import admin

# Register your models here.
from .models import Appointment, Doctor, Patient, BlockchainUser

admin.site.register(Doctor)
admin.site.register(Patient)
admin.site.register(Appointment)
admin.site.register(BlockchainUser)