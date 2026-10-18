export default async function handler(req, res) {
  const upstream = await fetch(
    'https://c7hipfl2c2mbmvth.public.blob.vercel-storage.com/docis_mavalerio.pdf'
  );
  const buffer = await upstream.arrayBuffer();
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="docis_mavalerio.pdf"');
  res.send(Buffer.from(buffer));
}
