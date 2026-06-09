from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Movie, Genre,
    VideoQuality, Subtitle, AudioTrack,
    Watchlist, WatchHistory,
)


# ──────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password            = serializers.CharField(write_only=True, min_length=6)
    full_name           = serializers.CharField(write_only=True)
    age                 = serializers.IntegerField(write_only=True)
    mobile              = serializers.CharField(write_only=True, required=False, allow_blank=True)
    country             = serializers.CharField(write_only=True, required=False, allow_blank=True)
    preferred_language  = serializers.CharField(write_only=True, required=False, default='English')

    class Meta:
        model  = User
        fields = [
            'username', 'email', 'password',
            'full_name', 'age', 'mobile', 'country', 'preferred_language',
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        # Pop profile-specific fields before creating the User
        profile_fields = {
            'full_name':          validated_data.pop('full_name'),
            'age':                validated_data.pop('age'),
            'mobile':             validated_data.pop('mobile', ''),
            'country':            validated_data.pop('country', ''),
            'preferred_language': validated_data.pop('preferred_language', 'English'),
        }

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )

        # Auto-create the master profile linked to the new user
        UserProfile.objects.create(
            user=user,
            name=profile_fields['full_name'],
            age=profile_fields['age'],
            mobile=profile_fields['mobile'],
            country=profile_fields['country'],
            preferred_language=profile_fields['preferred_language'],
            is_main=True,
            avatar='A',
        )
        return user


# ──────────────────────────────────────────────
# PROFILE
# ──────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    is_locked       = serializers.SerializerMethodField()
    favorite_genres = serializers.PrimaryKeyRelatedField(many=True, queryset=Genre.objects.all(), required=False)

    class Meta:
        model  = UserProfile
        # NEVER include 'pin' in output — only the boolean flag
        fields = [
            'id', 'name', 'is_locked', 'age', 'mobile',
            'country', 'preferred_language', 'avatar',
            'is_main', 'favorite_genres',
        ]
        extra_kwargs = {
            'pin': {'write_only': True},
        }

    def get_is_locked(self, obj):
        return bool(obj.pin)


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH requests to update profile data."""
    pin             = serializers.CharField(max_length=4, required=False, allow_blank=True, allow_null=True)
    favorite_genres = serializers.PrimaryKeyRelatedField(many=True, queryset=Genre.objects.all(), required=False)

    class Meta:
        model  = UserProfile
        fields = [
            'name', 'age', 'mobile', 'country',
            'preferred_language', 'avatar', 'pin', 'favorite_genres',
        ]

    def update(self, instance, validated_data):
        genres = validated_data.pop('favorite_genres', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if genres is not None:
            instance.favorite_genres.set(genres)
        return instance


# ──────────────────────────────────────────────
# MOVIE & MEDIA
# ──────────────────────────────────────────────

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Genre
        fields = ['id', 'name']


class VideoQualitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = VideoQuality
        fields = ['id', 'label', 'resolution', 'bitrate', 'url', 'is_default']


class SubtitleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Subtitle
        fields = ['id', 'language', 'language_code', 'file_url', 'is_default', 'is_forced']


class AudioTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AudioTrack
        fields = ['id', 'language', 'language_code', 'stream_url', 'is_default']


class MovieSerializer(serializers.ModelSerializer):
    genres       = GenreSerializer(many=True, read_only=True)
    qualities    = VideoQualitySerializer(many=True, read_only=True)
    subtitles    = SubtitleSerializer(many=True, read_only=True)
    audio_tracks = AudioTrackSerializer(many=True, read_only=True)

    class Meta:
        model  = Movie
        fields = [
            'id', 'title', 'description', 'release_year', 'duration_mins',
            'rating', 'genres', 'language', 'country', 'popularity',
            'is_trending', 'is_featured', 'award_winning', 'family_friendly',
            'intro_start', 'intro_end', 'recap_start', 'recap_end',
            'next_episode', 'thumbnail_url', 'backdrop_url', 'trailer_url',
            'hls_stream_url', 'qualities', 'subtitles', 'audio_tracks',
            'created_at',
        ]


class MovieListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views (no nested media assets)."""
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model  = Movie
        fields = [
            'id', 'title', 'release_year', 'duration_mins', 'rating',
            'genres', 'language', 'country', 'popularity',
            'is_trending', 'is_featured', 'award_winning', 'family_friendly',
            'thumbnail_url', 'backdrop_url', 'hls_stream_url', # <-- ADDED
        ]


# ──────────────────────────────────────────────
# WATCHLIST / HISTORY
# ──────────────────────────────────────────────

class WatchlistSerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)

    class Meta:
        model  = Watchlist
        fields = ['id', 'movie', 'added_at']


class WatchHistorySerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)

    class Meta:
        model  = WatchHistory
        fields = ['id', 'movie', 'progress_secs', 'completed', 'watched_at']