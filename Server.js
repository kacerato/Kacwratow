const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require('cors');
const Queue = require('bull');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Configuração da fila de processamento
const videoQueue = new Queue('video processing', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

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

cleanupTempFiles();
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

let downloadProgress = {};

app.get('/api/downloadprogress/:vodId', (req, res) => {
  const vodId = req.params.vodId;
  res.json({ progress: downloadProgress[vodId] || 0 });
});

function parseTime(time) {
  if (typeof time === 'number') {
    return time;
  }
  if (typeof time === 'string') {
    if (time.includes(':')) {
      const parts = time.split(':').map(Number);
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    } else {
      return parseInt(time, 10);
    }
  }
  console.error('Formato de tempo inválido:', time);
  return 0;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

app.post('/api/editvod', async (req, res) => {
  const { vodId, vodUrl, start, end, cameraArea, gameArea } = req.body;

  if (!vodUrl) {
    console.error('URL do VOD não fornecida');
    return res.status(400).json({ error: 'URL do VOD não fornecida' });
  }

  console.log('Recebida solicitação de edição:', { vodId, vodUrl, start, end, cameraArea, gameArea });

  try {
    const jobId = `job_${Date.now()}`;
    await videoQueue.add(jobId, { vodId, vodUrl, start, end, cameraArea, gameArea });
    res.json({ jobId, message: 'Edição de vídeo iniciada. Você receberá notificações sobre o progresso.' });
  } catch (error) {
    console.error('Erro ao adicionar trabalho à fila:', error);
    res.status(500).json({ error: 'Erro ao iniciar a edição de vídeo' });
  }
});

videoQueue.process(async (job) => {
  const { vodId, vodUrl, start, end, cameraArea, gameArea } = job.data;

  try {
    console.log('Obtendo URL do stream com youtube-dl...');
    const streamUrl = await getStreamUrl(vodUrl);
    console.log('URL do stream obtida:', streamUrl);

    const startSeconds = parseTime(start);
    const endSeconds = parseTime(end);
    const duration = endSeconds - startSeconds;

    if (duration <= 0) {
      throw new Error('Duração inválida. O tempo de fim deve ser maior que o tempo de início.');
    }

    const outputFile = path.join(tempDir, `edited_vod_${vodId}_${formatTime(startSeconds)}_${formatTime(endSeconds)}.mp4`);

    let ffmpegCommand = [
      '-ss', formatTime(startSeconds),
      '-i', streamUrl,
      '-t', formatTime(duration),
      '-filter_complex'
    ];

    let filterComplex = '';
    if (cameraArea && gameArea) {
      filterComplex += `[0:v]crop=${cameraArea.width}:${cameraArea.height}:${cameraArea.x}:${cameraArea.y}[camera];`;
      filterComplex += `[0:v]crop=${gameArea.width}:${gameArea.height}:${gameArea.x}:${gameArea.y}[game];`;
      filterComplex += `[camera]scale=540:480[camera_scaled];[game]scale=540:480[game_scaled];`;
      filterComplex += `[camera_scaled][game_scaled]vstack,format=yuv420p[v]`;
      
      ffmpegCommand.push(filterComplex);
      ffmpegCommand.push('-map', '[v]', '-map', '0:a');
    } else {
      ffmpegCommand.push('-c', 'copy');
    }

    ffmpegCommand.push(
      '-avoid_negative_ts', 'make_zero',
      '-y',
      outputFile
    );

    console.log('Iniciando processamento com ffmpeg:', ffmpegCommand.join(' '));

    const ffmpeg = spawn('ffmpeg', ffmpegCommand);

    let errorLogs = '';
    ffmpeg.stderr.on('data', (data) => {
      errorLogs += data.toString();
      console.error('ffmpeg stderr:', data.toString());

      const output = data.toString();
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})\.\d{2}/);

      if (timeMatch) {
        const [, hours, minutes, seconds] = timeMatch;
        const currentTime = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
        const progress = Math.min((currentTime / duration) * 100, 100);
        io.emit('progressUpdate', { jobId: job.id, progress });
      }
    });

    await new Promise((resolve, reject) => {
      ffmpeg.on('close', (code) => {
        console.log('ffmpeg processo fechado com código:', code);
        if (code === 0 && fs.existsSync(outputFile)) {
          console.log('Arquivo criado com sucesso:', outputFile);
          resolve(outputFile);
        } else {
          console.error('Erro ao processar VOD. Código de saída:', code);
          reject(new Error(`Erro ao processar VOD: ${errorLogs}`));
        }
      });

      ffmpeg.on('error', (err) => {
        console.error('Erro ao executar ffmpeg:', err);
        reject(err);
      });
    });

    return { outputFile };
  } catch (error) {
    console.error('Erro ao processar edição:', error);
    throw error;
  }
});

videoQueue.on('completed', (job, result) => {
  io.emit('jobCompleted', { jobId: job.id, outputFile: result.outputFile });
});

videoQueue.on('failed', (job, error) => {
  io.emit('jobFailed', { jobId: job.id, error: error.message });
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(tempDir, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Erro ao enviar o arquivo:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erro ao baixar o arquivo' });
        }
      }
      fs.unlink(filePath, (err) => {
        if (err) console.error('Erro ao remover arquivo temporário:', err);
      });
    });
  } else {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});