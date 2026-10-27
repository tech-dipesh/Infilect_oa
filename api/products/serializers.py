from rest_framework import serializers

from config.messages import msgs
from products.models import Product

labels = {
    "name": "product name",
    "brand": "brand",
    "category": "category",
    "description": "description",
    "price": "price",
    "image_url": "product image url",
}


class ProductSerializer(serializers.ModelSerializer):
    owner = serializers.IntegerField(source="owner_id", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "brand", "category", "description", "price", "image_url", "owner", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {key: {"error_messages": msgs(label)} for key, label in labels.items()}

    def validate_price(self, value):
        if value <= 0: raise serializers.ValidationError("Please enter a price greater than 0")
        return value
