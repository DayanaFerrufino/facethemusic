import urllib.request
import urllib.parse
import json
import random

# Map each detected emotion to iTunes search terms
# Each emotion has multiple terms so we can randomise results across calls
EMOTION_SEARCH_TERMS = {
    "happy": ["feel good pop", "upbeat dance", "happy hits", "sunny pop"],
    "sad": ["sad ballad", "heartbreak songs", "melancholy indie", "sad acoustic"],
    "angry": ["hard rock", "metal", "rage rap", "aggressive punk"],
    "fear": ["dark ambient", "horror soundtrack", "eerie electronic", "suspense film score"],
    "surprise": ["experimental pop", "eclectic indie", "unexpected beats", "quirky alternative"],
    "neutral": ["chill lo-fi", "ambient focus", "indie chill", "background acoustic"],
}

ITUNES_SEARCH_URL = "https://itunes.apple.com/search"


def search_itunes(term: str, limit: int = 25) -> list[dict]:
    """Hit the iTunes Search API and return a list of track dicts."""
    params = urllib.parse.urlencode({
        "term": term,
        "entity": "song",
        "media": "music",
        "limit": limit,
    })

    url = f"{ITUNES_SEARCH_URL}?{params}"

    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            data = json.loads(response.read().decode())
    except Exception as e:
        print(f"[iTunes] Request failed for term '{term}': {e}")
        return []

    tracks = []
    for item in data.get("results", []):
        # Only include tracks that have a 30-second preview
        preview_url = item.get("previewUrl")
        if not preview_url:
            continue

        tracks.append({
            "id": item.get("trackId"),
            "name": item.get("trackName", "Unknown"),
            "artist": item.get("artistName", "Unknown"),
            "album": item.get("collectionName", ""),
            "artwork": (item.get("artworkUrl100") or "").replace("100x100", "300x300"),
            "preview_url": preview_url,
            "duration_ms": item.get("trackTimeMillis", 0),
        })

    return tracks


def get_recommendations(emotion: str, count: int = 20) -> list[dict]:
    """
    Return `count` song recommendations for a given emotion label.
    Picks a random search term from the emotion's pool so results
    feel fresh across repeated scans of the same emotion.
    """
    emotion = emotion.lower()
    terms = EMOTION_SEARCH_TERMS.get(emotion, EMOTION_SEARCH_TERMS["neutral"])

    # Shuffle terms and collect until we have enough tracks
    random.shuffle(terms)
    all_tracks = []
    seen_ids = set()

    for term in terms:
        if len(all_tracks) >= count:
            break
        results = search_itunes(term, limit=25)
        for track in results:
            if track["id"] not in seen_ids:
                seen_ids.add(track["id"])
                all_tracks.append(track)

    # Shuffle the combined pool so the order feels natural
    random.shuffle(all_tracks)
    return all_tracks[:count]