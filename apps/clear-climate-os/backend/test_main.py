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

def test_generate_toc():
    response = client.post("/generate_toc", json={"notes": "Project started to install solar panels with funding."})
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) > 0
    assert "category" in data["items"][0]

def test_generate_toc_empty():
    response = client.post("/generate_toc", json={"notes": ""})
    assert response.status_code == 400

def test_generate_systems_map():
    response = client.post("/generate_systems_map", json={"notes": "Higher solar adoption leads to reduced energy costs."})
    assert response.status_code == 200
    data = response.json()
    assert "variables" in data
    assert "links" in data
    assert isinstance(data["variables"], list)
    assert isinstance(data["links"], list)
    assert len(data["variables"]) > 0

def test_generate_systems_map_empty():
    response = client.post("/generate_systems_map", json={"notes": ""})
    assert response.status_code == 400

def test_generate_stakeholders():
    response = client.post("/generate_stakeholders", json={"notes": "Local community opposes the new factory."})
    assert response.status_code == 200
    data = response.json()
    assert "stakeholders" in data
    assert isinstance(data["stakeholders"], list)
    assert len(data["stakeholders"]) > 0

def test_generate_stakeholders_empty():
    response = client.post("/generate_stakeholders", json={"notes": ""})
    assert response.status_code == 400

def test_generate_resources():
    response = client.post("/generate_resources", json={"notes": "We need more financial backing."})
    assert response.status_code == 200
    data = response.json()
    assert "resources" in data
    assert isinstance(data["resources"], list)
    assert len(data["resources"]) > 0

def test_generate_resources_empty():
    response = client.post("/generate_resources", json={"notes": ""})
    assert response.status_code == 400
