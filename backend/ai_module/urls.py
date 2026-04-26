from django.urls import path
from .views import PricePredictionView, MarketingGeneratorView, FestivalEngineView, VoiceToTextView, DashboardInsightsView

urlpatterns = [
    path('predict-price/', PricePredictionView.as_view(), name='predict_price'),
    path('generate-marketing/', MarketingGeneratorView.as_view(), name='generate_marketing'),
    path('festivals/', FestivalEngineView.as_view(), name='festival_engine'),
    path('transcribe/', VoiceToTextView.as_view(), name='transcribe'),
    path('insights/', DashboardInsightsView.as_view(), name='dashboard_insights'),
]
