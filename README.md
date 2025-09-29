Instruções para rodar localmente:

- Rodar backend (localhost:8000) -> instruções no README do `https://github.com/marquezzin/autou-backend/`
  
- Clonar esse repositório

- Criar .env com base no .env.example e colocar: VITE_API_URL=http://localhost:8000

- Rodar npm install

- Rodar npm run dev

- Acessar http://localhost:5173

Url em produção disponível: https://autou-frontend-ten.vercel.app/

OBS: Como o backend está hospedado no plano gratuito do render, quando a aplicação fica 15 minutos sem receber uma requisição, a mesma entra em modo "sleep". Então, as vezes se torna necessário esperar no máximo 1 minuto para que o aplicação volte a funcionar corretamente. 
