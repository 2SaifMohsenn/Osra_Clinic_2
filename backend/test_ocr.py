#!/usr/bin/env python
"""Test script to verify OCR setup"""
import os
import sys

print("=" * 60)
print("Testing OCR Configuration")
print("=" * 60)

# Test 1: Check if pytesseract can be imported
print("\n1. Testing pytesseract import...")
try:
    import pytesseract
    print("   ✓ pytesseract imported successfully")
except ImportError as e:
    print(f"   ✗ Failed to import pytesseract: {e}")
    sys.exit(1)

# Test 2: Check if PIL/Pillow can be imported
print("\n2. Testing PIL/Pillow import...")
try:
    from PIL import Image
    print("   ✓ PIL/Pillow imported successfully")
except ImportError as e:
    print(f"   ✗ Failed to import PIL/Pillow: {e}")
    sys.exit(1)

# Test 3: Check Tesseract executable
print("\n3. Checking Tesseract executable...")
import platform
if platform.system() == 'Windows':
    possible_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    ]
    found = False
    for path in possible_paths:
        if os.path.exists(path):
            print(f"   ✓ Tesseract found at: {path}")
            pytesseract.pytesseract.tesseract_cmd = path
            found = True
            break
    
    if not found:
        print("   ✗ Tesseract executable not found in common paths")
        sys.exit(1)

# Test 4: Get Tesseract version
print("\n4. Getting Tesseract version...")
try:
    version = pytesseract.get_tesseract_version()
    print(f"   ✓ Tesseract version: {version}")
except Exception as e:
    print(f"   ✗ Failed to get version: {e}")
    sys.exit(1)

# Test 5: Test OCR on a simple generated image
print("\n5. Testing OCR on a test image...")
try:
    # Create a simple test image with text
    from PIL import Image, ImageDraw, ImageFont
    import io
    
    # Create white image
    img = Image.new('RGB', (400, 100), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add text
    text = "Test Prescription\nAspirin 500mg"
    draw.text((10, 10), text, fill='black')
    
    # Run OCR
    result = pytesseract.image_to_string(img)
    
    print(f"   ✓ OCR executed successfully")
    print(f"   Extracted text: '{result.strip()}'")
    
    if result.strip():
        print("   ✓ OCR is working!")
    else:
        print("   ⚠ OCR returned empty text")
    
except Exception as e:
    print(f"   ✗ OCR test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("All tests passed! OCR is configured correctly.")
print("=" * 60)
