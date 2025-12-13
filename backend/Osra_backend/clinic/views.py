from django.shortcuts import render

from rest_framework.viewsets import ModelViewSet
from .models import *
from .serializers import *

class PatientViewSet(ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class DentistViewSet(ModelViewSet):
    queryset = Dentist.objects.all()
    serializer_class = DentistSerializer

class AppointmentViewSet(ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
