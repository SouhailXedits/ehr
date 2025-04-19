from sqlite3 import Date, Time
from xmlrpc.client import DateTime
from django.db import models
from django.forms import CharField, DateField, TimeField
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

# Create your models here.

class BlockchainUser(AbstractUser):
    address = models.CharField(max_length=42, unique=True, help_text=_('Ethereum wallet address'))
    nonce = models.CharField(max_length=100, help_text=_('Random nonce for signature verification. Automatically generated.'), default='')
    role = models.CharField(max_length=20, choices=[
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient')
    ], default='patient')
    last_login = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Blockchain User')
        verbose_name_plural = _('Blockchain Users')

    def __str__(self):
        return f"{self.username} ({self.address})"

    def generate_nonce(self):
        """Generate a new nonce for signature verification"""
        import secrets
        self.nonce = secrets.token_hex(32)
        self.save()
        return self.nonce

class Doctor(models.Model):
    docID = models.CharField(max_length=100, unique=True)
    fName = models.CharField(max_length=100)
    lName = models.CharField(max_length=100)
    address = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.fName} {self.lName}"

class Patient(models.Model):
    patID = models.CharField(max_length=100, unique=True)
    patName = models.CharField(max_length=100)
    address = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.patName

class Appointment(models.Model):
    docID = models.CharField(max_length=100)
    docName = models.CharField(max_length=100)
    patID = models.CharField(max_length=100)
    patName = models.CharField(max_length=100)
    date = models.DateField()
    time = models.TimeField()
    status = models.BooleanField(default=False)
    patient_address = models.CharField(max_length=100, null=True, blank=True)
    blockchain_id = models.CharField(max_length=100, null=True, blank=True)
    blockchain_tx = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patName} - {self.docName} - {self.date} {self.time}"
