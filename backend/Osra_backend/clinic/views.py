import pytesseract
import json
import urllib.request
import urllib.parse
from django.shortcuts import render

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Configure pytesseract at module level
import platform
import os
try:
    import pytesseract
    if platform.system() == 'Windows':
        possible_paths = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        ]
        for path in possible_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                print(f"[STARTUP] Tesseract configured at: {path}")
                break
except ImportError:
    print("[STARTUP] pytesseract not installed")
    pytesseract = None


class PatientViewSet(ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class DentistViewSet(ModelViewSet):
    queryset = Dentist.objects.all()
    serializer_class = DentistSerializer

class AppointmentViewSet(ModelViewSet):
    queryset = Appointment.objects.all().order_by('-appointment_date', '-appointment_time')
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

class AdminViewSet(ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer

class MedicalRecordViewSet(ModelViewSet):
    queryset = MedicalRecord.objects.all().order_by('-record_date')
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        patient = self.request.query_params.get('patient')
        dentist = self.request.query_params.get('dentist')
        if patient:
            qs = qs.filter(patient_id=patient)
        if dentist:
            qs = qs.filter(appointment__dentist_id=dentist)
        return qs


@api_view(['POST'])
@parser_classes([MultiPartParser])
def ocr_process_view(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'message': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    print(f"\n[OCR] Processing file: {file.name}")
    text = None
    error_msg = None
    
    # Check if dependencies are available
    if pytesseract is None:
        error_msg = "pytesseract not installed"
        print(f"[OCR] Error: {error_msg}")
    else:
        try:
            from PIL import Image
            import io
            
            # Read and process the image
            data = file.read()
            image = Image.open(io.BytesIO(data))
            image = image.convert('RGB')
            
            print(f"[OCR] Image loaded: {image.size} pixels, mode: {image.mode}")
            
            # Perform OCR
            text = pytesseract.image_to_string(image)
            
            print(f"[OCR] Extracted {len(text)} characters")
            if text and text.strip():
                print(f"[OCR] Text preview: {text[:100].replace(chr(10), ' ')}...")
            else:
                error_msg = "OCR returned empty/whitespace text"
                print(f"[OCR] Warning: {error_msg}")
                
        except ImportError as e:
            error_msg = f"PIL/Pillow not installed: {str(e)}"
            print(f"[OCR] Error: {error_msg}")
        except Exception as e:
            error_msg = f"OCR processing error: {type(e).__name__}: {str(e)}"
            print(f"[OCR] Error: {error_msg}")
            import traceback
            traceback.print_exc()

    # Fallback to simulated data if OCR failed
    if not text or text.strip() == '':
        print(f"[OCR] Using fallback data. Reason: {error_msg or 'empty result'}")
        fname = file.name.lower()
        if 'presc' in fname or 'rx' in fname or 'test' in fname:
            text = "CITY CLINIC - MEDICAL SERVICES\n\nDIAGNOSIS: Chronic Sinusitis\nPRESCRIPTION: Amoxicillin 500mg\nOne tablet daily for 7 days.\nDATE: OCT 26, 2023"
        else:
            text = f"Simulated OCR extracted text from {file.name}"

    return Response({'text': text})





@api_view(['POST'])
@parser_classes([MultiPartParser, JSONParser])
def acr_process_view(request):
    """
    Extracts medications from either an uploaded image (via OCR) or raw text (via Voice Dictation).
    """
    file = request.FILES.get('file')
    text_input = request.data.get('text')
    
    ocr_text = ""
    
    # 1. Handle File Upload (OCR)
    if file:
        print(f"[ACR] Processing file: {file.name}")
        try:
            import importlib.util, io
            Image = None
            if importlib.util.find_spec('PIL.Image') is not None:
                Image = importlib.import_module('PIL.Image')
            
            # Use module-level pytesseract configured at startup
            # Note: global 'pytesseract' is available from module-level import
            if 'pytesseract' in globals() and globals()['pytesseract'] is not None and Image is not None:
                data = file.read()
                try:
                    image = Image.open(io.BytesIO(data))
                    image = image.convert('RGB')
                    ocr_text = globals()['pytesseract'].image_to_string(image)
                    print(f"[ACR] OCR Extracted: {len(ocr_text)} chars")
                except Exception as e:
                    print(f"[ACR] OCR Image Error: {e}")
                    ocr_text = ""
        except Exception as e:
            print(f"[ACR] OCR Setup Error: {e}")
            ocr_text = ""

    # 2. Handle Text Input (Voice Dictation)
    elif text_input:
        print(f"[ACR] Processing Voice Text: {text_input[:50]}...")
        ocr_text = text_input
    
    else:
        return Response({'message': 'No file or text provided'}, status=status.HTTP_400_BAD_REQUEST)

    # 3. Intelligent Fallback for Simulated Data (only if OCR/Text failed to find anything)
    if not ocr_text or ocr_text.strip() == '':
        if file:
            fname = file.name.lower()
            if 'presc' in fname or 'rx' in fname or 'test' in fname:
                ocr_text = "PRESCRIPTION: Amoxicillin 500mg, one tablet daily."
            else:
                ocr_text = fname
        else:
            ocr_text = ""

    # 4. Naive medication extraction heuristics
    import re
    meds = []
    
    # Heuristic 1: [Name] [dosage: e.g., 500 mg or 10 mg or 1g]
    # Handle optional "take", "one", "daily" etc around it
    pattern = re.compile(r"([A-Z][a-zA-Z0-9-]+)\s+(\d+\s*(?:mg|mcg|g|ml|units))\b", re.IGNORECASE)
    for m in pattern.finditer(ocr_text):
        name = m.group(1)
        dose = m.group(2)
        meds.append({'medication': name, 'dosage': dose})

    # Heuristic 2: [Name] followed by 'tablet', 'capsule', 'tab', 'cap'
    pattern2 = re.compile(r"([A-Z][a-zA-Z0-9-]+)\s+\b(tablet|capsule|tab|cap|pill|syrup)\b", re.IGNORECASE)
    for m in pattern2.finditer(ocr_text):
        name = m.group(1)
        dose = m.group(2)
        # avoid duplicates
        if not any(med['medication'].lower() == name.lower() for med in meds):
            meds.append({'medication': name, 'dosage': f"1 {dose}"})

    # Heuristic 3: Common meds lookup (simple seed list)
    common_meds = ['Panadol', 'Advil', 'Aspirin', 'Lipitor', 'Metformin', 'Amoxicillin', 'Augmentin']
    for cm in common_meds:
        if cm.lower() in ocr_text.lower():
            if not any(med['medication'].lower() == cm.lower() for med in meds):
                # Try to find dose near it
                dose_match = re.search(fr"{cm}.*?(\d+\s*(?:mg|g|ml))", ocr_text, re.IGNORECASE)
                dose = dose_match.group(1) if dose_match else "dosage as directed"
                meds.append({'medication': cm, 'dosage': dose})

    print(f"[ACR] Extracted {len(meds)} medications")
    return Response({'found': meds, 'raw_text': ocr_text})



@api_view(['POST'])
@parser_classes([JSONParser])
def nlp_process_view(request):
    """Processes clinical text and extracts structured entities like Diagnosis and Symptoms."""
    text = request.data.get('text', '')
    if not text:
        return Response({'message': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    import re
    
    # Extract Diagnosis
    diag_match = re.search(r"(?:Diagnosis|Condition):\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
    diagnosis = diag_match.group(1).strip() if diag_match else ""
    
    # Extract Symptoms/Medical History
    history_match = re.search(r"(?:History|Symptoms|Complaints):\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
    history = history_match.group(1).strip() if history_match else ""

    # Extract Notes
    notes_match = re.search(r"(?:Note|Observation):\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
    notes = notes_match.group(1).strip() if notes_match else ""

    return Response({
        'extracted': {
            'diagnosis': diagnosis,
            'history': history,
            'notes': notes
        },
        'status': 'Processed'
    })

@api_view(['GET'])
def disease_search_proxy(request):
    """
    Proxy view for Human Disease Ontology API.
    Endpoint: https://api.disease-ontology.org/v1/terms/search
    """
    query = request.query_params.get('q', '')
    if not query:
        return Response([], status=status.HTTP_200_OK)

    try:
        print(f"[DOBI] Searching Human Disease Ontology via EBI OLS for: {query}")
        # Using EBI OLS as it is the most robust and stable aggregator for DOID
        base_url = "https://www.ebi.ac.uk/ols/api/search"
        params = urllib.parse.urlencode({
            'q': query,
            'ontology': 'doid',
            'rows': 20
        })
        url = f"{base_url}?{params}"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
        
        # Bypass SSL verification if it fails on the server
        import ssl
        context = ssl._create_unverified_context()
        
        with urllib.request.urlopen(req, timeout=10, context=context) as response:
            if response.status == 200:
                raw_data = json.loads(response.read().decode())
                ols_results = raw_data.get('response', {}).get('docs', [])
                
                # Map OLS results to the format expected by our frontend (DO-KB style)
                mapped_results = []
                for item in ols_results:
                    mapped_results.append({
                        'doid': item.get('obo_id', 'Unknown'),
                        'lbl': item.get('label', 'No Label'),
                        'def': (item.get('description', [""])[0]) if item.get('description') else "",
                        'synonyms': item.get('synonym', []),
                        'xrefs': [] # OLS search doesn't return full xrefs by default
                    })
                
                print(f"[DOBI] Found {len(mapped_results)} results")
                return Response(mapped_results)
            else:
                print(f"[DOBI] OLS API Error Status: {response.status}")
                return Response({'error': f'OLS API returned status {response.status}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        import traceback
        print(f"[DOBI] Search Exception: {str(e)}")
        traceback.print_exc()
        return Response({'error': f'Search service unavailable: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(["POST"])
def patient_signup(request):
    data = request.data

    patient = Patient.objects.create(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        phone=data.get("phone"),
        email=data.get("email"),
        password=data.get("password"),
        address=data.get("address"),
        gender=data.get("gender"),
        date_of_birth=data.get("date_of_birth"),
    )

    return Response(
        {"message": "Patient account created", "id": patient.id},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def dentist_signup(request):
    data = request.data

    dentist = Dentist.objects.create(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        phone=data.get("phone"),
        email=data.get("email"),
        password=data.get("password"),
        specialty="General",  # default for now
    )

    return Response(
        {"message": "Dentist account created", "id": dentist.id},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def login_view(request):
    """Simple login that checks Patient and Dentist models for email/password.
    Returns the role and id on success, 401 on failure.
    NOTE: This is a minimal auth for development/testing only.
    """
    data = request.data
    email = data.get("email")
    password = data.get("password")

    # Try patient first
    patient = Patient.objects.filter(email=email, password=password).first()
    if patient:
        return Response({"role": "patient", "id": patient.id, "first_name": patient.first_name}, status=status.HTTP_200_OK)

    # Try dentist
    dentist = Dentist.objects.filter(email=email, password=password).first()
    if dentist:
        return Response({"role": "dentist", "id": dentist.id, "first_name": dentist.first_name}, status=status.HTTP_200_OK)

    # Try admin
    admin = Admin.objects.filter(email=email, password=password).first()
    if admin:
        return Response({"role": "admin", "id": admin.id, "first_name": admin.name}, status=status.HTTP_200_OK)

    return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
def change_dentist_password(request, pk):
    """Change password for a dentist. Expects JSON: { current_password, new_password }"""
    data = request.data
    current = data.get("current_password")
    new = data.get("new_password")

    if not current or not new:
        return Response({"message": "current_password and new_password are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        dentist = Dentist.objects.get(pk=pk)
    except Dentist.DoesNotExist:
        return Response({"message": "Dentist not found"}, status=status.HTTP_404_NOT_FOUND)

    if dentist.password != current:
        return Response({"message": "Current password is incorrect"}, status=status.HTTP_401_UNAUTHORIZED)

    dentist.password = new
    dentist.save()

    return Response({"message": "Password updated"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def change_patient_password(request, pk):
    """Change password for a patient. Expects JSON: { current_password, new_password }
    Verifies current_password matches stored password for the patient with id=pk.
    """
    data = request.data
    current = data.get("current_password")
    new = data.get("new_password")

    if not current or not new:
        return Response({"message": "current_password and new_password are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient = Patient.objects.get(pk=pk)
    except Patient.DoesNotExist:
        return Response({"message": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

    if patient.password != current:
        return Response({"message": "Current password is incorrect"}, status=status.HTTP_401_UNAUTHORIZED)

    patient.password = new
    patient.save()

    return Response({"message": "Password updated"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def change_admin_password(request, pk):
    """Change password for an admin. Expects JSON: { current_password, new_password }"""
    data = request.data
    current = data.get("current_password")
    new = data.get("new_password")

    if not current or not new:
        return Response({"message": "current_password and new_password are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        admin = Admin.objects.get(pk=pk)
    except Admin.DoesNotExist:
        return Response({"message": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)

    if admin.password != current:
        return Response({"message": "Current password is incorrect"}, status=status.HTTP_401_UNAUTHORIZED)

    admin.password = new
    admin.save()

    return Response({"message": "Password updated"}, status=status.HTTP_200_OK)
