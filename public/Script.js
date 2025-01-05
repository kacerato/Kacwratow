const clientId = "v2h2uedgpuw2fz35wtn942e9vsf2c9";
const accessToken = "st6jpeqk6jidreb6cnlw08zn5fwjbk";
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

async function getClips(userId) {
  try {
    const now = new Date();
    const last24Hours = new Date(now.setHours(now.getHours() - 24)).toISOString(); // Últimas 24 horas
    twitchClipsApi = `https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=10&started_at=${last24Hours}`;

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

  const mainPlayer = document.getElementById("main-playerclips");
  mainPlayer.innerHTML = ""; // Limpa o conteúdo anterior do player principal
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

  clips.forEach((clip, index) => {
    const clipElement = document.createElement("div");
    clipElement.classList.add("clip");

    // Exibe a thumbnail, título e botão de assistir
    clipElement.innerHTML = `
            <div class="clip-preview">
                <img src="${clip.thumbnail_url}" alt="${clip.title}" class="clip-thumbnail" />
                <div class="clip-title">${clip.title}</div>
                <button class="select-clip-btn" data-clip-url="${clip.embed_url}">Assistir</button>
            </div>
        `;

    // Adiciona evento de clique para trocar o player principal
    const selectButton = clipElement.querySelector(".select-clip-btn");
    selectButton.addEventListener("click", () => {
      mainPlayerIframe.src = `${selectButton.dataset.clipUrl}&parent=localhost&parent=brkk.netlify.app`;
    });

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
    return data.data.map(vod => ({
      ...vod,
      download_url: `https://api.twitch.tv/helix/videos?id=${vod.id}`
    })) || [];
  } catch (error) {
    console.error("Erro ao buscar VODs:", error);
    return [];
  }
}

// Função para renderizar os VODs no DOM
async function renderVods() {
  const userId = await getUserId();
  if (!userId) return;

  const vods = await getVods(userId);
  const vodsContainer = document.getElementById("vods-container");
  vodsContainer.innerHTML = ""; // Limpa o conteúdo anterior

  const mainPlayer = document.getElementById("main-player");
  mainPlayer.innerHTML = ""; // Limpa o conteúdo anterior do player principal
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
        <button class="select-vod-download-btn" data-vod-id="${vod.id}" data-vod-url="${vod.url}">Selecionar para Download</button>
      </div>
    `;

    const selectButton = vodElement.querySelector(".select-vod-btn");
    selectButton.addEventListener("click", () => {
      mainPlayerIframe.src = `https://player.twitch.tv/?video=${selectButton.dataset.vodId}&parent=localhost&parent=brkk.netlify.app`;
      document.querySelectorAll('.vod').forEach(v => v.classList.remove('active'));
      vodElement.classList.add('active');
    });

    const selectDownloadButton = vodElement.querySelector(".select-vod-download-btn");
selectDownloadButton.addEventListener("click", () => {
  document.querySelectorAll('.vod').forEach(v => v.classList.remove('active'));
  vodElement.classList.add('active');
  document.getElementById('selected-vod-id').value = vod.id;
  document.getElementById('selected-vod-url').value = vod.url;
});

vodsContainer.appendChild(vodElement);
});
}

// Função para iniciar o download do VOD
async function downloadVod(vodId, start, end) {
  try {
    console.log('Iniciando download do VOD:', vodId, 'de', start, 'a', end);
    const vodUrl = `https://www.twitch.tv/videos/${vodId}`;
    
    const statusElement = document.createElement('div');
    statusElement.id = 'download-status';
    statusElement.textContent = 'Iniciando download...';
    document.body.appendChild(statusElement);

    console.log('Enviando solicitação para o servidor...');
    const response = await fetch('/api/downloadvod', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vodId,
        vodUrl,
        start,
        end
      })
    });

    console.log('Resposta recebida do servidor. Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro recebido do servidor:', errorText);
      throw new Error(`Falha ao baixar o VOD: ${errorText}`);
    }

    statusElement.textContent = 'Download iniciado. Verifique a barra de downloads do seu navegador.';

    // Criar um link temporário para iniciar o download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `brkk_vod_${vodId}_${start}_${end}.mp4`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('Download iniciado no navegador');
    setTimeout(() => statusElement.remove(), 5000);

  } catch (error) {
    console.error('Erro detalhado ao baixar VOD:', error);
    alert(`Erro ao baixar VOD: ${error.message}`);
    const statusElement = document.getElementById('download-status');
    if (statusElement) {
      statusElement.textContent = `Erro: ${error.message}`;
      statusElement.style.color = 'red';
    }
  }
}


// Função para exibir o Achievement
function showAchievement(days, message, starClass) {
  const achievementsContainer = document.getElementById('achievements-container');
  const achievementText = achievementsContainer.querySelector('.achievement-text');
  const achievementIcon = achievementsContainer.querySelector('.achievement-icon');
  const brkkHead = achievementsContainer.querySelector('.brkk-head');

  achievementText.textContent = `${days}  ${message}`;
  achievementIcon.classList.remove('star-3-days', 'star-5-days', 'star-10-days', 'star-15-days');
  achievementIcon.classList.add(starClass);

  if (days === 3) {
    brkkHead.classList.remove('hidden');
  } else {
    brkkHead.classList.add('hidden');
  }

  achievementsContainer.classList.remove('hidden');
}

// Função para verificar e exibir Achievements
function checkAchievements(daysOffline) {
  let achievementMessage = "";
  let achievementDays = 0;
  let starClass = "";

  if (daysOffline >= 15) {
    achievementMessage = "dias sem live, é oficial tucano foi encontrado sem vida após um jogo do Vasco";
    achievementDays = 15;
    starClass = "star-15-days";
  } else if (daysOffline >= 10) {
    achievementMessage = "dias sem live, pensando em tirar meu sub dessa live de merda";
    achievementDays = 10;
    starClass = "star-10-days";
  } else if (daysOffline >= 5) {
    achievementMessage = "dias sem live, qual será a desculpa de hoje?";
    achievementDays = 5;
    starClass = "star-5-days";
  } else if (daysOffline >= 3) {
    achievementMessage = "Dias sem live, pelo visto comeram a fibra óptica de Sorocaba";
    achievementDays = 3;
    starClass = "star-3-days";
  }

  const achievementsContainer = document.getElementById('achievements-container');

  if (achievementMessage && daysOffline === achievementDays) {
    showAchievement(achievementDays, achievementMessage, starClass);
    achievementsContainer.classList.remove('hidden');
  } else {
    achievementsContainer.classList.add('hidden');
  }
}

// Função para atualizar o status
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

      const chatContainer = document.getElementById("chat-container");
      const viewersCounter = document.querySelector("#viewers-counter");
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
        document.getElementById('achievements-container').classList.add('hidden');
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

          // Verifica e exibe Achievements
          checkAchievements(daysOffline);
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

  let clipsLoaded = false;
  let vodsLoaded = false;

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

    if (!clipsLoaded) {
      renderClips();
      clipsLoaded = true;
    }
  });

  vodsTab.addEventListener("click", () => {
    vodsTab.classList.add("active");
    statusTab.classList.remove("active");
    clipsTab.classList.remove("active");
    vodsSection.classList.remove("hidden");
    statusSection.classList.add("hidden");
    clipsSection.classList.add("hidden");

    if (!vodsLoaded) {
      renderVods();
      vodsLoaded = true;
    }
  });
}

// Inicialização
setupTabs();
updateStatus();

// Evento de download VOD
document.getElementById('download-vod').addEventListener('click', () => {
  const vodId = document.getElementById('selected-vod-id').value;

  if (!vodId) {
    alert('Por favor, selecione um VOD para baixar.');
    return;
  }

  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;

  if (!startTime || !endTime || startTime >= endTime) {
    alert('Por favor, selecione um intervalo de tempo válido.');
    return;
  }

  console.log('Iniciando processo de download para VOD:', vodId);
  downloadVod(vodId, startTime, endTime);
});

// Adicionar esta função para marcar um VOD como ativo ao clicar no botão de seleção
document.querySelectorAll('.select-vod-btn').forEach(button => {
  button.addEventListener('click', function() {
    document.querySelectorAll('.vod').forEach(vod => vod.classList.remove('active'));
    this.closest('.vod').classList.add('active');
  });
});

