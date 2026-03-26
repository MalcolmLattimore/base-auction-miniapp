'use client';

import { createConfig, createStorage, cookieStorage, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: 'Base Auction'
    }),
    injected()
  ],
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [base.id]: http('https://mainnet.base.org')
  },
  ssr: true
});