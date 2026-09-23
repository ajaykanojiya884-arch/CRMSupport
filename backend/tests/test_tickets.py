from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_ticket_and_list() -> None:
    payload = {
        "customer_name": "Rahul Sharma",
        "customer_email": "rahul@example.com",
        "subject": "Order delayed",
        "description": "Tracking has not updated for five days.",
    }
    create_response = client.post("/api/tickets", json=payload)
    assert create_response.status_code == 201, create_response.text
    created = create_response.json()
    assert "ticket_id" in created

    list_response = client.get("/api/tickets")
    assert list_response.status_code == 200
    assert list_response.json()["total"] >= 1


def test_ticket_not_found() -> None:
    response = client.get("/api/tickets/TKT-99999")
    assert response.status_code == 404


def test_invalid_ticket_request() -> None:
    response = client.post(
        "/api/tickets",
        json={
            "customer_name": "",
            "customer_email": "bad-email",
            "subject": "",
            "description": "",
        },
    )
    assert response.status_code == 422


def test_status_filter_and_search() -> None:
    create = client.post(
        "/api/tickets",
        json={
            "customer_name": "Alice Patient",
            "customer_email": "alice@example.com",
            "subject": "Refund issue",
            "description": "Need a refund update after purchase.",
        },
    )
    ticket_id = create.json()["ticket_id"]

    list_all = client.get("/api/tickets")
    assert list_all.status_code == 200

    filtered = client.get(f"/api/tickets?search=alice&status=Open")
    assert filtered.status_code == 200
    assert filtered.json()["total"] >= 1

    detail = client.get(f"/api/tickets/{ticket_id}")
    assert detail.status_code == 200

    update = client.put(
        f"/api/tickets/{ticket_id}",
        json={"status": "In Progress", "notes": "Customer contacted, investigating."},
    )
    assert update.status_code == 200
    assert update.json()["success"] is True


def test_request_otp_returns_dev_code_when_email_delivery_is_disabled(monkeypatch) -> None:
    from app.core.config import settings

    monkeypatch.setattr(settings, "smtp_host", "localhost")
    response = client.post("/api/auth/request-otp", json={"email": "kanoujiyadeepak19@gmail.com"})
    assert response.status_code == 200, response.text
    body = response.json()
    assert "otp" in body
    assert len(str(body["otp"])) == 6


def test_request_otp_reuses_cooldown_message() -> None:
    email = "cooldown@example.com"
    first = client.post("/api/auth/request-otp", json={"email": email})
    assert first.status_code == 200, first.text

    second = client.post("/api/auth/request-otp", json={"email": email})
    assert second.status_code == 429, second.text
    assert "Please wait" in second.json()["detail"]


def test_logout_invalidates_session(monkeypatch) -> None:
    from app.core.config import settings

    monkeypatch.setattr(settings, "smtp_host", "localhost")
    email = "logout@example.com"
    code = "123456"

    request = client.post("/api/auth/request-otp", json={"email": email})
    assert request.status_code == 200, request.text
    body = request.json()
    if "otp" in body:
        code = str(body["otp"])

    verify = client.post("/api/auth/verify-otp", json={"email": email, "code": code})
    assert verify.status_code == 200, verify.text
    token = verify.json()["token"]

    logout = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout.status_code == 200, logout.text

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 401


def test_ai_chat_returns_generated_response(monkeypatch) -> None:
    from app.core import config

    class FakeChoices:
        def __init__(self):
            self.message = type("Message", (), {"content": "Here is the answer."})()

    class FakeResponse:
        def __init__(self):
            self.choices = [FakeChoices()]

    class FakeChat:
        def __init__(self):
            self.completions = type("Completions", (), {"create": lambda self, **kwargs: FakeResponse()})()

    class FakeClient:
        def __init__(self):
            self.chat = FakeChat()

    monkeypatch.setattr(config.settings, "ai_provider", "openai")
    monkeypatch.setattr("app.api.routes.ai.get_openai_client", lambda: FakeClient())

    response = client.post("/api/ai/chat", json={"message": "Help with this ticket"})
    assert response.status_code == 200, response.text
    assert response.json()["reply"] == "Here is the answer."
