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
    const targetUrl = `${BACKEND_URL}/${pathString}${queryString}`;
    console.log(`[Proxy] GET Request to: ${targetUrl}`);
    const response = await fetch(targetUrl, {
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

    const targetUrl = `${BACKEND_URL}/${pathString}`;
    console.error(`[Proxy POST] Attempting: ${targetUrl}`);
    
    try {
      const response = await fetch(targetUrl, fetchOptions);
      console.error(`[Proxy POST] Received response: ${response.status}`);

      const data = await response.text();
      
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
        },
      });
    } catch (fetchError) {
      console.error(`[Proxy POST] Fetch Error:`, fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('[Proxy POST] Global Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend server', detail: String(error) },
      { status: 502 }
    );
  }
}
