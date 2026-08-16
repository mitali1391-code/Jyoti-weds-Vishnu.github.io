"""Regression tests for invitation health and RSVP API flows."""
import os
import uuid

import pytest
import requests
from dotenv import dotenv_values


BASE_URL = dotenv_values("/app/frontend/.env").get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    pytest.skip("REACT_APP_BACKEND_URL is not configured", allow_module_level=True)
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture
def client():
    return requests.Session()


def test_root_health(client):
    response = client.get(f"{BASE_URL}/api/", timeout=20)
    assert response.status_code == 200
    assert response.json()["message"] == "Jyoti and Vishnu wedding invitation API"


def test_rsvp_rejects_short_name(client):
    response = client.post(
        f"{BASE_URL}/api/rsvp",
        json={"name": "A", "attending": True, "guests": 1},
        timeout=20,
    )
    assert response.status_code == 422
    assert "detail" in response.json()


def test_rsvp_create_returns_saved_shape_and_count(client):
    unique_name = f"TEST_{uuid.uuid4().hex[:10]}"
    payload = {
        "name": unique_name,
        "attending": True,
        "guests": 2,
        "meal": "Sadya",
        "note": "TEST regression RSVP",
    }
    response = client.post(f"{BASE_URL}/api/rsvp", json=payload, timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == unique_name
    assert data["guests"] == 2
    assert isinstance(data["id"], str) and data["id"]
    assert "created_at" in data

    count = client.get(f"{BASE_URL}/api/rsvp/count", timeout=20)
    assert count.status_code == 200
    assert isinstance(count.json()["attending"], int)