import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
product = {
    "name": "Air Zoom",
    "brand": "Nike",
    "category": "shoes",
    "description": "light running shoe",
    "price": "99.50",
    "image_url": "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/e/b/eb661c9Nike-IM6368-400_1.jpg",
}


def signup(client, email="a@test.com"):
    res = client.post("/api/auth/register/", {"name": "Asha", "email": email, "password": "password123"})
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
    return res


def test_register_login_and_me():
    client = APIClient()
    assert signup(client).status_code == 201
    assert client.get("/api/auth/me/").data["email"] == "a@test.com"
    login = APIClient().post("/api/auth/login/", {"email": "A@test.com", "password": "password123"})
    assert login.status_code == 200 and "access" in login.data


def test_register_rejects_duplicates_and_bad_input():
    client = APIClient()
    signup(client)
    dupe = client.post("/api/auth/register/", {"name": "B", "email": "a@test.com", "password": "password123"})
    assert dupe.status_code == 400
    short = client.post("/api/auth/register/", {"name": "B", "email": "b@test.com", "password": "123"})
    assert short.status_code == 400 and "password" in short.data["error"]


def test_wrong_password_is_401():
    client = APIClient()
    signup(client)
    res = client.post("/api/auth/login/", {"email": "a@test.com", "password": "nope-nope"})
    assert res.status_code == 401 and res.data["error"]


def test_write_needs_login_but_read_is_public():
    client = APIClient()
    assert client.get("/api/products/").status_code == 200
    assert client.post("/api/products/", product).status_code == 401


def test_only_owner_can_edit_or_delete():
    owner, other = APIClient(), APIClient()
    signup(owner)
    signup(other, "b@test.com")
    created = owner.post("/api/products/", product)
    assert created.status_code == 201
    url = f"/api/products/{created.data['id']}/"
    assert other.patch(url, {"price": "10"}).status_code == 403
    assert other.delete(url).status_code == 403
    assert owner.patch(url, {"price": "10"}).data["price"] == "10.00"
    assert owner.delete(url).status_code == 204
    assert owner.get(url).status_code == 404


def test_product_validation():
    client = APIClient()
    signup(client)
    res = client.post("/api/products/", {**product, "price": "-5", "name": ""})
    assert res.status_code == 400
    assert res.data["error"]["name"] == ["Please enter a product name"]
    assert res.data["error"]["price"] == ["Please enter a price greater than 0"]
    noimage = client.post("/api/products/", {**product, "image_url": ""})
    assert noimage.data["error"]["image_url"] == ["Please enter a product image url"]


def test_search_filter_sort_and_pagination():
    client = APIClient()
    signup(client)
    for i in range(14): client.post("/api/products/", {**product, "name": f"Shoe {i}", "price": str(10 + i)})
    client.post("/api/products/", {**product, "name": "Blue Mug", "brand": "Acme", "category": "kitchen", "price": "5"})
    page = client.get("/api/products/").data
    assert page["count"] == 15 and len(page["results"]) == 12 and page["next"]
    assert client.get("/api/products/?search=acme").data["count"] == 1
    assert client.get("/api/products/?category=KITCHEN").data["count"] == 1
    assert client.get("/api/products/?min_price=20&max_price=22").data["count"] == 3
    assert client.get("/api/products/?ordering=price").data["results"][0]["name"] == "Blue Mug"
    assert client.get("/api/products/?ordering=-price").data["results"][0]["name"] == "Shoe 13"
    assert client.get("/api/products/categories/").data == ["kitchen", "shoes"]
