import urllib.request
import urllib.parse
import json
import random

# Map each detected emotion to iTunes search terms
# Each emotion has multiple terms so we can randomise results across calls
# Deezer editorial playlist search terms per emotion
EMOTION_SEARCH_TERMS = {
    "happy":    ["pop", "funk", "disco", "upbeat indie", "feel good", "summer vibes", "good mood", "party hits"],
    "sad":      ["sad songs", "heartbreak", "melancholy", "rainy day"],
    "angry":    ["rock anthems", "metal", "workout rage", "hard rock"],
    "fear":     ["dark", "suspense", "eerie", "horror"],
    "surprise": ["experimental", "art pop", "jazz fusion", "eclectic indie"],
    "neutral":  ["chill", "lo-fi", "focus", "background music"],
}

DEEZER_SEARCH_URL = "https://api.deezer.com/search/playlist"
DEEZER_PLAYLIST_URL = "https://api.deezer.com/playlist"
ITUNES_SEARCH_URL = "https://itunes.apple.com/search"


def fetch_url(url):
    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"[fetch] Failed for {url}: {e}")
        return None

# adding deezer for better song suggestions
def search_deezer_playlists(term, limit=5):
    params = urllib.parse.urlencode({"q": term, "limit": limit})
    data = fetch_url(f"{DEEZER_SEARCH_URL}?{params}")
    if not data:
        return []
    return data.get("data", [])


def get_deezer_playlist_tracks(playlist_id, limit=30):
    data = fetch_url(f"{DEEZER_PLAYLIST_URL}/{playlist_id}/tracks?limit={limit}")
    if not data:
        return []
    return data.get("data", [])


def get_itunes_preview(track_name, artist_name):
    query = f"{track_name} {artist_name}"
    params = urllib.parse.urlencode({
        "term": query,
        "entity": "song",
        "media": "music",
        "limit": 3,
        "country": "US",
        "lang": "en_us",
    })
    data = fetch_url(f"{ITUNES_SEARCH_URL}?{params}")
    if not data:
        return None

    for item in data.get("results", []):
        preview = item.get("previewUrl")
        artwork = item.get("artworkUrl100", "")
        if preview:
            return {
                "preview_url": preview,
                "artwork": artwork.replace("100x100", "300x300"),
                "duration_ms": item.get("trackTimeMillis", 0),
            }
    return None


def get_recommendations(emotion, count=20):
    emotion = emotion.lower()
    terms = EMOTION_SEARCH_TERMS.get(emotion, EMOTION_SEARCH_TERMS["neutral"])
    random.shuffle(terms)

    candidate_tracks = []
    seen_ids = set()

    for term in terms:
        playlists = search_deezer_playlists(term, limit=3)
        if not playlists:
            continue

        playlists.sort(key=lambda p: p.get("fans", 0), reverse=True)
        playlist = playlists[0]
        tracks = get_deezer_playlist_tracks(playlist["id"], limit=40)

        for track in tracks:
            track_id = track.get("id")
            if track_id and track_id not in seen_ids:
                seen_ids.add(track_id)
                candidate_tracks.append({
                    "name": track.get("title", "Unknown"),
                    "artist": track.get("artist", {}).get("name", "Unknown"),
                    "album": track.get("album", {}).get("title", ""),
                    "deezer_artwork": track.get("album", {}).get("cover_medium", ""),
                })

        if len(candidate_tracks) >= count * 2:
            break

    random.shuffle(candidate_tracks)

    results = []
    for track in candidate_tracks:
        if len(results) >= count:
            break

        itunes = get_itunes_preview(track["name"], track["artist"])
        if not itunes:
            continue

        results.append({
            "id": f"{track['name']}_{track['artist']}".replace(" ", "_"),
            "name": track["name"],
            "artist": track["artist"],
            "album": track["album"],
            "artwork": itunes["artwork"] or track["deezer_artwork"],
            "preview_url": itunes["preview_url"],
            "duration_ms": itunes["duration_ms"],
        })

    return results