from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *  # import your viewsets and additional views here

# Create the router and register your viewsets
router = DefaultRouter()
router.register("patients", PatientViewSet)
router.register("dentists", DentistViewSet)
router.register("appointments", AppointmentViewSet)
router.register("appointment-treatments", AppointmentTreatmentViewSet)
router.register("treatment-drugs", TreatmentDrugViewSet)
router.register("invoices", InvoiceViewSet)
router.register("payments", PaymentViewSet)

urlpatterns = router.urls + [
	path('process/ocr/', ocr_process_view, name='process-ocr'),
	path('process/acr/', acr_process_view, name='process-acr'),
	path('process/nlp/', nlp_process_view, name='process-nlp'),
]
