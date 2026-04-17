import os
import matplotlib.pyplot as plt

data_dir = "data"
splits = ["train", "test"]
emotions = os.listdir(os.path.join(data_dir, "train"))

# Count images per emotion
for split in splits:
    print(f"\n{split.upper()}")
    total = 0
    for emotion in emotions:
        path = os.path.join(data_dir, split, emotion)
        count = len(os.listdir(path))
        total += count
        print(f"  {emotion}: {count}")
    print(f"  Total: {total}")

# Plot distribution
counts = []
for emotion in emotions:
    path = os.path.join(data_dir, "train", emotion)
    counts.append(len(os.listdir(path)))

plt.figure(figsize=(10, 5))
plt.bar(emotions, counts, color="steelblue")
plt.title("Training samples per emotion")
plt.xlabel("Emotion")
plt.ylabel("Count")
plt.tight_layout()
plt.savefig("emotion_distribution.png")
plt.show()