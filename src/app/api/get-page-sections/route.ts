
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { initialHomePageSections } from '@/lib/page-data';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/home-page-db.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sections = JSON.parse(fileContent);
    return NextResponse.json(sections); // Return the array directly
  } catch (error) {
    // If the file doesn't exist or there's an error, return the initial data
    console.warn('API Warning: Could not read home-page-db.json, serving initial data. Error:', error);
    return NextResponse.json(initialHomePageSections); // Return the array directly
  }
}
