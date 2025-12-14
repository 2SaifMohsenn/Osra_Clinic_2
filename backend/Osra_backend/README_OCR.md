OCR/ACR Installation Notes

To enable server-side OCR and ACR extraction using `pytesseract`, install the following:

1. System dependencies (Tesseract):
   - Windows: Install Tesseract from https://github.com/tesseract-ocr/tesseract/releases
     - Add the installed tesseract binary to your PATH (e.g., C:\Program Files\Tesseract-OCR)
   - macOS: `brew install tesseract`
   - Linux (Ubuntu): `sudo apt-get install tesseract-ocr`

2. Python packages:
   - Create a virtualenv for your project (if not already):
     ```bash
     python -m venv venv
     source venv/bin/activate  # or venv\Scripts\activate on Windows
     pip install -r requirements.txt
     ```

3. Optional: PDF support
   - `pdf2image` requires `poppler` to convert PDFs to images.
   - Install `poppler` on macOS: `brew install poppler`
   - On Ubuntu: `sudo apt-get install poppler-utils`
   - Then add `pdf2image` to your Python requirements.

Notes:
- If `pytesseract` is not installed or Tesseract is not available on the system PATH, the backend falls back to a simulated OCR response.
- For production use, consider using a robust OCR/Document AI service or running Tesseract with careful preprocessing for reliability.
