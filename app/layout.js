import './globals.css';
import { Providers } from './providers';

const APP_NAME = 'Base Auction';
const APP_DESCRIPTION = '基于智能合约的拍卖应用';
const BASE_APP_ID = '69c499660eed789ac81bfd89';
const PUBLIC_APP_URL = 'https://base-auction.vercel.app';
const TALENT_VERIFICATION =
  '011e8944a560ea62dc2cb695bb4c61e1f0a6ea6f605157c47ad12e493add025812411d9c128f2c26870cf68b2973cdf2fb131f8a5327263d7421af60e50836f4';

export const metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  metadataBase: new URL(PUBLIC_APP_URL)
};

export default function RootLayout({ children }) {
  const previewPayload = {
    version: 'next',
    imageUrl: `${PUBLIC_APP_URL}/og.svg`,
    button: {
      title: 'Launch Base Auction',
      action: {
        type: 'launch_frame',
        name: APP_NAME,
        url: PUBLIC_APP_URL,
        splashImageUrl: `${PUBLIC_APP_URL}/splash.svg`,
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
          <meta property="og:image" content={`${PUBLIC_APP_URL}/og.svg`} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={PUBLIC_APP_URL} />
          <meta name="fc:frame" content={JSON.stringify(previewPayload)} />
          <meta name="fc:miniapp" content={JSON.stringify(previewPayload)} />
        </head>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}