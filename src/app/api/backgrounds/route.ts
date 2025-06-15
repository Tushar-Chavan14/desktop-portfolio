import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const backgroundsDir = path.join(process.cwd(), 'public', 'assets', 'bgs');
    
    if (!fs.existsSync(backgroundsDir)) {
      fs.mkdirSync(backgroundsDir, { recursive: true });
      return NextResponse.json({ backgrounds: [] });
    }

    const files = fs.readdirSync(backgroundsDir);
    
    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png',];
    const backgroundImages = files
      .filter(file => 
        imageExtensions.some(ext => 
          file.toLowerCase().endsWith(ext)
        )
      )
      .map(file => `/assets/bgs/${file}`);

    return NextResponse.json({ backgrounds: backgroundImages });
  } catch (error) {
    console.error('Error reading backgrounds directory:', error);
    return NextResponse.json({ backgrounds: [] });
  }
}