from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register("patients", PatientViewSet)
router.register("dentists", DentistViewSet)
router.register("appointments", AppointmentViewSet)
router.register("appointment-treatments", AppointmentTreatmentViewSet)
router.register("treatment-drugs", TreatmentDrugViewSet)
router.register("invoices", InvoiceViewSet)
router.register("payments", PaymentViewSet)
router.register("medicalrecords", MedicalRecordViewSet)
router.register("admins", AdminViewSet)

urlpatterns = router.urls + [
    # 🔹 Signup APIs
    path("signup/patient/", patient_signup, name="patient-signup"),
    path("signup/dentist/", dentist_signup, name="dentist-signup"),
    path("auth/login/", login_view, name="login"),
    path("patients/<int:pk>/change_password/", change_patient_password, name="change-patient-password"),
    path("dentists/<int:pk>/change_password/", change_dentist_password, name="change-dentist-password"),
    path("admins/<int:pk>/change_password/", change_admin_password, name="change-admin-password"),

    # 🔹 Existing processing APIs
    path("process/ocr/", ocr_process_view, name="process-ocr"),
    path("process/acr/", acr_process_view, name="process-acr"),
    path("process/nlp/", nlp_process_view, name="process-nlp"),
]
