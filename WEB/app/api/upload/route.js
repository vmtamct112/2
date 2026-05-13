import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { fileName, fileType, imageBase64 } = await req.json();

    if (!fileName || !imageBase64) {
      return new Response(JSON.stringify({ error: 'Thiếu file hoặc dữ liệu ảnh.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const safeName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();

    const ext = fileType?.split('/')[1] || 'png';
    const fileBaseName = `${Date.now()}-${safeName}`;
    const fileNameWithExt = `${fileBaseName}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const uploadPath = path.join(uploadDir, fileNameWithExt);

    await fs.mkdir(uploadDir, { recursive: true });
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');
    await fs.writeFile(uploadPath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `/uploads/${fileNameWithExt}`;
    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
