from django.urls import path

from ai.views import DescriptionView, SearchView

urlpatterns = [
    path("ai/description/", DescriptionView.as_view()),
    path("ai/search/", SearchView.as_view()),
]
