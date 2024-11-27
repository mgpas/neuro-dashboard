from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import os
from statistics import mean
from collections import defaultdict
from datetime import datetime


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

# Rotas para obter os dados do Firestore
@app.route('/api/users', methods=['GET'])
def get_users_data():
    try:
        data_ref = db.collection('users')
        docs = data_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/activities', methods=['GET'])
def get_activities():
    try:
        activities_ref = db.collection('activities')
        activities = []
        for activity in activities_ref.stream():
            data = activity.to_dict()
            data['id'] = activity.id
            
            # Busca subcoleções (avatar, meditation, questionary)
            subcollections = {}
            for subcol in ['avatar', 'meditation', 'questionary']:
                subcol_ref = activities_ref.document(activity.id).collection(subcol)
                subcollections[subcol] = [doc.to_dict() for doc in subcol_ref.stream()]
            
            data['subcollections'] = subcollections
            activities.append(data)
        
        return jsonify(activities), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sessionAvatar', methods=['GET'])
def get_avatar_data():
    try:
        data_ref = db.collection('sessionAvatar')
        docs = data_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sessionMeditation', methods=['GET'])
def get_meditation_data():
    try:
        data_ref = db.collection('sessionMeditation')
        docs = data_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sessionQuestionary', methods=['GET'])
def get_questionary_data():
    try:
        data_ref = db.collection('sessionQuestionary')
        docs = data_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/subscriptions', methods=['GET'])
def get_subscriptions_data():
    try:
        data_ref = db.collection('subscriptions')
        docs = data_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para adicionar novos dados ao Firestore
@app.route('/users', methods=['POST'])
def add_data():
    try:
        new_data = request.json
        db.collection('users').add(new_data)
        return jsonify({"success": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# //////////////////////////////// (brain activity)

def calculate_brain_activity():
    """
    Calcula a média dos sinais cerebrais (brainActivity) a partir dos dados armazenados no Firestore na coleção 'sessionQuestionary'.
    
    Retorna:
    dict: Contendo a média por sessão e a média final.
    """
    
    try:
        # Referência para a coleção 'sessionQuestionary'
        sessions_ref = db.collection('sessionQuestionary')
        sessions = sessions_ref.stream()
        
        session_means = []

        for session in sessions:
            session_data = session.to_dict()
            heg_data = session_data.get("heg_data", [])

            # Print para verificar os dados de heg_data de cada sessão
            print(f"Dados da sessão {session.id} - heg_data: {heg_data}")

            # Converte os dados de heg_data para float e calcula a média por sessão
            if heg_data:
                try:
                    # Convertendo para float e calculando a média
                    float_values = [float(value) for value in heg_data]
                    session_mean = sum(float_values) / len(float_values)
                    session_means.append(session_mean)
                    
                    # Print para verificar a média de cada sessão
                    print(f"Média da sessão {session.id}: {session_mean}")
                except ValueError as e:
                    print(f"Erro ao converter valores de heg_data para float na sessão {session.id}: {e}")
            else:
                print(f"'heg_data' vazio ou ausente na sessão {session.id}")

        # Calcula a média final das médias por sessão
        if session_means:
            final_mean = sum(session_means) / len(session_means)
        else:
            final_mean = 0
        
        # Print para a média final
        print(f"Média final de todas as sessões: {final_mean}")

        return {
            "mean_per_session": session_means,
            "final_mean": final_mean
        }

    except Exception as e:
        print(f"Erro ao calcular a média dos dados de sinais cerebrais: {e}")
        return None
    
@app.route('/api/brain-activity', methods=['GET'])
def get_brain_activity():
    """
    Rota para retornar a média dos sinais cerebrais calculados pela função `calculate_brain_activity`.
    """
    result = calculate_brain_activity()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular a atividade cerebral."}), 500

# ////////////////////////////////

def calculate_game_metrics():
    """
    Calcula os erros Go, erros NoGo e a média do tempo de reação a partir dos dados de 'game_data' na coleção 'sessionQuestionary'.
    
    Retorna:
    dict: Contendo as porcentagens de erros Go e NoGo, além da média do tempo de reação.
    """
    try:
        # Referência para a coleção 'sessionQuestionary'
        sessions_ref = db.collection('sessionQuestionary')
        sessions = sessions_ref.stream()
        
        total_go_errors = 0
        total_nogo_errors = 0
        total_go_count = 0
        total_nogo_count = 0
        total_time_score = 0
        total_iterations = 0

        for session in sessions:
            session_data = session.to_dict()
            game_data = session_data.get("game_data", [])

            # Validando e calculando erros Go/NoGo
            for entry in game_data:
                gonogo = entry.get("gonogo", "")
                is_correct = entry.get("isCorrect", True)  # `isCorrect` é boolean
                time_score = entry.get("timeScore", 0)  # `timeScore` é número
                iteration = entry.get("iteration", 0)  # `iteration` é número

                if gonogo == "go":
                    total_go_count += 1
                    if not is_correct:
                        total_go_errors += 1
                elif gonogo == "nogo":
                    total_nogo_count += 1
                    if not is_correct:
                        total_nogo_errors += 1
                
                # Somando o tempo de reação
                total_time_score += time_score
                total_iterations += iteration

        # Calculando porcentagens de erro
        go_error_percentage = (total_go_errors / total_go_count * 100) if total_go_count > 0 else 0
        nogo_error_percentage = (total_nogo_errors / total_nogo_count * 100) if total_nogo_count > 0 else 0

        # Calculando a média do tempo de reação
        total_time = total_iterations * 2  # Tempo total = 2 segundos por iteração
        reaction_time_average = (total_time_score / total_time * 1000) if total_time > 0 else 0

        # Retornando resultados com duas casas decimais
        return {
            "go_error_percentage": round(go_error_percentage, 2),
            "nogo_error_percentage": round(nogo_error_percentage, 2),
            "reaction_time_average_ms": round(reaction_time_average, 2)
        }

    except Exception as e:
        print(f"Erro ao calcular métricas do jogo: {e}")
        return None

@app.route('/api/game-metrics', methods=['GET'])
def get_game_metrics():
    """
    Rota para retornar os erros Go, erros NoGo e a média do tempo de reação calculados pela função `calculate_game_metrics`.
    """
    result = calculate_game_metrics()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular as métricas do jogo."}), 500
    
# //

def calculate_game_zscores():
    """
    Calcula os z-scores para erros GO, erros NoGO e o tempo de reação com base nos valores calculados em 'calculate_game_metrics'.
    
    Fórmulas:
    GOzscore = (errosGO - 2.3) / 2.83
    NOGOzscore = (errosNOGO - 6.9) / 7.46
    TempoReaçãozscore = (média_tempo_reação - 906.1) / 115.58

    Retorna:
    dict: Contendo os z-scores calculados.
    """
    try:
        # Obtendo os valores calculados pela função `calculate_game_metrics`
        metrics = calculate_game_metrics()
        if not metrics:
            raise ValueError("Erro ao calcular as métricas básicas do jogo.")

        # Obtendo as métricas
        go_error_percentage = metrics.get("go_error_percentage", 0)
        nogo_error_percentage = metrics.get("nogo_error_percentage", 0)
        reaction_time_average_ms = metrics.get("reaction_time_average_ms", 0)

        # Cálculo dos z-scores
        go_zscore = (go_error_percentage - 2.3) / 2.83
        nogo_zscore = (nogo_error_percentage - 6.9) / 7.46
        reaction_time_zscore = (reaction_time_average_ms - 906.1) / 115.58

        return {
            "go_zscore": go_zscore,
            "nogo_zscore": nogo_zscore,
            "reaction_time_zscore": reaction_time_zscore,
        }

    except Exception as e:
        print(f"Erro ao calcular z-scores: {e}")
        return None

@app.route('/api/game-zscores', methods=['GET'])
def get_game_zscores():
    """
    Rota para retornar os z-scores calculados pela função `calculate_game_zscores`.
    """
    result = calculate_game_zscores()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular os z-scores do jogo."}), 500
    
# //

def calculate_corrected_percentages():
    """
    Calcula as porcentagens corrigidas para inattention, hyperactive e reaction time com base nos z-scores.

    Fórmulas:
    new_percentage = (zscore * 25) + 50
    final_percentage = (100 - new_percentage) / 100

    Retorna:
    dict: Contendo as porcentagens corrigidas para cada métrica com duas casas decimais.
    """
    try:
        # Obtendo os z-scores calculados pela função `calculate_game_zscores`
        zscores = calculate_game_zscores()
        if not zscores:
            raise ValueError("Erro ao calcular os z-scores do jogo.")

        # Z-scores
        go_zscore = zscores.get("go_zscore", 0)
        nogo_zscore = zscores.get("nogo_zscore", 0)
        reaction_time_zscore = zscores.get("reaction_time_zscore", 0)

        # Aplicando a correção de porcentagem para cada métrica
        def corrected_percentage(zscore):
            new_percentage = (zscore * 25) + 50
            return (100 - new_percentage) / 100
        
        inattention_final_percentage = corrected_percentage(go_zscore)
        hyperactive_final_percentage = corrected_percentage(nogo_zscore)
        # inattention_final_percentage = round(corrected_percentage(go_zscore) * 100, 2)
        # hyperactive_final_percentage = round(corrected_percentage(nogo_zscore) * 100, 2)
        reactiontime_final_percentage = corrected_percentage(reaction_time_zscore)

        return {
            "inattention_final_percentage": inattention_final_percentage,
            "hyperactive_final_percentage": hyperactive_final_percentage,
            "reactiontime_final_percentage": reactiontime_final_percentage,
        }

    except Exception as e:
        print(f"Erro ao calcular porcentagens corrigidas: {e}")
        return None

@app.route('/api/corrected-percentages', methods=['GET'])
def get_corrected_percentages():
    """
    Rota para retornar as porcentagens corrigidas calculadas pela função `calculate_corrected_percentages`.
    """
    result = calculate_corrected_percentages()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular as porcentagens corrigidas."}), 500
    
# //

def calculate_gonogo_final_mean():
    """
    Calcula a média final (gonogo_game_final_mean) com base nas correções de porcentagem para GO, NoGo e tempo de reação.

    Fórmula:
    gonogo_game_final_mean = ((correcaoPorcentagemGO + correcaoPorcentagemNOGO + correcaoPorcentagemTempoReacao) / 3) * 100

    Retorna:
    dict: Contendo a média final.
    """
    try:
        # Obtendo as porcentagens corrigidas calculadas pela função `calculate_corrected_percentages`
        corrected_percentages = calculate_corrected_percentages()
        if not corrected_percentages:
            raise ValueError("Erro ao calcular as porcentagens corrigidas.")

        # Percentagens corrigidas
        inattention_final_percentage = corrected_percentages.get("inattention_final_percentage", 0)
        hyperactive_final_percentage = corrected_percentages.get("hyperactive_final_percentage", 0)
        reactiontime_final_percentage = corrected_percentages.get("reactiontime_final_percentage", 0)

        # Calculando a média final
        gonogo_game_final_mean = (
            (inattention_final_percentage + hyperactive_final_percentage + reactiontime_final_percentage) / 3
        ) * 100

        return {
            "gonogo_game_final_mean": gonogo_game_final_mean
        }

    except Exception as e:
        print(f"Erro ao calcular a média final do jogo Go/NoGo: {e}")
        return None

@app.route('/api/gonogo-final-mean', methods=['GET'])
def get_gonogo_final_mean():
    """
    Rota para retornar a média final calculada pela função `calculate_gonogo_final_mean`.
    """
    result = calculate_gonogo_final_mean()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular a média final do jogo Go/NoGo."}), 500


# ////////////////////////////////

def calculate_stress_value():
    """
    Calcula o valor de stressValue com base no índice 0 de formAnswers da coleção sessionQuestionary.

    Fórmulas:
    stressScore = (21 - float(formAnswers[0])) / 21
    stressValue = int(stressScore * 100)

    Retorna:
    dict: Contendo o valor calculado de stressValue.
    """
    try:
        # Referência para a coleção 'sessionQuestionary'
        sessions_ref = db.collection('sessionQuestionary')
        sessions = sessions_ref.stream()
        
        stress_values = []

        for session in sessions:
            session_data = session.to_dict()
            form_answers = session_data.get("form_answer", [])
            
            # Validando se o índice 0 existe em formAnswers
            if len(form_answers) > 0:
                try:
                    # Obtendo o valor de stressScore e stressValue
                    stress_score = (21 - float(form_answers[0])) / 21
                    stress_value = int(stress_score * 100)
                    stress_values.append(stress_value)

                    # Print para depuração
                    print(f"Session ID {session.id}: StressValue = {stress_value}")
                except ValueError as e:
                    print(f"Erro ao converter formAnswers[0] em float na sessão {session.id}: {e}")
            else:
                print(f"formAnswers vazio ou ausente na sessão {session.id}")
        
        # Retornar todos os valores de stressValue calculados
        return {
            "stress_values": stress_values
        }

    except Exception as e:
        print(f"Erro ao calcular o valor de stressValue: {e}")
        return None

@app.route('/api/stress-value', methods=['GET'])
def get_stress_value():
    """
    Rota para retornar os valores de stressValue calculados pela função `calculate_stress_value`.
    """
    result = calculate_stress_value()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular os valores de stressValue."}), 500

# //

def calculate_focus_value():
    """
    Calcula o valor de focusValue com base no índice 1 de formAnswers da coleção sessionQuestionary.

    Fórmulas:
    focusScore = (36 - float(formAnswers[1])) / 36
    focusValue = int(focusScore * 100)

    Retorna:
    dict: Contendo os valores calculados de focusValue.
    """
    try:
        # Referência para a coleção 'sessionQuestionary'
        sessions_ref = db.collection('sessionQuestionary')
        sessions = sessions_ref.stream()

        focus_values = []

        for session in sessions:
            session_data = session.to_dict()
            form_answers = session_data.get("form_answer", [])

            # Validando se o índice 1 existe em formAnswers
            if len(form_answers) > 1:
                try:
                    # Obtendo o valor de focusScore e focusValue
                    focus_score = (36 - float(form_answers[1])) / 36
                    focus_value = int(focus_score * 100)
                    focus_values.append(focus_value)

                    # Print para depuração
                    print(f"Session ID {session.id}: FocusValue = {focus_value}")
                except ValueError as e:
                    print(f"Erro ao converter formAnswers[1] em float na sessão {session.id}: {e}")
            else:
                print(f"formAnswers não possui índice 1 na sessão {session.id}")

        # Retornar todos os valores de focusValue calculados
        return {
            "focus_values": focus_values
        }

    except Exception as e:
        print(f"Erro ao calcular o valor de focusValue: {e}")
        return None

@app.route('/api/focus-value', methods=['GET'])
def get_focus_value():
    """
    Rota para retornar os valores de focusValue calculados pela função `calculate_focus_value`.
    """
    result = calculate_focus_value()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular os valores de focusValue."}), 500
    
# //

def calculate_control_value():
    """
    Calcula o valor de controlValue com base no índice 2 de formAnswers da coleção sessionQuestionary.

    Fórmulas:
    controlScore = (36 - float(formAnswers[2])) / 36
    controlValue = int(controlScore * 100)

    Retorna:
    dict: Contendo os valores calculados de controlValue.
    """
    try:
        # Referência para a coleção 'sessionQuestionary'
        sessions_ref = db.collection('sessionQuestionary')
        sessions = sessions_ref.stream()

        control_values = []

        for session in sessions:
            session_data = session.to_dict()
            form_answers = session_data.get("form_answer", [])

            # Validando se o índice 2 existe em formAnswers
            if len(form_answers) > 2:
                try:
                    # Obtendo o valor de controlScore e controlValue
                    control_score = (36 - float(form_answers[2])) / 36
                    control_value = int(control_score * 100)
                    control_values.append(control_value)

                    # Print para depuração
                    print(f"Session ID {session.id}: ControlValue = {control_value}")
                except ValueError as e:
                    print(f"Erro ao converter formAnswers[2] em float na sessão {session.id}: {e}")
            else:
                print(f"formAnswers não possui índice 2 na sessão {session.id}")

        # Retornar todos os valores de controlValue calculados
        return {
            "control_values": control_values
        }

    except Exception as e:
        print(f"Erro ao calcular o valor de controlValue: {e}")
        return None

@app.route('/api/control-value', methods=['GET'])
def get_control_value():
    """
    Rota para retornar os valores de controlValue calculados pela função `calculate_control_value`.
    """
    result = calculate_control_value()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular os valores de controlValue."}), 500

# ////////////////////////////////

def calculate_performance_global():
    """
    Calcula o valor de PerformanceGlobal com base nos resultados das funções:
    - brainActivity
    - gonogo_game_final_mean
    - stressValue
    - focusValue
    - controlValue
    
    Retorna:
    dict: Contendo o valor de PerformanceGlobal e os componentes utilizados no cálculo.
    """
    try:
        # Chamando as funções para obter os valores necessários
        brain_activity_result = calculate_brain_activity()
        gonogo_result = calculate_gonogo_final_mean()  # Supondo que você tem esta função pronta
        stress_result = calculate_stress_value()       # Função para stressValue
        focus_result = calculate_focus_value()         # Função para focusValue
        control_result = calculate_control_value()     # Função para controlValue
        
        # Validar se todos os resultados foram calculados corretamente
        if not all([brain_activity_result, gonogo_result, stress_result, focus_result, control_result]):
            return {"error": "Erro ao calcular um ou mais componentes de PerformanceGlobal."}
        
        # Extraindo os valores necessários
        brain_activity = brain_activity_result.get("final_mean", 0)
        gonogo_game_final_mean = gonogo_result.get("final_mean", 0)
        stress_value = stress_result.get("stress_value", 0)
        focus_value = focus_result.get("focus_value", 0)
        control_value = control_result.get("control_value", 0)
        
        # Calculando PerformanceGlobal
        performance_global = (
            brain_activity +
            gonogo_game_final_mean +
            stress_value +
            focus_value +
            control_value
        ) / 5
        
        # Retornando o resultado
        return {
            "brain_activity": brain_activity,
            "gonogo_game_final_mean": gonogo_game_final_mean,
            "stress_value": stress_value,
            "focus_value": focus_value,
            "control_value": control_value,
            "performance_global": performance_global
        }
    
    except Exception as e:
        print(f"Erro ao calcular PerformanceGlobal: {e}")
        return {"error": "Erro ao calcular PerformanceGlobal."}

@app.route('/api/performance-global', methods=['GET'])
def get_performance_global():
    """
    Rota para calcular e retornar o valor de PerformanceGlobal.
    """
    result = calculate_performance_global()
    
    if "error" not in result:
        return jsonify(result)  # Retorna o resultado como JSON
    else:
        return jsonify(result), 500  # Retorna o erro com status HTTP 500

# ////////////////////////////////

def calculate_global_performance():
    """
    Calcula o PerformanceGlobal usando os valores de:
    - brainActivity
    - gonogo_game_final_mean
    - stressValue
    - focusValue
    - controlValue

    Fórmula:
    PerformanceGlobal = (brainActivity + gonogo_game_final_mean + stressValue + focusValue + controlValue) / 5

    Retorna:
    dict: Contendo o valor calculado de PerformanceGlobal.
    """
    try:
        # Chamando as funções anteriores para obter os valores
        brain_activity = calculate_brain_activity()  # Média final dos sinais cerebrais
        gonogo_metrics = calculate_gonogo_final_mean()  # gonogo_game_final_mean
        stress_values = calculate_stress_value()  # stress_values (usando média como exemplo)
        focus_values = calculate_focus_value()  # focus_values (usando média como exemplo)
        control_values = calculate_control_value()  # control_values (usando média como exemplo)

        # Obtendo os valores específicos sem valores padrão
        brain_activity_mean = brain_activity["final_mean"]
        gonogo_final_mean = gonogo_metrics["gonogo_game_final_mean"]
        stress_mean = sum(stress_values["stress_values"]) / len(stress_values["stress_values"])
        focus_mean = sum(focus_values["focus_values"]) / len(focus_values["focus_values"])
        control_mean = sum(control_values["control_values"]) / len(control_values["control_values"])

        # Calculando o PerformanceGlobal
        performance_global = (brain_activity_mean + gonogo_final_mean + stress_mean + focus_mean + control_mean) / 5

        # Limitando o resultado a duas casas decimais
        performance_global = round(performance_global, 2)

        # Print para depuração
        print(f"PerformanceGlobal: {performance_global}")

        return {
            "PerformanceGlobal": performance_global
        }

    except KeyError as e:
        print(f"Erro: Chave ausente nos dados: {e}")
        return None
    except ZeroDivisionError as e:
        print(f"Erro: Tentativa de divisão por zero: {e}")
        return None
    except Exception as e:
        print(f"Erro ao calcular o PerformanceGlobal: {e}")
        return None


@app.route('/api/global-performance', methods=['GET'])
def get_global_performance():
    """
    Rota para retornar o valor de PerformanceGlobal calculado pela função `calculate_global_performance`.
    """
    result = calculate_global_performance()
    
    if result:
        return jsonify(result)  # Retorna o resultado como um JSON
    else:
        return jsonify({"error": "Erro ao calcular o PerformanceGlobal."}), 500



# ////////////////////////////////

if __name__ == '__main__':
    app.run(debug=True)
