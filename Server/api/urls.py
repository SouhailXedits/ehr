from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DoctorViewSet, PatientViewSet, AppointmentViewSet,
    getAppointmentDoc, getAppointmentPat, getCount, clear,
    BlockchainAuthView
)

router = DefaultRouter()
router.register(r'doctor', DoctorViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'appointment', AppointmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('getAppointmentDoc/<int:id>', getAppointmentDoc),
    path('getAppointmentPat/<int:id>', getAppointmentPat),
    path('getCount', getCount),
    path('clear', clear),
    path('api-auth/', include('rest_framework.urls')),
    path('auth/authenticate/', BlockchainAuthView.as_view(), name='authenticate'),
]
