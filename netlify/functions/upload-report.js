
import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { filename, base64Pdf } = await req.json();

    if (!filename || !base64Pdf) {
      return new Response(JSON.stringify({ error: 'filename et base64Pdf requis' }), { status: 400 });
    }

    const store = getStore('rapports-pispi');


    const binaryData = Buffer.from(base64Pdf, 'base64');

    await store.set(filename, binaryData, {
      metadata: { contentType: 'application/pdf' }
    });


    const publicUrl = `${new URL(req.url).origin}/.netlify/functions/get-report?file=${encodeURIComponent(filename)}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};