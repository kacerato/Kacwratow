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
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
}

.status-container {
    background-color: #292b2f;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.status-container p {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

.days-counter {
    font-size: 2.5rem;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
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
/* Animação de pulsação */
@keyframes pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 10px rgba(145, 70, 255, 0.9);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(145, 70, 255, 1);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 10px rgba(145, 70, 255, 0.9);
    }
}

/* Estilo para o status ao vivo */
.live-status {
    background-color: #ff0000;
    color: #fff;
    padding: 20px;
    border-radius: 10px;
    animation: pulse 1s infinite;
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.9);
    transition: all 0.3s ease-in-out;
}
    
