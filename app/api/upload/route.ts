import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Increase the body size limit for file uploads
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    // Read the request body as an ArrayBuffer first for reliability
    const buffer = await request.arrayBuffer();
    
    if (!buffer || buffer.byteLength === 0) {
      return NextResponse.json({ error: 'No file data received' }, { status: 400 });
    }

    const blob = await put(filename, Buffer.from(buffer), {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Error uploading to blob:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Error uploading file' },
      { status: 500 }
    );
  }
}
