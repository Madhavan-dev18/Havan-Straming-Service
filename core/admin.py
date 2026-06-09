from django.contrib import admin
from .models import (
    Movie, Genre, VideoQuality, Subtitle, AudioTrack,
    UserProfile, Watchlist, WatchHistory,
)


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


class VideoQualityInline(admin.TabularInline):
    model = VideoQuality
    extra = 1


class SubtitleInline(admin.TabularInline):
    model = Subtitle
    extra = 1


class AudioTrackInline(admin.TabularInline):
    model = AudioTrack
    extra = 1


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display  = ['title', 'release_year', 'rating', 'language', 'is_featured', 'is_trending', 'is_active']
    list_filter   = ['is_featured', 'is_trending', 'is_active', 'rating', 'award_winning', 'family_friendly', 'genres']
    search_fields = ['title', 'description']
    filter_horizontal = ['genres']
    inlines       = [VideoQualityInline, SubtitleInline, AudioTrackInline]
    list_editable = ['is_featured', 'is_trending', 'is_active']
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'description', 'release_year', 'duration_mins', 'rating', 'genres')
        }),
        ('Categorization', {
            'fields': ('language', 'country', 'popularity', 'is_trending', 'is_featured', 'award_winning', 'family_friendly', 'is_active')
        }),
        ('Playback Metadata', {
            'fields': ('intro_start', 'intro_end', 'recap_start', 'recap_end', 'next_episode')
        }),
        ('Media URLs', {
            'fields': ('thumbnail_url', 'backdrop_url', 'trailer_url', 'hls_stream_url')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'name', 'avatar', 'country', 'preferred_language', 'is_main']
    list_filter   = ['is_main', 'country', 'preferred_language']
    search_fields = ['user__username', 'name']
    filter_horizontal = ['favorite_genres']


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display  = ['profile', 'movie', 'added_at']
    search_fields = ['profile__name', 'movie__title']


@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display  = ['profile', 'movie', 'progress_secs', 'completed', 'watched_at']
    list_filter   = ['completed']
    search_fields = ['profile__name', 'movie__title']