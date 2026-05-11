import json
import random
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MUSIC_DATA_PATH = BASE_DIR / "data" / "music" / "spotify_10000.csv"
SENTIMENT_DATA_PATH = BASE_DIR / "data" / "music" / "music_sentiment.csv"
ITUNES_SEARCH_URL = "https://itunes.apple.com/search"
ITUNES_CACHE = {}

FEATURES = [
    "danceability",
    "energy",
    "valence",
    "acousticness",
    "tempo",
    "loudness",
]

SCORING_FEATURES = [
    "danceability",
    "energy",
    "valence",
    "acousticness",
    "tempo_norm",
    "loudness_norm",
]

EMOTION_PROFILES = {
    "happy": {
        "danceability": 0.78,
        "energy": 0.78,
        "valence": 0.88,
        "acousticness": 0.20,
        "tempo": 125,
        "loudness": -5,
    },
    "sad": {
        "danceability": 0.42,
        "energy": 0.35,
        "valence": 0.22,
        "acousticness": 0.65,
        "tempo": 85,
        "loudness": -11,
    },
    "angry": {
        "danceability": 0.55,
        "energy": 0.92,
        "valence": 0.32,
        "acousticness": 0.08,
        "tempo": 140,
        "loudness": -4,
    },
    "fear": {
        "danceability": 0.40,
        "energy": 0.65,
        "valence": 0.20,
        "acousticness": 0.25,
        "tempo": 115,
        "loudness": -8,
    },
    "surprise": {
        "danceability": 0.70,
        "energy": 0.82,
        "valence": 0.65,
        "acousticness": 0.18,
        "tempo": 132,
        "loudness": -5,
    },
    "neutral": {
        "danceability": 0.58,
        "energy": 0.52,
        "valence": 0.52,
        "acousticness": 0.45,
        "tempo": 105,
        "loudness": -8,
    },
    "disgust": {
        "danceability": 0.45,
        "energy": 0.70,
        "valence": 0.18,
        "acousticness": 0.15,
        "tempo": 120,
        "loudness": -6,
    },
}


def load_music_data():
    df = pd.read_csv(MUSIC_DATA_PATH)

    df = df.dropna(
        subset=[
            "track_name",
            "first_artist",
            *FEATURES,
            "duration_ms",
        ]
    ).copy()

    df["tempo_norm"] = (df["tempo"] - 60) / (180 - 60)
    df["loudness_norm"] = (df["loudness"] - (-30)) / (3 - (-30))

    return df


MUSIC_DF = load_music_data()


def scale_between(value, source_min, source_max, target_min, target_max):
    if source_max == source_min:
        return target_min

    ratio = (value - source_min) / (source_max - source_min)
    return target_min + ratio * (target_max - target_min)


def apply_sentiment_dataset_profiles():
    if not SENTIMENT_DATA_PATH.exists():
        return

    sentiment_df = pd.read_csv(SENTIMENT_DATA_PATH)

    sentiment_features = ["tempo", "energy", "loudness"]
    sentiment_profiles = sentiment_df.groupby("sentiment")[sentiment_features].mean()

    for feature in sentiment_features:
        source_min = sentiment_profiles[feature].min()
        source_max = sentiment_profiles[feature].max()

        target_values = [profile[feature] for profile in EMOTION_PROFILES.values()]
        target_min = min(target_values)
        target_max = max(target_values)

        for emotion, row in sentiment_profiles.iterrows():
            if emotion not in EMOTION_PROFILES:
                continue

            EMOTION_PROFILES[emotion][feature] = float(
                scale_between(
                    row[feature],
                    source_min,
                    source_max,
                    target_min,
                    target_max,
                )
            )


apply_sentiment_dataset_profiles()


def fetch_url(url):
    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"[fetch] Failed for {url}: {e}")
        return None


def get_itunes_metadata(track_name, artist_name):
    cache_key = (str(track_name).lower(), str(artist_name).lower())

    if cache_key in ITUNES_CACHE:
        return ITUNES_CACHE[cache_key]

    params = urllib.parse.urlencode(
        {
            "term": f"{track_name} {artist_name}",
            "entity": "song",
            "media": "music",
            "limit": 3,
            "country": "US",
            "lang": "en_us",
        }
    )

    data = fetch_url(f"{ITUNES_SEARCH_URL}?{params}")
    result = None

    if data:
        for item in data.get("results", []):
            artwork = item.get("artworkUrl100", "")
            preview = item.get("previewUrl", "")

            if artwork or preview:
                result = {
                    "artwork": artwork.replace("100x100", "300x300"),
                    "preview_url": preview,
                    "duration_ms": item.get("trackTimeMillis", 0),
                }
                break

    ITUNES_CACHE[cache_key] = result
    return result


def clean_optional_value(value):
    if pd.isna(value):
        return ""
    return str(value)


def normalize_profile(profile):
    profile = profile.copy()
    profile["tempo_norm"] = (profile.pop("tempo") - 60) / (180 - 60)
    profile["loudness_norm"] = (profile.pop("loudness") - (-30)) / (3 - (-30))
    return profile


def get_recommendations(emotion, count=20):
    emotion = (emotion or "neutral").lower()
    profile = normalize_profile(
        EMOTION_PROFILES.get(emotion, EMOTION_PROFILES["neutral"])
    )

    scores = np.zeros(len(MUSIC_DF))

    for feature in SCORING_FEATURES:
        scores += (MUSIC_DF[feature] - profile[feature]) ** 2

    ranked = MUSIC_DF.assign(score=scores).sort_values("score")

    # Pick from the best matches, then shuffle so results are not identical every scan.
    pool = ranked.head(300).sample(frac=1, random_state=random.randint(1, 999999))

    songs = []

    for _, song in pool.head(120).iterrows():
        itunes = get_itunes_metadata(song["track_name"], song["first_artist"])

        artwork = ""
        preview_url = clean_optional_value(song.get("track_preview", ""))
        duration_ms = int(song["duration_ms"])

        if itunes:
            artwork = itunes.get("artwork") or ""
            preview_url = preview_url or itunes.get("preview_url")
            duration_ms = int(itunes.get("duration_ms") or duration_ms)

        if not preview_url:
            continue

        songs.append(
            {
                "id": str(song["track_id"]),
                "name": song["track_name"],
                "artist": song["first_artist"],
                "album": song.get("album_name", ""),
                "artwork": artwork,
                "preview_url": preview_url,
                "duration_ms": duration_ms,
            }
        )

        if len(songs) >= count:
            break

    return songs