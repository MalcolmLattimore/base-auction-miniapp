import { NextResponse } from 'next/server';
import { BASE_BUILDER_CODE, BASE_BUILDER_DATA_SUFFIX } from '@/lib/base-builder';

const APP_NAME = 'Base Auction';
const APP_DESCRIPTION = '基于智能合约的拍卖应用';
const BASE_APP_ID = '69c499660eed789ac81bfd89';
const PUBLIC_APP_URL = 'https://base-auction.vercel.app';

export async function GET() {
  return NextResponse.json({
    accountAssociation: {
      header: '',
      payload: '',
      signature: ''
    },
    frame: {
      version: '1',
      name: APP_NAME,
      homeUrl: PUBLIC_APP_URL,
      iconUrl: `${PUBLIC_APP_URL}/icon.svg`,
      imageUrl: `${PUBLIC_APP_URL}/og.svg`,
      buttonTitle: 'Open Base Auction',
      splashImageUrl: `${PUBLIC_APP_URL}/splash.svg`,
      splashBackgroundColor: '#08111f',
      webhookUrl: `${PUBLIC_APP_URL}/api/webhook`
    },
    miniapp: {
      version: '1',
      name: APP_NAME,
      homeUrl: PUBLIC_APP_URL,
      iconUrl: `${PUBLIC_APP_URL}/icon.svg`,
      imageUrl: `${PUBLIC_APP_URL}/og.svg`,
      buttonTitle: 'Open Base Auction',
      splashImageUrl: `${PUBLIC_APP_URL}/splash.svg`,
      splashBackgroundColor: '#08111f',
      tags: ['base', 'auction', 'onchain', 'payments', 'events'],
      subtitle: 'Smart contract auction house',
      description: APP_DESCRIPTION,
      primaryCategory: 'finance',
      heroImageUrl: `${PUBLIC_APP_URL}/og.svg`,
      tagline: 'Bid live on Base',
      ogTitle: APP_NAME,
      ogDescription: APP_DESCRIPTION,
      ogImageUrl: `${PUBLIC_APP_URL}/og.svg`,
      webhookUrl: `${PUBLIC_APP_URL}/api/webhook`,
      noindex: false,
      canonicalDomain: 'base-auction.vercel.app'
    },
    baseBuilder: {
      appId: BASE_APP_ID,
      builderCode: BASE_BUILDER_CODE,
      encodedDataSuffix: BASE_BUILDER_DATA_SUFFIX,
      ownerAddress: '0x79E15d2b057A9BaB49B081F38Fc664d23e570D3A'
    }
  });
}