export const AUCTION_ADDRESS = '0x79E15d2b057A9BaB49B081F38Fc664d23e570D3A';
export const BASESCAN_BASE_URL = 'https://basescan.org';

export const auctionAbi = [
  {
    type: 'constructor',
    stateMutability: 'nonpayable',
    inputs: []
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    type: 'function',
    name: 'highestBidder',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    type: 'function',
    name: 'highestBid',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'auctionEndTime',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'auctionEnded',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    type: 'function',
    name: 'startAuction',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_biddingTime', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'bid',
    stateMutability: 'payable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'endAuction',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'getHighestBid',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getHighestBidder',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    type: 'event',
    name: 'NewBid',
    inputs: [
      { indexed: false, name: 'bidder', type: 'address' },
      { indexed: false, name: 'bidAmount', type: 'uint256' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'AuctionEnded',
    inputs: [
      { indexed: false, name: 'winner', type: 'address' },
      { indexed: false, name: 'bidAmount', type: 'uint256' }
    ],
    anonymous: false
  }
];
