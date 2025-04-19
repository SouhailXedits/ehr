import random
from datetime import datetime, timedelta
from api.models import Doctor, Patient, Appointment

# Clear existing data
print("Clearing existing data...")
Doctor.objects.all().delete()
Patient.objects.all().delete()
Appointment.objects.all().delete()

# Create doctors
print("Creating doctors...")
doctors = [
    {
        'docID': 'DOC001',
        'fName': 'John',
        'lName': 'Smith',
        'emailID': 'john.smith@example.com',
        'city': 'New York',
        'state': 'NY',
        'department': 'Cardiology',
        'Doj': '2020-01-15'
    },
    {
        'docID': 'DOC002',
        'fName': 'Sarah',
        'lName': 'Johnson',
        'emailID': 'sarah.johnson@example.com',
        'city': 'Los Angeles',
        'state': 'CA',
        'department': 'Neurology',
        'Doj': '2019-05-20'
    },
    {
        'docID': 'DOC003',
        'fName': 'Robert',
        'lName': 'Williams',
        'emailID': 'robert.williams@example.com',
        'city': 'Chicago',
        'state': 'IL',
        'department': 'Orthopedics',
        'Doj': '2021-03-10'
    },
    {
        'docID': 'DOC004',
        'fName': 'Emily',
        'lName': 'Brown',
        'emailID': 'emily.brown@example.com',
        'city': 'Houston',
        'state': 'TX',
        'department': 'Pediatrics',
        'Doj': '2018-07-05'
    },
    {
        'docID': 'DOC005',
        'fName': 'Michael',
        'lName': 'Davis',
        'emailID': 'michael.davis@example.com',
        'city': 'Boston',
        'state': 'MA',
        'department': 'Dermatology',
        'Doj': '2020-09-15'
    }
]

doctor_objects = []
for doctor_data in doctors:
    doctor = Doctor.objects.create(**doctor_data)
    doctor_objects.append(doctor)

# Create patients
print("Creating patients...")
patients = [
    {
        'patID': 'PAT001',
        'patName': 'James Wilson',
    },
    {
        'patID': 'PAT002',
        'patName': 'Emma Davis',
    },
    {
        'patID': 'PAT003',
        'patName': 'Alex Johnson',
    },
    {
        'patID': 'PAT004',
        'patName': 'Olivia Martinez',
    },
    {
        'patID': 'PAT005',
        'patName': 'Daniel Thompson',
    },
    {
        'patID': 'PAT006',
        'patName': 'Sophia Anderson',
    },
    {
        'patID': 'PAT007',
        'patName': 'William Taylor',
    },
    {
        'patID': 'PAT008',
        'patName': 'Isabella Clark',
    }
]

patient_objects = []
for patient_data in patients:
    patient = Patient.objects.create(**patient_data)
    patient_objects.append(patient)

# Create appointments
print("Creating appointments...")

# Generate dates in the next 30 days
today = datetime.now().date()
appointment_dates = [(today + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, 31)]

# Time slots in 24-hour format
time_slots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
]

# Display time slots for UI
display_time_slots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
]

appointments = []

# Create 20 random appointments
for i in range(1, 21):
    doctor = random.choice(doctor_objects)
    patient = random.choice(patient_objects)
    appointment_date = random.choice(appointment_dates)
    time_index = random.randint(0, len(time_slots) - 1)
    
    appointment = Appointment.objects.create(
        date=appointment_date,
        department=doctor.department,
        docID=doctor.docID,
        docName=f"{doctor.fName} {doctor.lName}",
        patID=patient.patID,
        patName=patient.patName,
        time=time_slots[time_index],  # Use 24-hour format for database
        status=random.choice([True, True, True, False])  # 75% chance of active appointments
    )
    appointments.append(appointment)

# Create a few specific appointments for testing
for i, doctor in enumerate(doctor_objects[:3]):
    patient = patient_objects[i]
    appointment_date = (today + timedelta(days=i+1)).strftime('%Y-%m-%d')
    
    appointment = Appointment.objects.create(
        date=appointment_date,
        department=doctor.department,
        docID=doctor.docID,
        docName=f"{doctor.fName} {doctor.lName}",
        patID=patient.patID,
        patName=patient.patName,
        time='10:00',  # Use 24-hour format for database
        status=True
    )
    appointments.append(appointment)

# Print summary
print(f"Successfully created {len(doctor_objects)} doctors")
print(f"Successfully created {len(patient_objects)} patients")
print(f"Successfully created {len(appointments)} appointments") 