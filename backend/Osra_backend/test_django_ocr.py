"""
Quick OCR Test Script
Run this to test if the OCR endpoint is working properly
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Osra_backend.settings')

import django
django.setup()

from clinic.views import ocr_process_view
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory
from PIL import Image, ImageDraw
import io

print("\n" + "="*60)
print("Testing Django OCR View Directly")
print("="*60 + "\n")

# Create a test image with text
img = Image.new('RGB', (400, 100), color='white')
draw = ImageDraw.Draw(img)
draw.text((10, 10), "Prescription\nAspirin 500mg", fill='black')

# Save to bytes
img_bytes = io.BytesIO()
img.save(img_bytes, format='PNG')
img_bytes.seek(0)

# Create a fake uploaded file
uploaded_file = SimpleUploadedFile(
    "test_prescription.png",
    img_bytes.read(),
    content_type="image/png"
)

# Create a fake request
factory = APIRequestFactory()
request = factory.post('/api/process/ocr/', {'file': uploaded_file}, format='multipart')

# Call the view
print("Calling ocr_process_view...")
response = ocr_process_view(request)

print(f"\nResponse status: {response.status_code}")
print(f"Response data: {response.data}")

if 'Simulated' in str(response.data.get('text', '')):
    print("\n❌ FAILED: Still returning simulated text!")
    print("   The OCR is not working in Django view")
else:
    print("\n✅ SUCCESS: Real OCR extraction working!")

print("\n" + "="*60)
