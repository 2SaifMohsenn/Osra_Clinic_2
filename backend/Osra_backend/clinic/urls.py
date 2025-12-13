from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *  # import your viewsets here

# Create the router and register your viewsets
router = DefaultRouter()
router.register("patients", PatientViewSet)
router.register("dentists", DentistViewSet)
router.register("appointments", AppointmentViewSet)
router.register("appointment-treatments", AppointmentTreatmentViewSet)
router.register("treatment-drugs", TreatmentDrugViewSet)
router.register("invoices", InvoiceViewSet)
router.register("payments", PaymentViewSet)

# Use router.urls as urlpatterns
urlpatterns = router.urls
