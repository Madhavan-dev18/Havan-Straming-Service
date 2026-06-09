from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView,
    ProfileListView, ProfileDetailView, VerifyPinView,
    MovieListView, MovieDetailView, FeaturedMovieView,
    RecommendedMoviesView, GenreListView,
    WatchlistView, WatchHistoryView,
)

urlpatterns = [
    # ── Auth ──────────────────────────────────
    path('register/',       RegisterView.as_view(),     name='register'),
    path('login/',          LoginView.as_view(),         name='login'),
    path('token/refresh/',  TokenRefreshView.as_view(),  name='token-refresh'),

    # ── Profiles ──────────────────────────────
    path('profiles/',           ProfileListView.as_view(),     name='profile-list'),
    path('profiles/<int:pk>/',  ProfileDetailView.as_view(),   name='profile-detail'),
    path('verify-pin/',         VerifyPinView.as_view(),        name='verify-pin'),

    # ── Movies ────────────────────────────────
    path('movies/',             MovieListView.as_view(),        name='movie-list'),
    path('movies/<int:pk>/',    MovieDetailView.as_view(),      name='movie-detail'),
    path('movies/featured/',    FeaturedMovieView.as_view(),    name='featured-movie'),
    path('movies/recommended/', RecommendedMoviesView.as_view(), name='recommended'),
    path('genres/',             GenreListView.as_view(),        name='genre-list'),

    # ── User Data ─────────────────────────────
    path('watchlist/',  WatchlistView.as_view(),    name='watchlist'),
    path('history/',    WatchHistoryView.as_view(), name='watch-history'),
]