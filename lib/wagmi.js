'use client';

import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { BASE_BUILDER_DATA_SUFFIX } from '@/lib/base-builder';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Base Auction'
    })
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org')
  },
  dataSuffix: BASE_BUILDER_DATA_SUFFIX,
  ssr: true
});