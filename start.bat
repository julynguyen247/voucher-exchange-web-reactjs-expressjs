start cmd /k "cd fe && npm run dev"
start cmd /k "cd be && npm run dev"

:: start cmd /k "cd chatbot && venv\Scripts\activate && rasa run --enable-api --cors '*' --port 5005"
:: start cmd /k "cd chatbot && venv\Scripts\activate && rasa run actions"