import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from model import build_model

data_dir = "data"
IMG_SIZE = 48
BATCH_SIZE = 64
EPOCHS = 30
EMOTIONS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

# Data generators
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=10,
    horizontal_flip=True
)

test_datagen = ImageDataGenerator(rescale=1./255)

train_gen = train_datagen.flow_from_directory(
    f"{data_dir}/train",
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode='grayscale',
    batch_size=BATCH_SIZE,
    classes=EMOTIONS,
    class_mode='categorical'
)

test_gen = test_datagen.flow_from_directory(
    f"{data_dir}/test",
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode='grayscale',
    batch_size=BATCH_SIZE,
    classes=EMOTIONS,
    class_mode='categorical'
)

# Build and compile
model = build_model(num_classes=7)
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# Train
history = model.fit(
    train_gen,
    validation_data=test_gen,
    epochs=EPOCHS
)

# Save
model.save("models/emotion_model.keras")
print("Model saved!")