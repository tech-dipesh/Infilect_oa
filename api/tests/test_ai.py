import json
from types import SimpleNamespace

import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from ai import llm
from config import env
from products.models import Product
from tests.test_api import product, signup

pytestmark = pytest.mark.django_db


def fake_ask(reply):
    return lambda *args, **kwargs: reply


def test_description_needs_login():
    assert APIClient().post("/api/ai/description/", {"name": "x", "brand": "y", "category": "z"}).status_code == 401


def test_description_returns_text(monkeypatch):
    monkeypatch.setattr(llm, "ask", fake_ask("A light running shoe."))
    client = APIClient()
    signup(client)
    res = client.post("/api/ai/description/", {"name": "Air Zoom", "brand": "Nike", "category": "shoes"})
    assert res.status_code == 200 and res.data == {"description": "A light running shoe."}


def test_description_validates_input(monkeypatch):
    monkeypatch.setattr(llm, "ask", fake_ask("unused"))
    client = APIClient()
    signup(client)
    res = client.post("/api/ai/description/", {"name": "Air Zoom", "brand": "", "category": "shoes"})
    assert res.status_code == 400 and res.data["error"]["brand"] == ["Please enter a brand"]


def test_search_keeps_valid_filters_and_drops_unknown_category(monkeypatch):
    client = APIClient()
    signup(client)
    client.post("/api/products/", product)
    reply = json.dumps({"search": "run", "category": "Shoes", "min_price": None, "max_price": 3000, "ordering": "price"})
    monkeypatch.setattr(llm, "ask", fake_ask(reply))
    res = APIClient().post("/api/ai/search/", {"query": "cheap running shoes under 3000"})
    assert res.data == {"search": "run", "category": "shoes", "max_price": "3000.00", "ordering": "price"}
    monkeypatch.setattr(llm, "ask", fake_ask(json.dumps({"category": "spaceships", "ordering": "random"})))
    assert APIClient().post("/api/ai/search/", {"query": "spaceships"}).data == {"search": "spaceships"}


def test_search_falls_back_on_bad_model_output(monkeypatch):
    monkeypatch.setattr(llm, "ask", fake_ask("sorry I cannot help"))
    res = APIClient().post("/api/ai/search/", {"query": "blue mug"})
    assert res.status_code == 200 and res.data == {"search": "blue mug"}


def test_ai_is_503_when_key_missing(monkeypatch):
    monkeypatch.setattr(llm, "client", None)
    res = APIClient().post("/api/ai/search/", {"query": "blue mug"})
    assert res.status_code == 503 and "GROQ_KEY" in res.data["error"]


def test_seed_is_repeatable():
    call_command("seed")
    call_command("seed")
    assert Product.objects.count() == 12


def fake_client(create):
    return SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))


def test_ask_uses_json_mode_only_when_asked(monkeypatch):
    calls = []

    def create(**kwargs):
        calls.append(kwargs)
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=" hi "))])

    monkeypatch.setattr(llm, "client", fake_client(create))
    assert llm.ask("system", "question") == "hi"
    llm.ask("system", "question", json_mode=True)
    assert "response_format" not in calls[0]
    assert calls[1]["response_format"] == {"type": "json_object"}


def test_provider_error_is_hidden_unless_debug(monkeypatch):
    def create(**kwargs):
        raise llm.OpenAIError("model not found")

    monkeypatch.setattr(llm, "client", fake_client(create))
    monkeypatch.setattr(env, "DEBUG", False)
    hidden = APIClient().post("/api/ai/search/", {"query": "blue mug"})
    assert hidden.status_code == 503 and "model not found" not in hidden.data["error"]
    monkeypatch.setattr(env, "DEBUG", True)
    shown = APIClient().post("/api/ai/search/", {"query": "blue mug"})
    assert "model not found" in shown.data["error"]
