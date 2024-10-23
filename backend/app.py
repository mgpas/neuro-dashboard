from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Verificar se todas as variáveis necessárias foram carregadas
required_vars = [
    "TYPE", "PROJECT_ID", "PRIVATE_KEY_ID", "PRIVATE_KEY",
    "CLIENT_EMAIL", "CLIENT_ID", "AUTH_URI", "TOKEN_URI",
    "AUTH_PROVIDER_X509_CERT_URL", "CLIENT_X509_CERT_URL"
]

# Exibir um erro se alguma variável estiver faltando
for var in required_vars:
    if os.getenv(var) is None:
        raise EnvironmentError(f"A variável de ambiente {var} não foi definida no arquivo .env")

# Crie um dicionário com as credenciais do Firebase a partir das variáveis de ambiente
firebase_credentials = {
    "type": os.getenv("TYPE"),
    "project_id": os.getenv("PROJECT_ID"),
    "private_key_id": os.getenv("PRIVATE_KEY_ID"),
    "private_key": os.getenv("PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("CLIENT_EMAIL"),
    "client_id": os.getenv("CLIENT_ID"),
    "auth_uri": os.getenv("AUTH_URI"),
    "token_uri": os.getenv("TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("CLIENT_X509_CERT_URL")
}

# Inicialize o Firebase Admin SDK usando as credenciais carregadas das variáveis de ambiente
cred = credentials.Certificate(firebase_credentials)
firebase_admin.initialize_app(cred)

# Conexão com o Firestore
db = firestore.client()

# Rota para obter os dados do Firestore
@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        data_ref = db.collection('dashboardData')
        docs = data_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para adicionar novos dados ao Firestore
@app.route('/api/data', methods=['POST'])
def add_data():
    try:
        new_data = request.json
        db.collection('dashboardData').add(new_data)
        return jsonify({"success": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
