from django.urls import path
from .views import CanalListeView, ConnecterCanalManuelView, CanalDeconnecterView

urlpatterns = [
    path("", CanalListeView.as_view()),
    path("connecter/", ConnecterCanalManuelView.as_view()),
    path("<int:pk>/", CanalDeconnecterView.as_view()),
]