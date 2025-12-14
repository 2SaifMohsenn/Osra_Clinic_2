from django.test import TestCase, Client
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
import json


class OCRACRNLPTests(TestCase):
	def setUp(self):
		self.client = Client()

	def test_ocr_endpoint_simulated(self):
		url = reverse('process-ocr')
		f = SimpleUploadedFile('test.txt', b'hello world')
		resp = self.client.post(url, {'file': f})
		self.assertEqual(resp.status_code, 200)
		data = resp.json()
		self.assertIn('text', data)
		self.assertTrue(str(data['text']).lower().startswith('simulated ocr'), msg=str(data))

	def test_acr_endpoint_found_med_by_filename(self):
		url = reverse('process-acr')
		f = SimpleUploadedFile('prescription_sample.txt', b'prescription content')
		resp = self.client.post(url, {'file': f})
		self.assertEqual(resp.status_code, 200)
		data = resp.json()
		self.assertIn('found', data)
		# Since the filename contains 'prescription', the backend should add a simulated med
		self.assertTrue(isinstance(data['found'], list))
		self.assertGreaterEqual(len(data['found']), 1)

	def test_nlp_endpoint(self):
		url = reverse('process-nlp')
		payload = {'text': 'Hello world from Osra'}
		resp = self.client.post(url, json.dumps(payload), content_type='application/json')
		self.assertEqual(resp.status_code, 200)
		data = resp.json()
		self.assertEqual(data.get('word_count'), 4)
		self.assertIn('summary', data)
