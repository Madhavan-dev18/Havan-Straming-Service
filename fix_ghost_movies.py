import os
import django

# Initialize Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'netflix_site.settings')
django.setup()

from core.models import Movie

def purge_ghost_records():
    print("Scanning database for broken movie records...")
    
    # Find movies where hls_stream_url is empty, null, or just whitespace
    ghosts = Movie.objects.filter(hls_stream_url__exact='') | Movie.objects.filter(hls_stream_url__isnull=True)
    
    ghost_count = ghosts.count()
    
    if ghost_count == 0:
        print("✅ Database is clean. No ghost records found.")
    else:
        for ghost in ghosts:
            print(f"🗑️ Deleting corrupted record: '{ghost.title}' (ID: {ghost.id})")
        
        # Nuke them
        ghosts.delete()
        print(f"\n🔥 Successfully purged {ghost_count} broken movies from the database.")

if __name__ == '__main__':
    purge_ghost_records()