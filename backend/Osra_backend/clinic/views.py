from django.shortcuts import render

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
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


@api_view(['POST'])
@parser_classes([MultiPartParser])
def ocr_process_view(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'message': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    # Try to perform OCR using pytesseract + Pillow if available
    text = None
    try:
        import importlib, importlib.util, io
        Image = None
        if importlib.util.find_spec('PIL.Image') is not None:
            Image = importlib.import_module('PIL.Image')
        try:
            pytesseract = importlib.import_module('pytesseract')
        except Exception:
            pytesseract = None

        # Only process if pytesseract and Pillow are available
        if pytesseract is not None and Image is not None:
            # read file bytes
            data = file.read()
            try:
                image = Image.open(io.BytesIO(data))
                image = image.convert('RGB')
                text = pytesseract.image_to_string(image)
            except Exception:
                # If Pillow cannot open (e.g., PDF), fallback to simulated
                text = None
    except Exception:
        text = None

    if not text:
        # Simulated OCR response
        text = f"Simulated OCR extracted text from {file.name}"

    return Response({'text': text})


@api_view(['POST'])
@parser_classes([MultiPartParser])
def acr_process_view(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'message': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    # First try to perform OCR on the file to extract text
    ocr_text = None
    try:
        import importlib, importlib.util, io
        Image = None
        if importlib.util.find_spec('PIL.Image') is not None:
            Image = importlib.import_module('PIL.Image')
        try:
            pytesseract = importlib.import_module('pytesseract')
        except Exception:
            pytesseract = None

        if pytesseract is not None and Image is not None:
            data = file.read()
            try:
                image = Image.open(io.BytesIO(data))
                image = image.convert('RGB')
                ocr_text = pytesseract.image_to_string(image)
            except Exception:
                ocr_text = None
    except Exception:
        ocr_text = None

    # fallback to filename heuristic
    if not ocr_text:
        ocr_text = file.name.lower()

    # naive medication extraction heuristics
    import re
    meds = []
    # look for patterns: [Name] [dosage: e.g., 500 mg or 10 mg], or 'tablet'/'capsule'
    pattern = re.compile(r"([A-Z][a-zA-Z0-9-]+)\s+(\d+\s*mg|\d+mg|\d+\s*mcg)\b", re.IGNORECASE)
    for m in pattern.finditer(ocr_text):
        name = m.group(1)
        dose = m.group(2)
        meds.append({'medication': name, 'dosage': dose})

    # a second heuristic for common words 'tablet', 'capsule'
    pattern2 = re.compile(r"([A-Z][a-zA-Z0-9-]+)\s+\b(tablet|capsule|tab|cap)\b", re.IGNORECASE)
    for m in pattern2.finditer(ocr_text):
        name = m.group(1)
        dose = m.group(2)
        meds.append({'medication': name, 'dosage': dose})

    # If no meds found by patterns, look for keywords in filename
    if not meds and ('presc' in str(file.name).lower() or 'rx' in str(file.name).lower() or 'script' in str(file.name).lower()):
        meds.append({'medication': 'SimulatedDrug', 'dosage': '1 tablet daily'})

    return Response({'found': meds})


@api_view(['POST'])
@parser_classes([JSONParser])
def nlp_process_view(request):
    text = request.data.get('text', '')
    if not text:
        return Response({'message': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)
    words = text.split()
    word_count = len(words)
    summary = ' '.join(words[:30])
    return Response({'original': text, 'word_count': word_count, 'summary': summary})

