import { headers } from 'next/headers';
import './globals.css';
import { Providers } from './providers';

const APP_NAME = 'Base Auction';
const APP_DESCRIPTION = '基于智能合约的拍卖应用';
const BASE_APP_ID = '69c499660eed789ac81bfd89';
const TALENT_VERIFICATION =
  '011e8944a560ea62dc2cb695bb4c61e1f0a6ea6f605157c47ad12e493add025812411d9c128f2c26870cf68b2973cdf2fb131f8a5327263d7421af60e50836f4';

function getOrigin() {
  const headerStore = headers();
  const forwardedProto = headerStore.get('x-forwarded-proto');
  const forwardedHost = headerStore.get('x-forwarded-host');
  const host = forwardedHost || headerStore.get('host') || 'localhost:3000';
  const protocol = forwardedProto || (host.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

export const metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION
};

export default function RootLayout({ children }) {
  const origin = getOrigin();
  const previewPayload = {
    version: 'next',
    imageUrl: `${origin}/og.svg`,
    button: {
      title: 'Launch Base Auction',
      action: {
        type: 'launch_frame',
        name: APP_NAME,
        url: origin,
        splashImageUrl: `${origin}/splash.svg`,
        splashBackgroundColor: '#08111f'
      }
    }
  };

  return (
    <html lang="zh-CN">
      <body>
        <head>
          <meta name="base:app_id" content={BASE_APP_ID} />
          <meta name="talentapp:project_verification" content={TALENT_VERIFICATION} />
          <meta property="og:title" content={APP_NAME} />
          <meta property="og:description" content={APP_DESCRIPTION} />
          <meta property="og:image" content={`${origin}/og.svg`} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={origin} />
          <meta name="fc:frame" content={JSON.stringify(previewPayload)} />
          <meta name="fc:miniapp" content={JSON.stringify(previewPayload)} />
        </head>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
