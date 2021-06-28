import json
import sys
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.datasets import mnist


def main():
    input = json.loads(sys.stdin.readlines()[0])
    sample = np.array(input)
    pred = classify(sample)
    print(pred)


# Get dataset and preprocess
def load_dataset():
    (X_train, y_train), (X_test, y_test) = mnist.load_data(
        path=os.getcwd() + "/mnist.npz"
    )
    # Reshape dataset to have a single channel
    X_train = X_train.reshape((X_train.shape[0], 28, 28, 1))
    X_test = X_test.reshape((X_test.shape[0], 28, 28, 1))
    # One hot encode target values
    y_train = to_categorical(y_train)
    y_test = to_categorical(y_test)
    # Convert integers to floats
    X_train = X_train.astype("float32")
    X_test = X_test.astype("float32")
    # Normalize to range 0-1
    X_train = X_train / 255.0
    X_test = X_test / 255.0
    return X_train, y_train, X_test, y_test


# Classify single sample
def classify(sample):
    model = tf.keras.models.load_model("model.h5")
    probs = model.predict(sample.reshape(1, 28, 28, 1))[0]
    pred = np.argmax(probs)
    return pred


# Create cnn model
def create_model():
    # Create layers
    model = tf.keras.Sequential([
        tf.keras.layers.Conv2D(
            32,
            (3, 3),
            activation="relu",
            kernel_initializer="he_uniform",
            input_shape=(28, 28, 1),
        ),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(
            100, activation="relu", kernel_initializer="he_uniform"
        ),
        tf.keras.layers.Dense(10, activation="softmax"),
    ])

    # Compile model
    opt = SGD(learning_rate=0.01, momentum=0.9)
    model.compile(optimizer=opt, loss="categorical_crossentropy", metrics=["accuracy"])
    return model


# Train and return model
def train_model(X_train, y_train):
    model = create_model()
    model.fit(X_train, y_train, epochs=10)
    model.save("model.h5")
    return model


# Load and return model
def load_model():
    model = tf.keras.models.load_model("model.h5")
    return model


if __name__ == "__main__":
    main()
