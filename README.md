# Dashboard Neural

Este projeto é um **Dashboard Neural** desenvolvido por alunos do curso de **Análise e Desenvolvimento de Sistemas**, em parceria com uma empresa do setor. O objetivo deste dashboard é fornecer uma interface intuitiva e interativa para visualização e análise de dados relacionados a modelos neurais, permitindo que usuários tomem decisões informadas com base em insights derivados dos dados.

## Estrutura do Projeto

A estrutura do projeto é a seguinte:
```perl
neuro-dashboard/
│
├── backend/
│   ├── venv/                     # Ambiente virtual
│   ├── app.py                    # Seu arquivo principal do backend
│   ├── requirements.txt          # Dependências do Python
│   └── .env                      # Insira o .env do backend aqui
│
├── frontend/
│   └── my-dashboard/             # Frontend do projeto, insira o .env do frontend aqui
│       ├── node_modules          # Módulos
│       ├── public                # Logos
│       └── src                   # Pasta onde estão as telas do projeto
│
├── .gitignore                      
├── .nvmrc                        # Arquivo para definir a versão do Node.js
└── README.md                     # Documentação do projeto

```

## Tecnologias Utilizadas

- **Frontend**: React
- **Backend**: Python (Flask)
- **Banco de Dados**: Firebase
- **Gerenciamento de Versões**: Node Version Manager (nvm) para Node.js
- **Ambientes Virtuais**: venv para gerenciamento de dependências do Python

## Configuração do Ambiente

### Requisitos

1. **Python**: Certifique-se de ter o Python instalado, a versão utilizada no projeto está dee acordo com a iniciação do venv.
2. **Node.js**: Use a versão especificada no arquivo `.nvmrc` (18.17.0).
3. **nvm**: Instale o Node Version Manager para facilitar a gestão de versões do Node.js.

## Instalação

Clone o repositório:

   ```bash
   git clone https://github.com/mgpas/neuro-dashboard.git
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

1. Use a versão do Node.js especificada:

    ```bash
    nvm use
    ```

1. Navegue até a pasta do frontend:

    ```bash
    cd ../frontend/my-dashboard
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

    cd frontend/my-dashboard
    npm start

### Dicas Finais
- Lembre-se de inserir os arquivos .env no local indicado.
- Para as requisições de dados funcionarem adequadamente os servidores do back e front devem estar funcionando. Divida ou então abra mais de um terminal.
