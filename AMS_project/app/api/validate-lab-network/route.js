
import { NextResponse } from 'next/server';

/**
 * GET /api/validate-lab-network
 * Simple utility to check if the caller is on the lab network.
 */
export async function GET(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const remoteIp = forwarded ? forwarded.split(',')[0] : 'unknown';

  const isLocalhost = remoteIp === '::1' || remoteIp === '127.0.0.1' || remoteIp === '::ffff:127.0.0.1';
  const LAB_PUBLIC_IP = process.env.LAB_STATIC_IP || 'unknown'; 
  
  const isValid = isLocalhost || (remoteIp === LAB_PUBLIC_IP) || (process.env.ALLOW_ALL_IPS === 'true');
  
  return NextResponse.json({
    valid: isValid,
    ip: remoteIp,
    message: isValid ? 'Connected to Lab Network' : 'Unauthorized Network'
  });
}
