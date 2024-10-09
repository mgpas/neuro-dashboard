# Dashboard Neural

Este projeto é um **Dashboard Neural** desenvolvido por alunos do curso de **Análise e Desenvolvimento de Sistemas**, em parceria com uma empresa do setor. O objetivo deste dashboard é fornecer uma interface intuitiva e interativa para visualização e análise de dados relacionados a modelos neurais, permitindo que usuários tomem decisões informadas com base em insights derivados dos dados.

## Estrutura do Projeto

A estrutura do projeto é a seguinte:
```perl
my-dashboard-project/
│
├── backend/
│   ├── venv/                     # Ambiente virtual
│   ├── app.py                    # Seu arquivo principal do backend
│   ├── requirements.txt          # Dependências do Python
│   └── serviceAccountKey.json     # Arquivo da chave de serviço do Firebase
│
├── frontend/
│   └── my-dashboard/              # Frontend do projeto
│
├── .nvmrc                          # Arquivo para definir a versão do Node.js
└── README.md                       # Documentação do projeto

```

## Tecnologias Utilizadas

- **Frontend**: React
- **Backend**: Python (Flask ou FastAPI)
- **Banco de Dados**: Firebase
- **Gerenciamento de Versões**: Node Version Manager (nvm) para Node.js
- **Ambientes Virtuais**: venv para gerenciamento de dependências do Python

## Configuração do Ambiente

### Requisitos

1. **Python**: Certifique-se de ter o Python 3.12.7 instalado.
2. **Node.js**: Use a versão especificada no arquivo `.nvmrc` (18.17.0).
3. **nvm**: Instale o Node Version Manager para facilitar a gestão de versões do Node.js.

## Instalação

Clone o repositório:

   ```bash
   git clone https://github.com/seuusuario/my-dashboard-project.git
   cd my-dashboard-project
   ```

### Configurar o Backend:

1. Navegue até a pasta do backend:

    ```bash 
    cd backend
    ```

2. Crie e ative o ambiente virtual:

    ```bash
    python -m venv venv
    source venv/bin/activate  # macOS/Linux
    venv\Scripts\activate     # Windows
    ```

3. Instale as dependências:

    ```bash
    pip install -r requirements.txt
    ```

### Configurar o Frontend:

1. Navegue até a pasta do frontend:

    ```bash
    cd ../frontend/my-dashboard
    ```

2. Use a versão do Node.js especificada:

    ```bash
    nvm use
    ```

3. Instale as dependências do frontend:

    ```bash
    npm install
    ```

## Executando o Projeto
### Backend
Para iniciar o backend, execute:

    cd backend
    python app.py


### Frontend
Para iniciar o frontend, execute:

    cd ../frontend/my-dashboard
    npm start

### Dicas Finais
- Lembre-se de substituir os placeholders (como `seuusuario`, `[Nome]`, e `[email@example.com]`) com as informações reais do seu projeto e equipe.
