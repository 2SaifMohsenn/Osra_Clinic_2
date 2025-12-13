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

class AppointmentTreatmentViewSet(ModelViewSet):
    queryset = AppointmentTreatment.objects.all()
    serializer_class = AppointmentTreatmentSerializer

class TreatmentDrugViewSet(ModelViewSet):
    queryset = TreatmentDrug.objects.all()
    serializer_class = TreatmentDrugSerializer

class InvoiceViewSet(ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class PaymentViewSet(ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

