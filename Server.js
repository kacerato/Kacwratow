const express = require('express');
const app = express();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Middleware para lidar com solicitações JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Função para obter o m3u8 do VOD
function getVodM3U8(vodUrl) {
  return new Promise((resolve, reject) => {
    https.get(vodUrl, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const m3u8Url = data.match(/https:\/\/.*\.m3u8/);
        if (m3u8Url) {
          resolve(m3u8Url[0]);
        } else {
          reject(new Error('Não foi possível encontrar a URL do m3u8'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Rota para download de VODs
app.get('/api/downloadvod', async (req, res) => {
  const { vodId, vodUrl, start, end } = req.query;

  if (!vodUrl) {
    console.error('URL do VOD não fornecida');
    return res.status(400).send('URL do VOD não fornecida');
  }

  console.log('Recebida solicitação de download:', { vodId, vodUrl, start, end });

  try {
    const m3u8Url = await getVodM3U8(vodUrl);
    console.log('URL do m3u8 obtida:', m3u8Url);

    // Nome do arquivo de saída
    const outputFile = path.join(__dirname, 'temp', `${vodId}_${start}_${end}.mp4`);

    // Comando ffmpeg para baixar e cortar o vídeo
    const ffmpegCommand = [
      '-i', m3u8Url,
      '-ss', start,
      '-to', end,
      '-c', 'copy',
      outputFile
    ];

    console.log('Comando ffmpeg:', ffmpegCommand.join(' '));

    // Executando ffmpeg
    const ffmpeg = spawn('ffmpeg', ffmpegCommand);

    ffmpeg.stderr.on('data', (data) => {
      console.error('ffmpeg stderr:', data.toString());
    });

    ffmpeg.on('close', (code) => {
      console.log('ffmpeg processo fechado com código:', code);
      if (code === 0) {
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
        res.status(500).send('Erro ao processar VOD: ffmpeg retornou código ' + code);
      }
    });
  } catch (error) {
    console.error('Erro ao obter URL do m3u8:', error);
    res.status(500).send('Erro ao obter URL do m3u8: ' + error.message);
  }
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

