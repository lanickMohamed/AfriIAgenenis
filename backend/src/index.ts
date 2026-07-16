import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { config } from './config';
import { initializeDatabase, closeDatabase } from './db';
import { routes } from './routes';

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.FRONTEND_ORIGIN.split(',').map((value: string) => value.trim()), credentials: false }));
app.use(pinoHttp());
app.use(express.json({
  limit: '2mb',
  verify: (req, _res, buffer) => { (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); }
}));
app.use('/api', routes);
app.use(routes);

app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  const message = config.NODE_ENV === 'production' ? 'Erreur interne' : error instanceof Error ? error.message : 'Erreur interne';
  res.status(500).json({ error: message });
});

async function start() {
  await initializeDatabase();
  const server = app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`✅ Backend afrIAgenesis® actif sur le port ${config.PORT}`);
  });

  async function shutdown() {
    server.close(async () => { await closeDatabase(); process.exit(0); });
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

void start();