from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)

# Inicialize o Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route('/api/data', methods=['GET'])
def get_data():
    # Obtenha dados do Firestore
    data_ref = db.collection('dashboardData')
    docs = data_ref.stream()
    data = {doc.id: doc.to_dict() for doc in docs}
    return jsonify(data)

@app.route('/api/data', methods=['POST'])
def add_data():
    new_data = request.json
    db.collection('dashboardData').add(new_data)
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)
