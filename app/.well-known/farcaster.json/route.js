import { NextResponse } from 'next/server';

const APP_NAME = 'Base Auction';
const APP_DESCRIPTION = '基于智能合约的拍卖应用';
const BASE_APP_ID = '69c499660eed789ac81bfd89';

export async function GET(request) {
  const origin = request.nextUrl.origin;

  return NextResponse.json({
    accountAssociation: {
      header: '',
      payload: '',
      signature: ''
    },
    frame: {
      version: '1',
      name: APP_NAME,
      homeUrl: origin,
      iconUrl: `${origin}/icon.svg`,
      imageUrl: `${origin}/og.svg`,
      buttonTitle: 'Open Base Auction',
      splashImageUrl: `${origin}/splash.svg`,
      splashBackgroundColor: '#08111f',
      webhookUrl: `${origin}/api/webhook`
    },
    miniapp: {
      version: '1',
      name: APP_NAME,
      homeUrl: origin,
      iconUrl: `${origin}/icon.svg`,
      imageUrl: `${origin}/og.svg`,
      buttonTitle: 'Open Base Auction',
      splashImageUrl: `${origin}/splash.svg`,
      splashBackgroundColor: '#08111f',
      tags: ['base', 'auction', 'onchain', 'payments', 'events'],
      subtitle: 'Smart contract auction house',
      description: APP_DESCRIPTION,
      primaryCategory: 'finance',
      heroImageUrl: `${origin}/og.svg`,
      tagline: 'Bid live on Base',
      ogTitle: APP_NAME,
      ogDescription: APP_DESCRIPTION,
      ogImageUrl: `${origin}/og.svg`,
      noindex: false,
      canonicalDomain: request.nextUrl.host
    },
    baseBuilder: {
      allowedAddresses: ['0x79E15d2b057A9BaB49B081F38Fc664d23e570D3A'],
      appId: BASE_APP_ID
    }
  });
}
