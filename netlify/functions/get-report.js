

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const url = new URL(req.url);
  const filename = url.searchParams.get('file');

  if (!filename) {
    return new Response('Fichier non specifie', { status: 400 });
  }

  const store = getStore('rapports-pispi');
  const fileData = await store.get(filename, { type: 'arrayBuffer' });

  if (!fileData) {
    return new Response('Rapport introuvable ou expire', { status: 404 });
  }

  return new Response(fileData, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`
    }
  });
};