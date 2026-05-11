import os
import matplotlib.pyplot as plt

# Folder that contains the FER-2013 train and test image folders.
data_dir = "data"

# These are the dataset splits we want to inspect.
splits = ["train", "test"]

# Emotion folder names are read from data/train so the script matches the dataset.
emotions = os.listdir(os.path.join(data_dir, "train"))

# Count images per emotion to check if the dataset is balanced or uneven.
for split in splits:
    print(f"\n{split.upper()}")
    total = 0
    for emotion in emotions:
        path = os.path.join(data_dir, split, emotion)
        count = len(os.listdir(path))
        total += count
        print(f"  {emotion}: {count}")
    print(f"  Total: {total}")

# Create a bar chart showing how many training images each emotion has.
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

# Save the chart so it can be used in reports or presentation slides.
plt.savefig("emotion_distribution.png")

# Show the chart on screen when running the script locally.
plt.show()
