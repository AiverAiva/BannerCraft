import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { BANNER_COLORS, BANNER_PATTERNS } from '@/lib/banner-data';

export const dynamic = 'force-dynamic';

interface Layer {
  shape: string;
  color: string;
}

interface BannerParams {
  base: string;
  layers: Layer[];
  width?: number;
  height?: number;
}

// Banner aspect ratio (Minecraft banner face is 20x40)
const BANNER_ASPECT_RATIO = 20 / 40; // 0.5

const textureCache = new Map<string, string>();

function getBase64Texture(assetName: string): string {
  if (textureCache.has(assetName)) {
    return textureCache.get(assetName)!;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'textures', 'banner', `${assetName}.png`);
    const buffer = fs.readFileSync(filePath);
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
    textureCache.set(assetName, base64);
    return base64;
  } catch (err) {
    console.error(`Failed to load texture ${assetName}:`, err);
    return '';
  }
}

function validateBannerConfig(config: any): { params: BannerParams | null; error: string | null } {
  const base = config.base || 'white';
  if (!BANNER_COLORS[base]) {
    return { params: null, error: `Invalid base color: ${base}. Valid colors: ${Object.keys(BANNER_COLORS).join(', ')}` };
  }

  let layers: Layer[] = [];
  if (config.layers) {
    layers = config.layers;
    if (!Array.isArray(layers)) {
      return { params: null, error: 'layers must be an array' };
    }
    if (layers.length > 10) {
      return { params: null, error: 'Maximum 10 layers allowed' };
    }
  }

  // Validate each layer
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (!layer.shape || !layer.color) {
      return { params: null, error: `Layer ${i + 1} must have shape and color` };
    }
    if (!BANNER_PATTERNS[layer.shape]) {
      return { params: null, error: `Invalid shape "${layer.shape}" in layer ${i + 1}. Valid shapes: ${Object.keys(BANNER_PATTERNS).join(', ')}` };
    }
    if (!BANNER_COLORS[layer.color]) {
      return { params: null, error: `Invalid color "${layer.color}" in layer ${i + 1}. Valid colors: ${Object.keys(BANNER_COLORS).join(', ')}` };
    }
  }

  let width: number | undefined;
  let height: number | undefined;

  const widthParam = config.width;
  const heightParam = config.height;

  if (widthParam !== undefined && widthParam !== null && heightParam !== undefined && heightParam !== null) {
    return { params: null, error: 'Only one of width or height can be provided, not both' };
  }

  if (widthParam !== undefined && widthParam !== null) {
    const parsedWidth = typeof widthParam === 'number' ? widthParam : parseInt(widthParam, 10);
    if (isNaN(parsedWidth) || parsedWidth < 1 || parsedWidth > 2000) {
      return { params: null, error: 'width must be a number between 1 and 2000' };
    }
    width = parsedWidth;
    height = Math.round(width / BANNER_ASPECT_RATIO);
  } else if (heightParam !== undefined && heightParam !== null) {
    const parsedHeight = typeof heightParam === 'number' ? heightParam : parseInt(heightParam, 10);
    if (isNaN(parsedHeight) || parsedHeight < 1 || parsedHeight > 3200) {
      return { params: null, error: 'height must be a number between 1 and 3200' };
    }
    height = parsedHeight;
    width = Math.round(height * BANNER_ASPECT_RATIO);
  }

  return {
    params: { base, layers, width, height },
    error: null
  };
}

function parseParams(searchParams: URLSearchParams): { params: BannerParams | null; error: string | null } {
  let layers: any = undefined;
  if (searchParams.get('layers')) {
    try {
      layers = JSON.parse(decodeURIComponent(searchParams.get('layers')!));
    } catch {
      return { params: null, error: 'Invalid JSON in layers parameter' };
    }
  }
  
  const config = {
    base: searchParams.get('base') || 'white',
    layers,
    width: searchParams.get('width'),
    height: searchParams.get('height')
  };

  return validateBannerConfig(config);
}

function generateBannerSVG(params: BannerParams): string {
  const width = params.width || 100;
  const height = params.height || 200; // Default height for 1:2 aspect ratio

  const filters = Object.entries(BANNER_COLORS).map(([name, { hex }]) => `
    <filter id="tint-${name}">
      <feFlood flood-color="${hex}" result="flood" />
      <feComposite in="flood" in2="SourceGraphic" operator="in" />
    </filter>`).join('');

  const layers: string[] = [];

  // Add base texture with crop (1, 1, 20, 40)
  const baseData = getBase64Texture('base');
  layers.push(`<svg x="0" y="0" width="${width}" height="${height}" viewBox="1 1 20 40" preserveAspectRatio="none">
    <image href="${baseData}" width="64" height="64" filter="url(#tint-${params.base})" style="image-rendering: pixelated;" image-rendering="pixelated" />
  </svg>`);

  // Process all layers
  for (const layer of params.layers) {
    const patternConfig = BANNER_PATTERNS[layer.shape];
    if (patternConfig) {
      const patternData = getBase64Texture(patternConfig.assetName);
      layers.push(`  <svg x="0" y="0" width="${width}" height="${height}" viewBox="1 1 20 40" preserveAspectRatio="none">
    <image href="${patternData}" width="64" height="64" filter="url(#tint-${layer.color})" style="image-rendering: pixelated;" image-rendering="pixelated" />
  </svg>`);
    }
  }

  // Generate complete SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="image-rendering: pixelated;" image-rendering="pixelated">
  <defs>
    ${filters}
  </defs>
  ${layers.join('\n  ')}
</svg>`;

  return svg;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const { params, error } = parseParams(searchParams);
  const filetype = searchParams.get('filetype') || 'svg';

  if (error) {
    return NextResponse.json(
      { error, success: false },
      { status: 400 }
    );
  }

  const svg = generateBannerSVG(params!);

  try {
    let bodyData: any = svg;
    let contentType = 'image/svg+xml';
    
    if (filetype !== 'svg') {
      const buffer = Buffer.from(svg);
      let sharpInstance = sharp(buffer);
      
      if (filetype === 'png') {
        sharpInstance = sharpInstance.png();
        contentType = 'image/png';
        bodyData = await sharpInstance.toBuffer();
      } else if (filetype === 'jpg' || filetype === 'jpeg') {
        sharpInstance = sharpInstance.jpeg();
        contentType = 'image/jpeg';
        bodyData = await sharpInstance.toBuffer();
      } else if (filetype === 'webm' || filetype === 'webp') {
        sharpInstance = sharpInstance.webp();
        contentType = 'image/webp';
        bodyData = await sharpInstance.toBuffer();
      }
    }

    return new NextResponse(bodyData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to process image: ' + err.message, success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid JSON body', success: false },
      { status: 400 }
    );
  }

  const { params, error } = validateBannerConfig(body);
  const filetype = body.filetype || 'svg';

  if (error) {
    return NextResponse.json(
      { error, success: false },
      { status: 400 }
    );
  }

  const svg = generateBannerSVG(params!);

  try {
    let bodyData: any = svg;
    let contentType = 'image/svg+xml';
    
    if (filetype !== 'svg') {
      const buffer = Buffer.from(svg);
      let sharpInstance = sharp(buffer);
      
      if (filetype === 'png') {
        sharpInstance = sharpInstance.png();
        contentType = 'image/png';
        bodyData = await sharpInstance.toBuffer();
      } else if (filetype === 'jpg' || filetype === 'jpeg') {
        sharpInstance = sharpInstance.jpeg();
        contentType = 'image/jpeg';
        bodyData = await sharpInstance.toBuffer();
      } else if (filetype === 'webm' || filetype === 'webp') {
        sharpInstance = sharpInstance.webp();
        contentType = 'image/webp';
        bodyData = await sharpInstance.toBuffer();
      }
    }

    return new NextResponse(bodyData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to process image: ' + err.message, success: false },
      { status: 500 }
    );
  }
}

