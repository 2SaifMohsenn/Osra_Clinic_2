from django.contrib import admin
from .models import *

admin.site.register(Patient)
admin.site.register(Dentist)
admin.site.register(Appointment)
admin.site.register(Treatment)
admin.site.register(Drug)
admin.site.register(MedicalRecord)
admin.site.register(AppointmentTreatment)
admin.site.register(TreatmentDrug)
admin.site.register(Invoice)
admin.site.register(Payment)

