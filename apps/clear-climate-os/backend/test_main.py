from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_extract_evidence():
    response = client.post("/extract_evidence", json={"notes": "Test meeting notes about solar panels."})
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "type" in data[0]

def test_extract_evidence_empty():
    response = client.post("/extract_evidence", json={"notes": ""})
    assert response.status_code == 400

def test_generate_report():
    response = client.post("/generate_report", json={"evidence_items": [{"type": "risk", "content": "test"}]})
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "body" in data

def test_generate_report_empty():
    response = client.post("/generate_report", json={"evidence_items": []})
    assert response.status_code == 400

def test_qa_review():
    response = client.post("/qa_review", json={"report_content": "Draft report content"})
    assert response.status_code == 200
    data = response.json()
    assert "flags" in data
    assert isinstance(data["flags"], list)

def test_qa_review_empty():
    response = client.post("/qa_review", json={"report_content": ""})
    assert response.status_code == 400
