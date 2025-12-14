from django.db import models


class Patient(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    # password = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Dentist(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name}"


class Treatment(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField()
    cost = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return self.name


class Drug(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField()
    dosage = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=50)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.patient} - {self.appointment_date}"


class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True)
    diagnosis = models.TextField()
    prescribed_drugs = models.TextField()
    treatment_notes = models.TextField()
    record_date = models.DateTimeField(auto_now_add=True)

class AppointmentTreatment(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    treatment = models.ForeignKey(Treatment, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    notes = models.TextField(blank=True)

    def subtotal(self):
        return self.quantity * self.treatment.cost

class TreatmentDrug(models.Model):
    treatment = models.ForeignKey(Treatment, on_delete=models.CASCADE)
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    dosage_used = models.CharField(max_length=100)


class Invoice(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE)
    date_issued = models.DateField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=50)


class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    payment_date = models.DateField(auto_now_add=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)




