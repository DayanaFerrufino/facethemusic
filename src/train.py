import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from model import build_model

data_dir = "data"
IMG_SIZE = 48
BATCH_SIZE = 64
EPOCHS = 30
EMOTIONS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    brightness_range=[0.8, 1.2],
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

callbacks = [
    EarlyStopping(
        monitor="val_accuracy",
        patience=6,
        restore_best_weights=True
    ),
    ModelCheckpoint(
        "models/emotion_model.keras",
        monitor="val_accuracy",
        save_best_only=True
    )
]

# Train
history = model.fit(
    train_gen,
    validation_data=test_gen,
    epochs=EPOCHS,
    callbacks=callbacks
)

# Save
model.save("models/emotion_model.keras")
print("Model saved!")
