const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Function to clean up temp files
function cleanupTempFiles() {
  fs.readdir(tempDir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(tempDir, file), err => {
        if (err) console.error(`Error deleting file ${file}:`, err);
      });
    }
  });
}

// Clean up temp files on server start
cleanupTempFiles();

// Schedule cleanup every hour
setInterval(cleanupTempFiles, 3600000);

function getStreamUrl(vodUrl) {
  return new Promise((resolve, reject) => {
    const youtubeDl = spawn('youtube-dl', ['-g', '-f', 'best', vodUrl]);
    let streamUrl = '';
    let errorOutput = '';

    youtubeDl.stdout.on('data', (data) => {
      streamUrl += data.toString();
    });

    youtubeDl.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('youtube-dl stderr:', data.toString());
    });

    youtubeDl.on('close', (code) => {
      if (code === 0 && streamUrl) {
        resolve(streamUrl.trim());
      } else {
        reject(new Error(`Failed to get stream URL: ${errorOutput}`));
      }
    });
  });
}

app.post('/api/downloadvod', async (req, res) => {
  const { vodId, vodUrl, start, end } = req.body;

  if (!vodUrl) {
    console.error('URL do VOD não fornecida');
    return res.status(400).json({ error: 'URL do VOD não fornecida' });
  }

  console.log('Recebida solicitação de download:', { vodId, vodUrl, start, end });

  try {
    console.log('Obtendo URL do stream com youtube-dl...');
    const streamUrl = await getStreamUrl(vodUrl);
    console.log('URL do stream obtida:', streamUrl);

    const outputFile = path.join(tempDir, `brkk_vod_${vodId}_${start}_${end}.mp4`);

    const ffmpegCommand = [
      '-ss', start,
      '-i', streamUrl,
      '-to', end,
      '-c', 'copy',
      '-v', 'verbose',
      '-stats',
      '-loglevel', 'debug',
      outputFile
    ];

    console.log('Iniciando download com ffmpeg:', ffmpegCommand.join(' '));

    const ffmpeg = spawn('ffmpeg', ffmpegCommand);

    let errorLogs = '';
    ffmpeg.stderr.on('data', (data) => {
      errorLogs += data.toString();
      console.error('ffmpeg stderr:', data.toString());
    });

    ffmpeg.stdout.on('data', (data) => {
      console.log('ffmpeg stdout:', data.toString());
    });

    ffmpeg.on('close', (code) => {
      console.log('ffmpeg processo fechado com código:', code);
      if (code === 0 && fs.existsSync(outputFile)) {
        console.log('Arquivo criado com sucesso:', outputFile);
        const fileStats = fs.statSync(outputFile);
        console.log('Tamanho do arquivo:', fileStats.size, 'bytes');

        res.download(outputFile, (err) => {
          if (err) {
            console.error('Erro ao enviar o arquivo:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Erro ao baixar o VOD: ' + err.message });
            }
          }
          // Remover o arquivo temporário após o download
          fs.unlink(outputFile, (err) => {
            if (err) console.error('Erro ao remover arquivo temporário:', err);
          });
        });
      } else {
        console.error('Erro ao processar VOD. Código de saída:', code);
        if (!res.headersSent) {
          res.status(500).json({ error: `Erro ao processar VOD: ${errorLogs}` });
        }
      }
    });

    ffmpeg.on('error', (err) => {
      console.error('Erro ao executar ffmpeg:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao executar ffmpeg: ' + err.message });
      }
    });

  } catch (error) {
    console.error('Erro ao processar download:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao processar download: ' + error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

