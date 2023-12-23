import os
import requests
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.datasets import mnist

load_dotenv()
app = Flask(__name__)
CORS(app)


@app.route("/", methods=["POST"])
def index():
    sample = request.json["sample"]
    prediction = str(classify(sample))
    if not prediction:
        return "Something went wrong, try again later", 500
    # Log digit
    try:
        r = requests.post(
            os.getenv("DB_URI"),
            json={"sample": sample, "prediction": prediction, "date": datetime.datetime.now().isoformat()},
        )
        r.raise_for_status()
    except requests.exceptions.HTTPError as err:
        # Fail gracefully
        print(err)
    return jsonify({"prediction": prediction})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    return app.send_static_file("index.html")


# Get dataset and preprocess
def load_dataset(path=os.path.join(os.getcwd(), "mnist.npz")):
    (X_train, y_train), (X_test, y_test) = mnist.load_data(path)
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


# Create CNN model
def create_model(path=None):
    # Create layers
    model = tf.keras.Sequential(
        [
            tf.keras.layers.Conv2D(
                32,
                (3, 3),
                activation="relu",
                kernel_initializer="he_uniform",
                input_shape=(28, 28, 1),
            ),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(100, activation="relu", kernel_initializer="he_uniform"),
            tf.keras.layers.Dense(10, activation="softmax"),
        ]
    )
    # Compile model
    opt = SGD(learning_rate=0.01, momentum=0.9)
    model.compile(optimizer=opt, loss="categorical_crossentropy", metrics=["accuracy"])
    if path:
        model.save(path)
    return model


# Train and return model
def train_model(model, X_train, y_train, save_path=os.path.join(os.getcwd(), "model.h5"), verbose=0):
    model.fit(X_train, y_train, epochs=10, verbose=verbose)
    if save_path:
        model.save(save_path)
    return model


# Classify single sample from model
def classify(sample, model=None, path=os.path.join(os.getcwd(), "model.h5")):
    sample = np.array(sample)
    if not model:
        model = tf.keras.models.load_model(path)
    pred = np.argmax(model.predict(sample.reshape(1, 28, 28, 1))[0]).item()
    return pred


if __name__ == "__main__":
    app.run(debug=True, port=os.getenv("PORT", default=5000))
