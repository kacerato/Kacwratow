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

// Rota para download de VODs
app.get('/api/downloadvod', async (req, res) => {
  const { vodId, vodUrl, start, end } = req.query;

  if (!vodUrl) {
    return res.status(404).send('URL do VOD não fornecida');
  }

  // Nome do arquivo de saída
  const outputFile = path.join(__dirname, 'temp', `${vodId}_${start}_${end}.mp4`);

  // Comando ffmpeg para baixar e cortar o vídeo
  const ffmpegCommand = [
    '-i', decodeURIComponent(vodUrl),
    '-ss', start,
    '-to', end,
    '-c', 'copy',
    outputFile
  ];

  // Executando ffmpeg
  const ffmpeg = spawn('ffmpeg', ffmpegCommand);

  ffmpeg.on('close', (code) => {
    if (code === 0) {
      res.download(outputFile, (err) => {
        if (err) {
          console.error('Erro ao enviar o arquivo:', err);
          res.status(500).send('Erro ao baixar o VOD');
        }
        // Remover o arquivo temporário após o download
        fs.unlink(outputFile, (err) => {
          if (err) console.error('Erro ao remover arquivo temporário:', err);
        });
      });
    } else {
      res.status(500).send('Erro ao processar VOD');
    }
  });
});


// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

