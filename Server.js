const express = require('express');
const app = express();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Middleware para lidar com solicitações JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Criar diretório temp se não existir
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Função para obter URL do stream usando streamlink
function getStreamUrl(vodUrl) {
  return new Promise((resolve, reject) => {
    const streamlink = spawn('streamlink', ['--stream-url', vodUrl, 'best']);
    let streamUrl = '';
    let errorOutput = '';

    streamlink.stdout.on('data', (data) => {
      streamUrl += data.toString();
    });

    streamlink.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('streamlink stderr:', data.toString());
    });

    streamlink.on('close', (code) => {
      if (code === 0 && streamUrl) {
        resolve(streamUrl.trim());
      } else {
        reject(new Error(`Falha ao obter URL do stream: ${errorOutput}`));
      }
    });
  });
}

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para download de VODs
app.post('/api/downloadvod', async (req, res) => {
  const { vodId, vodUrl, start, end, title } = req.body;

  if (!vodUrl) {
    return res.status(400).send('URL do VOD não fornecida');
  }

  console.log('Recebida solicitação de download:', { vodId, vodUrl, start, end, title });

  try {
    // Obter URL do stream
    const streamUrl = await getStreamUrl(vodUrl);
    console.log('URL do stream obtida:', streamUrl);

    // Nome do arquivo de saída
    const sanitizedTitle = (title || vodId).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const outputFile = path.join(tempDir, `${sanitizedTitle}_${start}_${end}.mp4`);

    // Comando ffmpeg para baixar e cortar o vídeo
    const ffmpegCommand = [
      '-i', streamUrl,
      '-ss', start,
      '-to', end,
      '-c', 'copy',
      outputFile
    ];

    console.log('Iniciando download com ffmpeg');

    const ffmpeg = spawn('ffmpeg', ffmpegCommand);

    let errorLogs = '';
    ffmpeg.stderr.on('data', (data) => {
      errorLogs += data.toString();
      console.error('ffmpeg stderr:', data.toString());
    });

    ffmpeg.on('close', (code) => {
      console.log('ffmpeg processo fechado com código:', code);
      if (code === 0 && fs.existsSync(outputFile)) {
        res.download(outputFile, (err) => {
          if (err) {
            console.error('Erro ao enviar o arquivo:', err);
            res.status(500).send('Erro ao baixar o VOD: ' + err.message);
          }
          // Remover o arquivo temporário após o download
          fs.unlink(outputFile, (err) => {
            if (err) console.error('Erro ao remover arquivo temporário:', err);
          });
        });
      } else {
        res.status(500).send(`Erro ao processar VOD: ${errorLogs}`);
      }
    });

    ffmpeg.on('error', (err) => {
      console.error('Erro ao executar ffmpeg:', err);
      res.status(500).send('Erro ao executar ffmpeg: ' + err.message);
    });

  } catch (error) {
    console.error('Erro ao processar download:', error);
    res.status(500).send('Erro ao processar download: ' + error.message);
  }
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

