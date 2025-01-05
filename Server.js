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
        console.error('Falha ao obter URL do stream com youtube-dl. Tentando método alternativo...');
        const curl = spawn('curl', ['-s', vodUrl]);
        let htmlContent = '';

        curl.stdout.on('data', (data) => {
          htmlContent += data.toString();
        });

        curl.on('close', (curlCode) => {
          if (curlCode === 0) {
            const match = htmlContent.match(/https:\/\/[^"]*\.m3u8/);
            if (match) {
              console.log('URL do stream obtida com método alternativo:', match[0]);
              resolve(match[0]);
            } else {
              reject(new Error(`Não foi possível encontrar a URL do stream no HTML`));
            }
          } else {
            reject(new Error(`Falha ao obter conteúdo HTML: ${errorOutput}`));
          }
        });
      }
    });
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/downloadvod', async (req, res) => {
  const { vodId, vodUrl, start, end } = req.body;

  if (!vodUrl) {
    console.error('URL do VOD não fornecida');
    return res.status(400).send('URL do VOD não fornecida');
  }

  console.log('Recebida solicitação de download:', { vodId, vodUrl, start, end });

  try {
    console.log('Obtendo URL do stream com youtube-dl...');
    const streamUrl = await getStreamUrl(vodUrl);
    console.log('URL do stream obtida:', streamUrl);

    const outputFile = path.join(tempDir, `brkk_vod_${vodId}_${start}_${end}.mp4`);

    const ffmpegCommand = [
      '-i', streamUrl,
      '-ss', start,
      '-to', end,
      '-c', 'copy',
      '-v', 'verbose',
      '-stats',
      '-loglevel', 'debug',
      '-f', 'mp4',
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

    // Adicionar um timeout de 5 minutos
    const timeout = setTimeout(() => {
      ffmpeg.kill('SIGTERM');
      console.error('Timeout: O processo ffmpeg foi encerrado após 5 minutos');
      res.status(500).send('Timeout: O processo de download demorou muito tempo');
    }, 5 * 60 * 1000);

    ffmpeg.on('close', (code) => {
      clearTimeout(timeout);
      console.log('ffmpeg processo fechado com código:', code);
      if (code === 0 && fs.existsSync(outputFile)) {
        console.log('Arquivo criado com sucesso:', outputFile);
        const fileStats = fs.statSync(outputFile);
        console.log('Tamanho do arquivo:', fileStats.size, 'bytes');

        if (fileStats.size === 0) {
          console.error('Arquivo criado está vazio');
          res.status(500).send('Erro: O arquivo baixado está vazio');
          return;
        }

        res.download(outputFile, (err) => {
          if (err) {
            console.error('Erro ao enviar o arquivo:', err);
            res.status(500).send('Erro ao baixar o VOD: ' + err.message);
          }
          fs.unlink(outputFile, (err) => {
            if (err) console.error('Erro ao remover arquivo temporário:', err);
          });
        });
      } else {
        console.error('Erro ao processar VOD. Código de saída:', code);
        res.status(500).send(`Erro ao processar VOD: ${errorLogs}`);
      }
    });

    ffmpeg.on('error', (err) => {
      clearTimeout(timeout);
      console.error('Erro ao executar ffmpeg:', err);
      res.status(500).send('Erro ao executar ffmpeg: ' + err.message);
    });

  } catch (error) {
    console.error('Erro ao processar download:', error);
    res.status(500).send('Erro ao processar download: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

