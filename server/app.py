import openai
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from flask_cors import CORS


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_KEY")

# Read environment variables
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")

# Configure MySQL connection using SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)


def create_table_if_not_exists():
    print("inside create_table_if_not_exists")
    with app.app_context():
        with db.engine.connect() as conn:
            # Check if the table exists
            result = conn.execute(
                text(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'ShoppingItems'"
                )
            )
            if result.fetchone()[0] == 0:
                # Create the table if it doesn't exist
                conn.execute(
                    text(
                        """
                        CREATE TABLE ShoppingItems (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            category VARCHAR(255) NOT NULL
                        )
                        """
                    )
                )


@app.route("/")
def home():
    return "Welcome to the Flask API!"


def parse_item(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are making a shopping items list with 2 fields name and category.",
            },
            {
                "role": "user",
                "content": f"Suggest an appropriate item name and infer the category of the item (if needed) from the following command and format it as 'name: <item>, category: <category>': {prompt}",
            },
        ],
        max_tokens=50,
        temperature=0.3,
    )
    print(response)
    result = response.choices[0].message["content"].strip()
    return result


@app.route("/parse_item", methods=["POST"])
def parse_item_endpoint():
    data = request.json
    prompt = data.get("prompt")
    parsed_item = parse_item(prompt)
    return jsonify({"parsed_item": parsed_item})


@app.route("/items", methods=["GET"])
def get_items():
    try:
        conn = db.engine.connect()
        result = conn.execute(text("SELECT * FROM ShoppingItems"))
        rows = result.fetchall()
        items = [{"id": row[0], "name": row[1], "category": row[2]} for row in rows]
        conn.close()
        return jsonify(items)
    except Exception as e:
        return jsonify({"message": "Failed to fetch items", "error": str(e)}), 500


@app.route("/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    try:
        conn = db.engine.connect()
        result = conn.execute(
            text("SELECT * FROM ShoppingItems WHERE id = :id"), {"id": item_id}
        )
        row = result.fetchone()
        conn.close()
        if row:
            item = {"id": row[0], "name": row[1], "category": row[2]}
            return jsonify(item)
        else:
            return jsonify({"message": "Item not found"}), 404
    except Exception as e:
        return jsonify({"message": "Failed to fetch item", "error": str(e)}), 500


@app.route("/items", methods=["POST"])
def add_item():
    try:
        data = request.json
        name = data.get("name")
        category = data.get("category")
        query = text(
            "INSERT INTO ShoppingItems (name, category) VALUES (:name, :category)"
        )

        with db.engine.begin() as conn:  # Use begin() to ensure commit
            print(
                f"INSERT INTO ShoppingItems (name, category) VALUES ('{name}', '{category}');"
            )
            conn.execute(query, {"name": name, "category": category})

        return jsonify({"message": "Item added successfully"}), 201
    except Exception as e:
        return jsonify({"message": "Failed to add item", "error": str(e)}), 500


@app.route("/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    try:
        data = request.json
        new_name = data.get("name")
        new_category = data.get("category")
        query = text(
            "UPDATE ShoppingItems SET name = :name, category = :category WHERE id = :id"
        )
        with db.engine.begin() as conn:
            conn.execute(
                query, {"name": new_name, "category": new_category, "id": item_id}
            )
        return jsonify({"message": "Item updated successfully"})
    except Exception as e:
        return jsonify({"message": "Failed to update item", "error": str(e)}), 500


@app.route("/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    try:
        query = text("DELETE FROM ShoppingItems WHERE id = :id")
        with db.engine.begin() as conn:  # Ensures that the transaction is properly managed
            result = conn.execute(query, {"id": item_id})
            if result.rowcount == 0:
                return jsonify({"message": "Item not found"}), 404
        return jsonify({"message": "Item deleted successfully"}), 204
    except Exception as e:
        # Log the exception for debugging purposes
        app.logger.error(f"Failed to delete item: {e}")
        return jsonify({"message": "Failed to delete item", "error": str(e)}), 500


@app.route("/items/category/<string:category>", methods=["GET"])
def get_items_by_category(category):
    try:
        query = text("SELECT * FROM ShoppingItems WHERE category = :category")
        with db.engine.begin() as conn:
            result = conn.execute(query, {"category": category})
            rows = result.fetchall()
            items = [{"id": row[0], "name": row[1], "category": row[2]} for row in rows]
        return jsonify(items)
    except Exception as e:
        return (
            jsonify({"message": "Failed to fetch items by category", "error": str(e)}),
            500,
        )


@app.route("/test_db_connection")
def test_db_connection():
    try:
        conn = db.engine.connect()
        result = conn.execute(text("SELECT 1"))
        result.fetchone()
        conn.close()
        return jsonify({"message": "Database connection successful"})
    except Exception as e:
        return jsonify({"message": "Database connection failed", "error": str(e)}), 500


if __name__ == "__main__":
    with app.app_context():
        create_table_if_not_exists()
    app.run(debug=True)
