import json

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from ai import llm
from ai.serializers import DescriptionSerializer, FiltersSerializer, QuerySerializer, sorts
from products.models import Product

describe_rules = (
    "You write product descriptions for an online store. Write 2 to 3 plain sentences, under 60 words. "
    "No markdown, no emoji, no price, and do not invent specifications that were not given."
)


class AIView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai"


class DescriptionView(AIView):
    permission_classes = [IsAuthenticated]

    def post(self, req):
        serializer = DescriptionSerializer(data=req.data)
        serializer.is_valid(raise_exception=True)
        name, brand, category = (serializer.validated_data[key] for key in ("name", "brand", "category"))
        text = llm.ask(describe_rules, f"Product name: {name}\nBrand: {brand}\nCategory: {category}", max_tokens=150)
        return Response({"description": text})


class SearchView(AIView):
    permission_classes = [AllowAny]

    def post(self, req):
        serializer = QuerySerializer(data=req.data)
        serializer.is_valid(raise_exception=True)
        query = serializer.validated_data["query"]
        categories = list(Product.objects.order_by("category").values_list("category", flat=True).distinct())
        rules = (
            "You turn a shopper's sentence into product filters. Reply with JSON only, using exactly these keys: "
            '"search" (one or two core product keywords in singular form, or ""), '
            f'"category" (exactly one of {json.dumps(categories)}, or ""), '
            '"min_price" and "max_price" (numbers in rupees, or null), '
            f'"ordering" (one of {json.dumps(sorts)}, or null). '
            "Use ordering price for cheapest or lowest price, -price for most expensive. Leave out filler words, "
            "and leave search empty when the category already covers what the shopper wants."
        )
        raw = llm.ask(rules, query, json_mode=True)
        filters = parse(raw, categories)
        return Response(filters or {"search": query})


def parse(raw: str, categories: list[str]):
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    serializer = FiltersSerializer(data=data)
    if not serializer.is_valid(): return None
    filters = {key: str(value) for key, value in serializer.validated_data.items() if value not in (None, "")}
    wanted = filters.pop("category", "").lower()
    match = next((name for name in categories if name.lower() == wanted), None)
    return {**filters, "category": match} if match else filters
