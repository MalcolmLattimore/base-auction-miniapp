'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Clock3,
  Gavel,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Trophy,
  Wallet
} from 'lucide-react';
import { formatEther, parseEther } from 'viem';
import {
  useAccount,
  useBlockNumber,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract
} from 'wagmi';
import { auctionAbi, AUCTION_ADDRESS, BASESCAN_BASE_URL } from '@/lib/auction';
import { trackTransaction } from '@/utils/track';

const APP_TRACK_ID = 'app-021';
const APP_NAME = 'Base Auction';

function shortAddress(address) {
  if (!address) return 'No bidder yet';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBid(value) {
  if (!value && value !== 0n) return '--';
  const numeric = Number(formatEther(value));
  if (!Number.isFinite(numeric)) return `${formatEther(value)} ETH`;
  if (numeric === 0) return '0 ETH';
  return `${numeric.toFixed(numeric >= 1 ? 3 : 5)} ETH`;
}

function formatTimeLeft(secondsLeft) {
  if (secondsLeft <= 0) return 'Ready to settle';
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = Math.floor(secondsLeft % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function AuctionShell() {
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const [bidAmount, setBidAmount] = useState('0.01');
  const [biddingMinutes, setBiddingMinutes] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [lastHash, setLastHash] = useState('');
  const [events, setEvents] = useState([]);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const { data: summary, refetch: refetchSummary, isFetching } = useReadContracts({
    contracts: [
      { address: AUCTION_ADDRESS, abi: auctionAbi, functionName: 'owner' },
      { address: AUCTION_ADDRESS, abi: auctionAbi, functionName: 'highestBidder' },
      { address: AUCTION_ADDRESS, abi: auctionAbi, functionName: 'highestBid' },
      { address: AUCTION_ADDRESS, abi: auctionAbi, functionName: 'auctionEndTime' },
      { address: AUCTION_ADDRESS, abi: auctionAbi, functionName: 'auctionEnded' }
    ],
    allowFailure: false
  });

  const { data: currentHighestBid, refetch: refetchHighestBid } = useReadContract({
    address: AUCTION_ADDRESS,
    abi: auctionAbi,
    functionName: 'getHighestBid'
  });

  const owner = summary?.[0]?.result;
  const highestBidder = summary?.[1]?.result;
  const highestBid = summary?.[2]?.result ?? currentHighestBid ?? 0n;
  const auctionEndTime = Number(summary?.[3]?.result ?? 0n);
  const auctionEnded = Boolean(summary?.[4]?.result);
  const isOwner = address && owner ? address.toLowerCase() === owner.toLowerCase() : false;
  const timeLeft = Math.max(auctionEndTime - now, 0);

  const primaryConnector = useMemo(
    () => connectors.find((connector) => connector.id === 'baseAccount') || connectors.find((connector) => connector.id === 'injected') || connectors[0],
    [connectors]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      if (!publicClient) return;

      try {
        const [bidLogs, endLogs] = await Promise.all([
          publicClient.getLogs({
            address: AUCTION_ADDRESS,
            event: {
              type: 'event',
              name: 'NewBid',
              inputs: [
                { indexed: false, name: 'bidder', type: 'address' },
                { indexed: false, name: 'bidAmount', type: 'uint256' }
              ]
            },
            fromBlock: 0n,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: AUCTION_ADDRESS,
            event: {
              type: 'event',
              name: 'AuctionEnded',
              inputs: [
                { indexed: false, name: 'winner', type: 'address' },
                { indexed: false, name: 'bidAmount', type: 'uint256' }
              ]
            },
            fromBlock: 0n,
            toBlock: 'latest'
          })
        ]);

        const mapped = [
          ...bidLogs.map((log) => ({
            type: 'bid',
            txHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
            title: 'New leading bid',
            description: `${shortAddress(log.args.bidder)} pushed the auction to ${formatBid(log.args.bidAmount)}.`
          })),
          ...endLogs.map((log) => ({
            type: 'close',
            txHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
            title: 'Auction settled',
            description: `${shortAddress(log.args.winner)} secured the final lot at ${formatBid(log.args.bidAmount)}.`
          }))
        ]
          .sort((a, b) => b.blockNumber - a.blockNumber)
          .slice(0, 6);

        if (mounted) {
          setEvents(mapped);
        }
      } catch {
        if (mounted) {
          setEvents([]);
        }
      }
    }

    loadEvents();
    return () => {
      mounted = false;
    };
  }, [publicClient, blockNumber]);

  async function refreshAll() {
    await Promise.all([refetchSummary(), refetchHighestBid()]);
  }

  async function runTransaction(config, successMessage) {
    if (!address) {
      setFeedback('Please connect a wallet first.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback('Waiting for wallet confirmation...');
      const hash = await writeContractAsync(config);
      setFeedback('Transaction sent. Waiting for confirmation...');
      setLastHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      trackTransaction(APP_TRACK_ID, APP_NAME, address, hash);
      await refreshAll();
      setFeedback(successMessage);
    } catch (error) {
      const message =
        error?.shortMessage ||
        error?.message ||
        'The transaction could not be completed. Please try again.';
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartAuction() {
    const minutes = Number(biddingMinutes);
    if (!minutes || minutes <= 0) {
      setFeedback('Enter a valid auction duration in minutes.');
      return;
    }

    await runTransaction(
      {
        address: AUCTION_ADDRESS,
        abi: auctionAbi,
        functionName: 'startAuction',
        args: [BigInt(Math.floor(minutes * 60))]
      },
      'Auction started successfully.'
    );
  }

  async function handleBid() {
    try {
      const value = parseEther(bidAmount || '0');
      if (value <= 0n) {
        setFeedback('Bid amount must be greater than zero.');
        return;
      }

      await runTransaction(
        {
          address: AUCTION_ADDRESS,
          abi: auctionAbi,
          functionName: 'bid',
          value
        },
        'Your bid is now on-chain.'
      );
    } catch {
      setFeedback('Enter a valid ETH amount, for example 0.025.');
    }
  }

  async function handleEndAuction() {
    await runTransaction(
      {
        address: AUCTION_ADDRESS,
        abi: auctionAbi,
        functionName: 'endAuction'
      },
      'Auction ended and funds transferred to the owner.'
    );
  }

  return (
    <main className="page-shell">
      <div className="layout">
        <div className="top-bar">
          <div className="brand">
            <div className="brand-mark">
              <Gavel size={22} />
            </div>
            <div>
              <h3>Base Auction</h3>
              <p className="muted">Contract-driven bidding on Base mainnet</p>
            </div>
          </div>
          <div className="inline-meta">
            <span className="meta-tag">Base App ID 69c499660eed789ac81bfd89</span>
            <span className="meta-tag">Contract {shortAddress(AUCTION_ADDRESS)}</span>
            {isConnected ? (
              <button className="ghost-button" onClick={() => disconnect()}>
                <Wallet size={16} />
                {shortAddress(address)}
              </button>
            ) : (
              <button
                className="ghost-button"
                disabled={!primaryConnector || isConnecting}
                onClick={() => primaryConnector && connect({ connector: primaryConnector })}
              >
                <Wallet size={16} />
                {isConnecting ? 'Connecting...' : primaryConnector?.id === 'baseAccount' ? 'Connect Base Account' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        <section className="hero">
          <div className="card hero-card">
            <div>
              <span className="eyebrow">Smart Contract Auction</span>
              <h1>Curated lots. Live bids. Native Base settlement.</h1>
              <p>
                Base Auction is a polished mini app for launching timed auctions, placing live bids,
                and settling the winning order on-chain. It combines contract actions, event-driven
                activity, and transaction attribution tracking in one elegant surface.
              </p>
            </div>
            <div className="hero-grid">
              <div className="mini-stat">
                <span>Highest bid</span>
                <strong>{formatBid(highestBid)}</strong>
              </div>
              <div className="mini-stat">
                <span>Lead bidder</span>
                <strong>{shortAddress(highestBidder)}</strong>
              </div>
              <div className="mini-stat">
                <span>Time remaining</span>
                <strong>{formatTimeLeft(timeLeft)}</strong>
              </div>
            </div>
          </div>

          <div className="side-stack">
            <div className="hero-badge card">
              <span className="eyebrow">Live Status</span>
              <strong>{auctionEnded ? 'Auction Closed' : 'Auction Open'}</strong>
              <p>
                {auctionEnded
                  ? 'Settlement has completed and the final transfer has been executed.'
                  : 'Bids can continue until the countdown ends or the owner settles after expiry.'}
              </p>
            </div>
            <div className="hero-badge card">
              <span className="eyebrow">Onchain Data</span>
              <strong>{events.length || 0} recent events</strong>
              <p>Each successful transaction is tracked for attribution and linked back to BaseScan.</p>
            </div>
          </div>
        </section>

        <section className="main-grid">
          <div className="panel">
            <div className="section-title">
              <div>
                <h2>Auction Controls</h2>
                <p className="muted">Start, bid, and settle directly against the deployed contract.</p>
              </div>
              <button className="ghost-button" disabled={isFetching} onClick={() => refreshAll()}>
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="actions">
              <div className="action-card">
                <h3>Start auction</h3>
                <p>Owner-only action. Sets a fresh end time based on the duration you enter.</p>
                <div className="field-row">
                  <input
                    className="input"
                    value={biddingMinutes}
                    onChange={(event) => setBiddingMinutes(event.target.value)}
                    placeholder="Duration in minutes"
                  />
                  <button className="button" disabled={!isOwner || isSubmitting} onClick={handleStartAuction}>
                    {isSubmitting ? <LoaderCircle size={18} /> : <Clock3 size={18} />}
                    Start
                  </button>
                </div>
              </div>

              <div className="action-card">
                <h3>Place bid</h3>
                <p>Send a higher ETH amount than the current leader. Previous top bids are refunded by contract.</p>
                <div className="field-row">
                  <input
                    className="input"
                    value={bidAmount}
                    onChange={(event) => setBidAmount(event.target.value)}
                    placeholder="Bid amount in ETH"
                  />
                  <button className="button" disabled={isSubmitting || auctionEnded} onClick={handleBid}>
                    {isSubmitting ? <LoaderCircle size={18} /> : <Sparkles size={18} />}
                    Bid
                  </button>
                </div>
              </div>

              <div className="action-card">
                <h3>End auction</h3>
                <p>Owner-only action. Finalizes the auction, emits the winner event, and releases funds.</p>
                <div className="field-row single">
                  <button className="button" disabled={!isOwner || isSubmitting} onClick={handleEndAuction}>
                    {isSubmitting ? <LoaderCircle size={18} /> : <Trophy size={18} />}
                    End Auction
                  </button>
                </div>
              </div>
            </div>

            {(feedback || lastHash) && (
              <div className="tx-box">
                <strong>{feedback || 'Transaction updated.'}</strong>
                {lastHash ? (
                  <>
                    <code>{lastHash}</code>
                    <a href={`${BASESCAN_BASE_URL}/tx/${lastHash}`} target="_blank" rel="noreferrer">
                      View on BaseScan
                    </a>
                  </>
                ) : null}
              </div>
            )}

            <p className="footer-note">
              Every confirmed write action triggers the required attribution tracker in
              <code> utils/track.js </code>
              so transaction hashes can be validated downstream for Base dashboard and 8021 flows.
            </p>
          </div>

          <div className="side-stack">
            <div className="panel">
              <div className="section-title">
                <div>
                  <h2>Contract State</h2>
                  <p className="muted">Live values read from the deployed auction contract.</p>
                </div>
              </div>
              <div className="status-grid">
                <div className="status-card">
                  <div className="status-label">Owner</div>
                  <div className="status-value">{shortAddress(owner)}</div>
                </div>
                <div className="status-card">
                  <div className="status-label">Status</div>
                  <div className="status-value">
                    <span className={`status-pill ${auctionEnded ? 'closed' : ''}`}>
                      {auctionEnded ? 'Closed' : 'Accepting bids'}
                    </span>
                  </div>
                </div>
                <div className="status-card">
                  <div className="status-label">Highest bid</div>
                  <div className="status-value">{formatBid(highestBid)}</div>
                </div>
                <div className="status-card">
                  <div className="status-label">Highest bidder</div>
                  <div className="status-value">{shortAddress(highestBidder)}</div>
                </div>
                <div className="status-card">
                  <div className="status-label">Auction end timestamp</div>
                  <div className="status-value">{auctionEndTime || '--'}</div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="section-title">
                <div>
                  <h2>Recent Events</h2>
                  <p className="muted">Indexed straight from on-chain logs.</p>
                </div>
              </div>
              <div className="event-list">
                {events.length ? (
                  events.map((event) => (
                    <a
                      key={`${event.txHash}-${event.blockNumber}`}
                      className="event-row"
                      href={`${BASESCAN_BASE_URL}/tx/${event.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="event-icon">
                        {event.type === 'bid' ? <Sparkles size={18} /> : <Trophy size={18} />}
                      </div>
                      <div>
                        <strong>{event.title}</strong>
                        <p>{event.description}</p>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="event-row">
                    <div className="event-icon">
                      <LoaderCircle size={18} />
                    </div>
                    <div>
                      <strong>Listening for auction activity</strong>
                      <p>As bids and settlement events appear on Base, they will be rendered here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
