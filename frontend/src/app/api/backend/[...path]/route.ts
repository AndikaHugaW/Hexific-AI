import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// Set a longer timeout for AI requests (5 minutes)
export const maxDuration = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;
  
  try {
    const response = await fetch(`${BACKEND_URL}/${pathString}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend server' },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  
  try {
    const contentType = request.headers.get('Content-Type') || 'application/json';
    let body: string | FormData;
    
    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      body = await request.text();
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: contentType.includes('multipart/form-data') 
        ? {} 
        : { 'Content-Type': contentType },
    };

    if (contentType.includes('multipart/form-data')) {
      fetchOptions.body = body as FormData;
    } else {
      fetchOptions.body = body as string;
    }

    const response = await fetch(`${BACKEND_URL}/${pathString}`, fetchOptions);

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend server', detail: String(error) },
      { status: 502 }
    );
  }
}
