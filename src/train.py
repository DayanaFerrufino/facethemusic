import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from model import build_model

# Folder that contains data/train and data/test.
data_dir = "data"

# Training settings for image size, batch size, and number of passes through data.
IMG_SIZE = 48
BATCH_SIZE = 64
EPOCHS = 50

# Emotion folder names must match the dataset folders and model output order.
EMOTIONS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

# Training generator rescales images and adds augmentation to reduce overfitting.
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    zoom_range=0.2,
    brightness_range=[0.6, 1.4],
    horizontal_flip=True,
    shear_range=0.1,
    fill_mode='nearest'
)

# Test data is only rescaled, not augmented, so validation stays realistic.
test_datagen = ImageDataGenerator(rescale=1./255)

# Load training images from data/train with one folder per emotion.
train_gen = train_datagen.flow_from_directory(
    f"{data_dir}/train",
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode='grayscale',
    batch_size=BATCH_SIZE,
    classes=EMOTIONS,
    class_mode='categorical'
)

# Load testing images from data/test for validation during training.
test_gen = test_datagen.flow_from_directory(
    f"{data_dir}/test",
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode='grayscale',
    batch_size=BATCH_SIZE,
    classes=EMOTIONS,
    class_mode='categorical'
)

# Build the CNN model defined in model.py.
model = build_model(num_classes=7)

# Compile the model with Adam optimizer and categorical loss for 7 emotion classes.
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Print the model structure so we can inspect the layers before training.
model.summary()

callbacks = [
    # Stop training when validation accuracy stops improving.
    EarlyStopping(
        monitor="val_accuracy",
        patience=10,
        restore_best_weights=True,
        verbose=1
    ),

    # Save the best model during training.
    ModelCheckpoint(
        "models/emotion_model.keras",
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),

    # Lower the learning rate when validation loss stops improving.
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=4,
        min_lr=1e-7,
        verbose=1
    )
]

# Train the model using the training data and validate on the test data.
history = model.fit(
    train_gen,
    validation_data=test_gen,
    epochs=EPOCHS,
    callbacks=callbacks
)

# Save the final model file used by the FastAPI backend.
model.save("models/emotion_model.keras")
print("Model saved!")
