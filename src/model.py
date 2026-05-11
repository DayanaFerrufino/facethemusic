import tensorflow as tf
from tensorflow.keras import layers, models, regularizers

def build_model(num_classes=7):
    # Input shape is 48x48 grayscale because FER-2013 face images use this size.
    inputs = tf.keras.Input(shape=(48, 48, 1))

    # Block 1 learns simple facial patterns such as edges and small shapes.
    x = layers.Conv2D(64, (3,3), padding='same', kernel_regularizer=regularizers.l2(1e-4))(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Conv2D(64, (3,3), padding='same', kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.MaxPooling2D(2, 2)(x)
    x = layers.Dropout(0.3)(x)

    # Block 2 learns more detailed face features from the first block.
    x = layers.Conv2D(128, (3,3), padding='same', kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Conv2D(128, (3,3), padding='same', kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.MaxPooling2D(2, 2)(x)
    x = layers.Dropout(0.3)(x)

    # Block 3 learns higher-level emotion patterns from the face.
    x = layers.Conv2D(256, (3,3), padding='same', kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Conv2D(256, (3,3), padding='same', kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.MaxPooling2D(2, 2)(x)
    x = layers.Dropout(0.35)(x)

    # 1x1 convolution acts like a simple attention step to highlight useful features.
    x = layers.Conv2D(256, (1,1), padding='same', activation='sigmoid')(x)

    # Classifier turns learned face features into one of the emotion classes.
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(512, kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(256, kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.4)(x)

    # Softmax outputs a probability for each emotion class.
    outputs = layers.Dense(num_classes, activation='softmax')(x)

    # Return the complete Keras model so train.py can compile and train it.
    return tf.keras.Model(inputs, outputs)
