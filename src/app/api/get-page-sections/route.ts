
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/home-page-db.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sections = JSON.parse(fileContent);
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('API Error: Failed to read page sections:', error);
    return NextResponse.json(
      { message: 'Error reading page sections' },
      { status: 500 }
    );
  }
}
