/* Reset básico */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background-color: #18181b;
    color: #f4f4f5;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
}

header {
    background-color: #9146ff;
    width: 100%;
    padding: 1rem 0;
    text-align: center;
    color: white;
}

.logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.twitch-logo {
    height: 40px;
    width: auto;
}

h1 {
    font-size: 2rem;
    font-weight: bold;
}

main {
    flex-grow: 1;
    display: flex;
    flex-direction: column; /* Alinha os elementos em coluna */
    justify-content: flex-start;
    align-items: center;
    text-align: center;
    padding: 20px;
    gap: 20px; /* Espaçamento entre o status e o chat */
}

/* Status ao vivo */
.live-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    max-width: 600px; /* Limita o tamanho em telas maiores */
}

#live-status {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #292b2f;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    width: 100%;
    justify-content: center;
}

.live-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
}

.live-light {
    height: 20px;
    width: 20px;
    background-color: red;
    border-radius: 50%;
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

#status-message {
    margin-top: 10px;
    font-size: 1.2rem;
    color: #f4f4f5;
}

/* Chat em tempo real */
#chat-container {
    width: 100%;
    max-width: 600px; /* Limita o tamanho em telas maiores */
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

#chat-container iframe {
    width: 100%;
    height: 500px; /* Altura padrão */
}

/* Responsividade para dispositivos móveis */
@media (max-width: 768px) {
    #live-status {
        padding: 10px 15px;
    }

    .live-text {
        font-size: 1.2rem;
    }

    .live-light {
        height: 15px;
        width: 15px;
    }

    #chat-container iframe {
        height: 400px; /* Altura reduzida em tablets */
    }
}

@media (max-width: 480px) {
    #live-status {
        flex-direction: column;
        gap: 5px;
    }

    .live-text {
        font-size: 1rem;
    }

    .live-light {
        height: 12px;
        width: 12px;
    }

    #chat-container iframe {
        height: 300px; /* Altura reduzida em smartphones */
    }
}

/* Outros estilos existentes */
.status-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #292b2f;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.5);
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.status-container p {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

.days-counter {
    font-size: 4rem;
    font-weight: bold;
    color: #9146ff; /* Roxo Twitch */
    display: flex;
    align-items: center;
    gap: 10px;
}

footer {
    background-color: #9146ff;
    width: 100%;
    text-align: center;
    padding: 1rem 0;
    color: white;
}

/* Estilo do menu de navegação */
nav {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    gap: 10px;
}

nav button {
    background-color: #9146ff;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

nav button:hover {
    background-color: #772ce8;
}

nav button.active {
    background-color: #5a14b2;
}

/* Esconde as abas inativas */
.tab-content.hidden {
    display: none;
}

/* Estilo dos clipes */
#clips-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.clip {
    background-color: #292b2f;
    border-radius: 10px;
    overflow: hidden;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.clip iframe {
    width: 100%;
    height: 200px;
    border: none;
}

.clip-title {
    padding: 10px;
    font-size: 1rem;
    color: #f4f4f5;
    text-align: center;
}

/* Container das últimas lives */
#vods-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.vod {
    background-color: #292b2f;
    border-radius: 10px;
    overflow: hidden;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.vod iframe {
    width: 100%;
    height: 200px;
    border: none;
}

.vod-title {
    padding: 10px;
    font-size: 1rem;
    color: #f4f4f5;
    text-align: center;
}
/* Estilo para destacar a frase */
.status-highlight {
    background-color: #9146ff; /* Fundo roxo Twitch */
    color: #ffffff; /* Texto branco */
    font-size: 1.5rem;
    font-weight: bold;
    padding: 15px 20px;
    border-radius: 10px;
    text-align: center;
    margin-top: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    animation: bounce 1.5s infinite;
}

/* Seta animada apontando para o botão */
/* Seta SVG personalizada */
.animated-arrow {
    text-align: center;
    margin-top: 10px;
    animation: bounce 1.5s infinite; /* Animação de pulo */
}

.custom-arrow {
    height: 50px;
    width: 50px;
    fill: #9146ff; /* Roxo Twitch */
}

/* Animação de pulo para a seta */
@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(10px);
    }
}

/* Estilo geral para o embed */
.twitch-embed {
    background-color: #9146ff;
    border-radius: 10px;
    padding: 15px;
    margin-top: 20px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.twitch-link {
    text-decoration: none;
    color: black;
    font-weight: bold;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.twitch-link:hover {
    text-decoration: underline;
}

.twitch-logo {
    height: 40px;
    width: auto;
}

/* Esconde o chat, a seta e o embed ao vivo nas abas de Clipes e Lives Recentes */
#clips-section #chat-container,
#clips-section .twitch-embed,
#clips-section .live-light,
#vods-section #chat-container,
#vods-section .twitch-embed,
#vods-section .live-light {
    display: none;
}

/* Mostra os elementos apenas na aba de Status */
#status-section #chat-container,
#status-section .twitch-embed,
#status-section .live-light {
    display: block;
    }
    
.hidden {
    display: none;
}

.counter-animation {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    animation: bounce 2s infinite;
}

