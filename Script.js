// Configurações da API da Twitch
const clientId = "v2h2uedgpuw2fz35wtn942e9vsf2c9"; // Substitua pela sua Client ID
const accessToken = "st6jpeqk6jidreb6cnlw08zn5fwjbk"; // Substitua pelo seu Access Token
const username = "brkk"; // Nome de usuário do canal do BRKK na Twitch

// URLs da API
const twitchUserApi = `https://api.twitch.tv/helix/users?login=${username}`;
const twitchStreamApi = `https://api.twitch.tv/helix/streams?user_login=${username}`;
let twitchVideosApi;
let twitchClipsApi;

// Função para obter o ID do usuário
async function getUserId() {
    try {
        const response = await fetch(twitchUserApi, {
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
            return data.data[0].id;
        } else {
            console.error("Usuário não encontrado.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar ID do usuário:", error);
        return null;
    }
}

// Função para buscar a última transmissão salva
async function getLastStreamDate(userId) {
    try {
        twitchVideosApi = `https://api.twitch.tv/helix/videos?user_id=${userId}&type=archive`;
        const response = await fetch(twitchVideosApi, {
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
            return new Date(data.data[0].created_at);
        } else {
            console.error("Nenhum vídeo de transmissão encontrado.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar última data de transmissão:", error);
        return null;
    }
}

// Função para calcular a diferença em dias
function calculateDaysDifference(lastStreamDate) {
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastStreamDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Converte para dias
}

// Função para buscar os clipes recentes
async function getClips(userId) {
    try {
        const now = new Date();
        const lastWeek = new Date(now.setDate(now.getDate() - 7)).toISOString(); // Últimos 7 dias
        twitchClipsApi = `https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=10&started_at=${lastWeek}`;

        const response = await fetch(twitchClipsApi, {
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Erro ao buscar clipes:", error);
        return [];
    }
}

// Função para renderizar os clipes no DOM
async function renderClips() {
    const userId = await getUserId();
    if (!userId) return;

    const clips = await getClips(userId);
    

    const clipsContainer = document.getElementById("clips-container");
    clipsContainer.innerHTML = ""; // Limpa o conteúdo anterior

    if (clips.length === 0) {
        clipsContainer.textContent = "Nenhum clipe encontrado.";
        return;
    }

    clips.forEach((clip) => {
        const clipElement = document.createElement("div");
        clipElement.classList.add("clip");

        clipElement.innerHTML = `
            <iframe 
                src="${clip.embed_url}&parent=localhost&parent=brkk.netlify.app" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
            <div class="clip-title">${clip.title}</div>
        `;

        clipsContainer.appendChild(clipElement);
    });
}

// Função para buscar os últimos VODs
async function getVods(userId) {
    try {
        const vodsApi = `https://api.twitch.tv/helix/videos?user_id=${userId}&type=archive&first=3`;
        const response = await fetch(vodsApi, {
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Erro ao buscar VODs:", error);
        return [];
    }
}

// Função para renderizar os VODs no DOM
// Função para renderizar os VODs no DOM
// Função para renderizar os VODs no DOM
async function renderVods() {
    const userId = await getUserId();
    if (!userId) return;

    const vods = await getVods(userId);

    const vodsContainer = document.getElementById("vods-container");
    const mainPlayer = document.getElementById("main-player");
    vodsContainer.innerHTML = ""; // Limpa o conteúdo anterior

    if (vods.length === 0) {
        vodsContainer.textContent = "Nenhuma live encontrada.";
        return;
    }

    // Define o primeiro VOD como o player principal
    mainPlayer.src = `https://player.twitch.tv/?video=${vods[0].id}&parent=localhost&parent=brkk.netlify.app`;

    vods.forEach((vod) => {
        const vodElement = document.createElement("div");
        vodElement.classList.add("vod");

        vodElement.innerHTML = `
            <div class="vod-preview">
                <iframe 
                    src="https://player.twitch.tv/?video=${vod.id}&parent=localhost&parent=brkk.netlify.app&autoplay=false" 
                    frameborder="0" 
                    allow="autoplay; fullscreen">
                </iframe>
                <div class="vod-title">${vod.title}</div>
                <button class="select-vod-btn">Assistir</button>
            </div>
        `;

        // Adiciona evento de clique para trocar o player principal
        const selectButton = vodElement.querySelector(".select-vod-btn");
        selectButton.addEventListener("click", () => {
            mainPlayer.src = `https://player.twitch.tv/?video=${vod.id}&parent=localhost&parent=brkk.netlify.app`;
        });

        vodsContainer.appendChild(vodElement);
    });
}



// Função para atualizar o status
// Atualiza o status ao vivo
async function updateStatus() {
    try {
        const userId = await getUserId();

        if (userId) {
            const streamResponse = await fetch(twitchStreamApi, {
                headers: {
                    "Client-ID": clientId,
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const streamData = await streamResponse.json();
            const liveStatus = document.getElementById("live-status");
            const statusMessage = document.getElementById("status-message");
            const twitchEmbed = document.querySelector(".twitch-embed");
            
            const animatedArrow = document.querySelector(".animated-arrow");
            const daysCounter = document.querySelector(".days-counter");

            const chatContainer = document.getElementById("chat-container"); // Seleciona o contêiner do chat

// Dentro de updateStatus():
if (streamData && streamData.data && streamData.data.length > 0) {
  // Canal está ao vivo
  liveStatus.classList.remove("hidden");
  statusMessage.textContent = "BRKK perdeu todo o dinheiro no urubu do Pix e resolveu abrir live!";
  statusMessage.classList.add("status-highlight");
  daysCounter.style.display = "none"; // Esconde o contador de dias
  twitchEmbed.classList.remove("hidden"); // Mostra o embed Twitch
  animatedArrow.classList.remove("hidden"); // Mostra a seta animada
  chatContainer.classList.remove("hidden"); // Mostra o chat
} else {
  // Canal está offline
  liveStatus.classList.add("hidden");
  twitchEmbed.classList.add("hidden"); // Esconde o embed Twitch
  animatedArrow.classList.add("hidden"); // Esconde a seta
  chatContainer.classList.add("hidden"); // Esconde o chat
  const lastStreamDate = await getLastStreamDate(userId);
  if (lastStreamDate) {
    const daysOffline = calculateDaysDifference(lastStreamDate);
    statusMessage.textContent = "O tucano está folgando com dinheiro do seu sub a exatos:";
    daysCounter.style.display = "flex";
    document.getElementById("days-offline").textContent = daysOffline;
  }
  statusMessage.classList.remove("status-highlight");
}
        }
    } catch (error) {
        console.error("Erro ao atualizar o status:", error);
    }
}



// Alternância entre abas
function setupTabs() {
    const statusTab = document.getElementById("status-tab");
    const clipsTab = document.getElementById("clips-tab");
    const vodsTab = document.getElementById("vods-tab"); // Nova aba
    const statusSection = document.getElementById("status-section");
    const clipsSection = document.getElementById("clips-section");
    const vodsSection = document.getElementById("vods-section"); // Nova seção

    statusTab.addEventListener("click", () => {
        statusTab.classList.add("active");
        clipsTab.classList.remove("active");
        vodsTab.classList.remove("active"); // Remove ativo da nova aba
        statusSection.classList.remove("hidden");
        clipsSection.classList.add("hidden");
        vodsSection.classList.add("hidden"); // Esconde a nova seção
    });

    clipsTab.addEventListener("click", () => {
        clipsTab.classList.add("active");
        statusTab.classList.remove("active");
        vodsTab.classList.remove("active"); // Remove ativo da nova aba
        clipsSection.classList.remove("hidden");
        statusSection.classList.add("hidden");
        vodsSection.classList.add("hidden"); // Esconde a nova seção

        // Carrega os clipes ao clicar na aba
        renderClips();
    });

    vodsTab.addEventListener("click", () => {
        vodsTab.classList.add("active");
        statusTab.classList.remove("active");
        clipsTab.classList.remove("active");
        vodsSection.classList.remove("hidden");
        statusSection.classList.add("hidden");
        clipsSection.classList.add("hidden");

        // Carrega as lives ao clicar na aba
        renderVods();
    });
}


// Inicializa as abas e o status
setupTabs();
updateStatus();
    