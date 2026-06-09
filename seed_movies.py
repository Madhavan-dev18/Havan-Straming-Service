import os
import django

# 1. Initialize Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'netflix_site.settings')
django.setup()

# 2. Import Models
from core.models import Movie, Genre

def get_yt_thumb(video_id):
    # maxresdefault fetches the highest quality 16:9 thumbnail from YouTube's image CDN
    return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

def seed_database():
    print("🔥 Purging all existing movies to ensure a clean database slate...")
    Movie.objects.all().delete()

    print("📁 Creating standard genres...")
    genre_anim, _ = Genre.objects.get_or_create(name="Animation")
    genre_action, _ = Genre.objects.get_or_create(name="Action")
    genre_fantasy, _ = Genre.objects.get_or_create(name="Fantasy")
    genre_comedy, _ = Genre.objects.get_or_create(name="Comedy")

    # 3. The 7 Distinct HLS Manifests with Extracted YouTube IDs
    movies_data = [
        {
            "title": "Blender Grease Pencil Showcase",
            "description": "A stunning visual journey utilizing Blender's 2D grease pencil tools in a 3D environment.",
            "url": "https://wvnyyhjzksdgknmgezao.supabase.co/storage/v1/object/public/havan-video-vault/HERO___Blender_Grease_Pencil_Showcase__pKmSdY56VtY_/index.m3u8",
            "yt_id": "pKmSdY56VtY",
            "genre": genre_anim,
            "duration_mins": 3,
            "featured": True
        },
        {
            "title": "Sintel",
            "description": "A lonely young woman, Sintel, helps and befriends a dragon, whom she calls Scales. But when he is kidnapped by an adult dragon, Sintel decides to embark on a dangerous quest to find her lost friend.",
            "url": "https://wvnyyhjzksdgknmgezao.supabase.co/storage/v1/object/public/havan-video-vault/Sintel___Open_Movie_by_Blender_Foundation__eRsGyueVLvQ_/index.m3u8",
            "yt_id": "eRsGyueVLvQ",
            "genre": genre_fantasy,
            "duration_mins": 14,
            "featured": False
        },
        {
            "title": "Elephants Dream",
            "description": "The world's first open movie, taking you into a surreal machine world.",
            "url": "https://wvnyyhjzksdgknmgezao.supabase.co/storage/v1/object/public/havan-video-vault/Elephants_Dream__TLkA0RELQ1g_/index.m3u8",
            "yt_id": "TLkA0RELQ1g",
            "genre": genre_anim,
            "duration_mins": 10,
            "featured": False
        },
        {
            "title": "Cosmos Laundromat",
            "description": "On a desolate island, a suicidal sheep meets a mysterious salesman who offers him the gift of a lifetime.",
            "url": "https://wvnyyhjzksdgknmgezao.supabase.co/storage/v1/object/public/havan-video-vault/Cosmos_Laundromat___First_Cycle__Official_Blender_Foundation_release___Y_rmzh0PI3c_/index.m3u8",
            "yt_id": "Y-rmzh0PI3c", # Corrected the dash that Supabase automatically stripped
            "genre": genre_fantasy,
            "duration_mins": 12,
            "featured": True
        },
        {
            "title": "CHARGE",
            "description": "In an energy-scarce dystopia, an old, destitute man breaks into a battery factory but soon finds himself confronted by a deadly security droid.",
            "url": "https://wvnyyhjzksdgknmgezao.supabase.co/storage/v1/object/public/havan-video-vault/CHARGE___Blender_Open_Movie__UXqq0ZvbOnk_/index.m3u8",
            "yt_id": "UXqq0ZvbOnk",
            "genre": genre_action,
            "duration_mins": 3,
            "featured": False
        },
        {
            "title": "Caminandes: Gran Dillama",
            "description": "Koro the Llama goes on an epic journey across Patagonia. Things get a little bumpy.",
            "url": "https://wvnyyhjzksdgknmgezao.supabase.co/storage/v1/object/public/havan-video-vault/CGI_3D_Animated_HD__Caminandes__Gran_Dillama____by_Blender_Foundation__DnHd5sQITIE_/index.m3u8",
            "yt_id": "Z4C82eyhwgU", # Extracted the official Blender Studio ID for a pristine poster
            "genre": genre_comedy,
            "duration_mins": 2,
            "featured": False
        },
        {
            "title": "Agent 327: Operation Barbershop",
            "description": "Hendrik IJzerbaks—Agent 327—goes undercover to investigate a mysterious barbershop.",
            "url": "https://wvnyyhjzksdgknmgezao.supabase.co/storage/v1/object/public/havan-video-vault/Agent_327__Operation_Barbershop__mN0zPOpADL4_/index.m3u8",
            "yt_id": "mN0zPOpADL4",
            "genre": genre_action,
            "duration_mins": 4,
            "featured": True
        }
    ]

    print("🎬 Injecting 7 pristine HLS movies with official YouTube thumbnails...")

    for data in movies_data:
        # Dynamically generate the official thumbnail and backdrop from YouTube's CDN
        img_url = get_yt_thumb(data["yt_id"])
        
        movie = Movie.objects.create(
            title=data["title"],
            description=data["description"],
            release_year=2024,
            duration_mins=data["duration_mins"],
            rating="PG-13",
            hls_stream_url=data["url"],
            thumbnail_url=img_url,
            backdrop_url=img_url,
            is_trending=True,
            is_featured=data["featured"],
            award_winning=True,
            family_friendly=True
        )
        
        movie.genres.add(data["genre"])
        print(f"✅ Success: {movie.title}")

    print("\n🚀 Seeding complete. Your frontend will now render 7 distinct, fully playable streams with high-resolution posters.")

if __name__ == '__main__':
    seed_database()