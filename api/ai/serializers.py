from rest_framework import serializers

from config.messages import msgs

sorts = ["-created_at", "price", "-price", "name"]


class DescriptionSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, error_messages=msgs("product name"))
    brand = serializers.CharField(max_length=100, error_messages=msgs("brand"))
    category = serializers.CharField(max_length=100, error_messages=msgs("category"))


class QuerySerializer(serializers.Serializer):
    query = serializers.CharField(max_length=200, error_messages=msgs("search query"))


class FiltersSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=100)
    category = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    min_price = serializers.DecimalField(required=False, allow_null=True, max_digits=10, decimal_places=2, min_value=0)
    max_price = serializers.DecimalField(required=False, allow_null=True, max_digits=10, decimal_places=2, min_value=0)
    ordering = serializers.ChoiceField(required=False, allow_null=True, choices=sorts)
