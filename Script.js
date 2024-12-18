// Função para fazer requisições à API da Twitch
async function fetchTwitchData(endpoint) {
  const response = await fetch('/.netlify/functions/twitch-api', {
    method: 'POST',
    body: JSON.stringify({ endpoint })
  });
  return response.json();
}

// Função para obter o ID do usuário
async function getUserId() {
  const data = await fetchTwitchData('users?login=brkk');
  if (data && data.data && data.data.length > 0) {
    return data.data[0].id;
  }
  console.error("Usuário não encontrado.");
  return null;
}

// Função para buscar a última transmissão salva
async function getLastStreamDate(userId) {
  const data = await fetchTwitchData(`videos?user_id=${userId}&type=archive`);
  if (data && data.data && data.data.length > 0) {
    return new Date(data.data[0].created_at);
  }
  console.error("Nenhum vídeo de transmissão encontrado.");
  return null;
}

// Função para calcular a diferença em dias
function calculateDaysDifference(lastStreamDate) {
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - lastStreamDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Converte para dias
}

// Função para buscar os clipes recentes
async function getClips(userId) {
  const now = new Date();
  const last24Hours = new Date(now.setHours(now.getHours() - 24)).toISOString();
  const data = await fetchTwitchData(`clips?broadcaster_id=${userId}&first=10&started_at=${last24Hours}`);
  return data.data || [];
}

// Função para renderizar os clipes no DOM
async function renderClips() {
  const userId = await getUserId();
  if (!userId) return;

  const clips = await getClips(userId);
  const clipsContainer = document.getElementById("clips-container");
  clipsContainer.innerHTML = ""; // Limpa o conteúdo anterior

  const mainPlayer = document.getElementById("main-playerclips");
  const mainPlayerIframe = document.createElement("iframe");
  mainPlayerIframe.setAttribute("frameborder", "0");
  mainPlayerIframe.setAttribute("allowfullscreen", "");
  mainPlayerIframe.setAttribute("width", "100%");
  mainPlayerIframe.setAttribute("height", "300px");

  if (clips.length === 0) {
    clipsContainer.textContent = "Nenhum clipe encontrado.";
    return;
  }

  // Define o primeiro clipe como o player principal
  mainPlayerIframe.src = `${clips[0].embed_url}&parent=localhost&parent=brkk.netlify.app`;
  mainPlayer.appendChild(mainPlayerIframe);

  clips.forEach((clip) => {
    const clipElement = document.createElement("div");
    clipElement.classList.add("clip");

    clipElement.innerHTML = `
      <div class="clip-preview">
        <img src="${clip.thumbnail_url}" alt="${clip.title}" class="clip-thumbnail" />
        <div class="clip-title">${clip.title}</div>
        <button class="select-clip-btn" data-clip-url="${clip.embed_url}">Assistir</button>
      </div>
    `;

    const selectButton = clipElement.querySelector(".select-clip-btn");
    selectButton.addEventListener("click", () => {
      mainPlayerIframe.src = `${selectButton.dataset.clipUrl}&parent=localhost&parent=brkk.netlify.app`;
    });

    clipsContainer.appendChild(clipElement);
  });
}

// Função para buscar os últimos VODs
async function getVods(userId) {
  const data = await fetchTwitchData(`videos?user_id=${userId}&type=archive&first=3`);
  return data.data || [];
}

// Função para renderizar os VODs no DOM
async function renderVods() {
  const userId = await getUserId();
  if (!userId) return;

  const vods = await getVods(userId);
  const vodsContainer = document.getElementById("vods-container");
  vodsContainer.innerHTML = ""; // Limpa o conteúdo anterior

  const mainPlayer = document.getElementById("main-player");
  const mainPlayerIframe = document.createElement("iframe");
  mainPlayerIframe.setAttribute("frameborder", "0");
  mainPlayerIframe.setAttribute("allowfullscreen", "");
  mainPlayerIframe.setAttribute("width", "100%");
  mainPlayerIframe.setAttribute("height", "300px");

  if (vods.length === 0) {
    vodsContainer.textContent = "Nenhuma live encontrada.";
    return;
  }

  // Define o primeiro VOD como o player principal
  mainPlayerIframe.src = `https://player.twitch.tv/?video=${vods[0].id}&parent=localhost&parent=brkk.netlify.app`;
  mainPlayer.appendChild(mainPlayerIframe);

  vods.forEach((vod) => {
    const vodElement = document.createElement("div");
    vodElement.classList.add("vod");

    vodElement.innerHTML = `
      <div class="vod-preview">
        <img src="${vod.thumbnail_url.replace('%{width}', '320').replace('%{height}', '180')}" alt="${vod.title}" class="vod-thumbnail" />
        <div class="vod-title">${vod.title}</div>
        <button class="select-vod-btn" data-vod-id="${vod.id}">Assistir</button>
      </div>
    `;

    const selectButton = vodElement.querySelector(".select-vod-btn");
    selectButton.addEventListener("click", () => {
      mainPlayerIframe.src = `https://player.twitch.tv/?video=${selectButton.dataset.vodId}&parent=localhost&parent=brkk.netlify.app`;
    });

    vodsContainer.appendChild(vodElement);
  });
}

// Função para atualizar o status
async function updateStatus() {
  try {
    const userId = await getUserId();

    if (userId) {
      const streamData = await fetchTwitchData(`streams?user_login=brkk`);
      const liveStatus = document.getElementById("live-status");
      const statusMessage = document.getElementById("status-message");
      const twitchEmbed = document.querySelector(".twitch-embed");
      const animatedArrow = document.querySelector(".animated-arrow");
      const daysCounter = document.querySelector(".days-counter");
      const chatContainer = document.getElementById("chat-container");
      const viewersCounter = document.querySelector(".viewers-counter");
      const viewersCount = document.getElementById("viewers-count");

      if (streamData && streamData.data && streamData.data.length > 0) {
        // Canal está ao vivo
        liveStatus.classList.remove("hidden");
        statusMessage.textContent = "BRKK perdeu todo o dinheiro no urubu do Pix e resolveu abrir live!";
        statusMessage.classList.add("status-highlight");
        daysCounter.style.display = "none";
        twitchEmbed.classList.remove("hidden");
        animatedArrow.classList.remove("hidden");
        chatContainer.classList.remove("hidden");
        
        const viewers = streamData.data[0].viewer_count;
        viewersCount.textContent = viewers;
        viewersCounter.classList.remove("hidden");
      } else {
        // Canal está offline
        liveStatus.classList.add("hidden");
        twitchEmbed.classList.add("hidden");
        animatedArrow.classList.add("hidden");
        chatContainer.classList.add("hidden");
        const lastStreamDate = await getLastStreamDate(userId);
        if (lastStreamDate) {
          const daysOffline = calculateDaysDifference(lastStreamDate);
          statusMessage.textContent = "O tucano está folgando com dinheiro do seu sub a exatos:";
          daysCounter.style.display = "flex";
          document.getElementById("days-offline").textContent = daysOffline;
          viewersCounter.classList.add("hidden");
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
  const vodsTab = document.getElementById("vods-tab");
  const statusSection = document.getElementById("status-section");
  const clipsSection = document.getElementById("clips-section");
  const vodsSection = document.getElementById("vods-section");

  statusTab.addEventListener("click", () => {
    statusTab.classList.add("active");
    clipsTab.classList.remove("active");
    vodsTab.classList.remove("active");
    statusSection.classList.remove("hidden");
    clipsSection.classList.add("hidden");
    vodsSection.classList.add("hidden");
  });

  clipsTab.addEventListener("click", () => {
    clipsTab.classList.add("active");
    statusTab.classList.remove("active");
    vodsTab.classList.remove("active");
    clipsSection.classList.remove("hidden");
    statusSection.classList.add("hidden");
    vodsSection.classList.add("hidden");
    renderClips();
  });

  vodsTab.addEventListener("click", () => {
    vodsTab.classList.add("active");
    statusTab.classList.remove("active");
    clipsTab.classList.remove("active");
    vodsSection.classList.remove("hidden");
    statusSection.classList.add("hidden");
    clipsSection.classList.add("hidden");
    renderVods();
  });
}

// Inicializa as abas e o status
setupTabs();
updateStatus();

