from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from products.models import Product
from products.serializers import ProductSerializer


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(lookup_expr="iexact")
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ["category", "min_price", "max_price"]


class IsOwnerOrReadOnly(BasePermission):
    message = "You can only change your own products"

    def has_object_permission(self, req, view, obj):
        return req.method in SAFE_METHODS or obj.owner_id == req.user.id


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "brand", "description"]
    ordering_fields = ["price", "name", "created_at"]
    ordering = ["-created_at", "-id"]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @extend_schema(responses=serializers.ListField(child=serializers.CharField()))
    @action(detail=False)
    def categories(self, req):
        return Response(list(Product.objects.order_by("category").values_list("category", flat=True).distinct()))
