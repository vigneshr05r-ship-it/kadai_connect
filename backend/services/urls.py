from django.urls import path
from .views import (
    ServiceListCreateView, ServiceDetailView,
    BookingListCreateView, BookingDetailView, BookingStatusUpdateView
)

urlpatterns = [
    # Services
    path('', ServiceListCreateView.as_view(), name='service-list-create'),
    path('<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),

    # Bookings
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/status/', BookingStatusUpdateView.as_view(), name='booking-status'),
]
