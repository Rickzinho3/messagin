import { NextRequest, NextResponse } from 'next/server';
import { countUnread } from '@/lib/server-data';

export async function GET(request: NextRequest) {
  const room = request.nextUrl.searchParams.get('room');
  const recipient = request.nextUrl.searchParams.get('for');
  if (!room || !recipient) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }
  try {
    const unread = await countUnread(room, recipient);
    return NextResponse.json({ unread });
  } catch (error) {
    console.error('Failed to count unread messages:', error);
    return NextResponse.json({ error: 'Failed to count unread' }, { status: 500 });
  }
}
