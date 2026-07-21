import { CryptoFundamental } from '../types/trading';

// Pre-cached fallback data for top cryptocurrencies
const MOCK_FUNDAMENTALS: Record<string, CryptoFundamental> = {
  BTCUSDT: {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 65420.50,
    market_cap: 1290000000000,
    market_cap_rank: 1,
    total_volume: 28400000000,
    high_24h: 66100.00,
    low_24h: 64200.00,
    price_change_percentage_24h: 1.85,
    circulating_supply: 19720000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 73750.07,
    ath_change_percentage: -11.2,
    ath_date: '2024-03-14T07:10:36.635Z',
    description: 'Bitcoin is the first decentralized digital currency operating on a peer-to-peer network.',
    sentiment_votes_up_percentage: 84.5,
  },
  ETHUSDT: {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3480.20,
    market_cap: 418000000000,
    market_cap_rank: 2,
    total_volume: 16500000000,
    high_24h: 3540.00,
    low_24h: 3410.00,
    price_change_percentage_24h: 2.14,
    circulating_supply: 120200000,
    total_supply: 120200000,
    max_supply: null,
    ath: 4891.70,
    ath_change_percentage: -28.8,
    ath_date: '2021-11-16T08:42:15.000Z',
    description: 'Ethereum is an open-source decentralized smart contract execution platform.',
    sentiment_votes_up_percentage: 79.2,
  },
  SOLUSDT: {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 145.80,
    market_cap: 67800000000,
    market_cap_rank: 5,
    total_volume: 4100000000,
    high_24h: 149.20,
    low_24h: 141.50,
    price_change_percentage_24h: 3.42,
    circulating_supply: 465000000,
    total_supply: 580000000,
    max_supply: null,
    ath: 260.06,
    ath_change_percentage: -43.9,
    ath_date: '2021-11-06T21:54:35.825Z',
    description: 'Solana is a high-performance blockchain supporting fast transactions and dApps.',
    sentiment_votes_up_percentage: 81.0,
  },
};

export const fetchCryptoFundamental = async (symbol: string): Promise<CryptoFundamental> => {
  const fallback = MOCK_FUNDAMENTALS[symbol] || MOCK_FUNDAMENTALS.BTCUSDT;

  try {
    const coinId = fallback.id;
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) return fallback;

    const data = await response.json();
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image?.large,
      current_price: data.market_data?.current_price?.usd ?? fallback.current_price,
      market_cap: data.market_data?.market_cap?.usd ?? fallback.market_cap,
      market_cap_rank: data.market_cap_rank ?? fallback.market_cap_rank,
      total_volume: data.market_data?.total_volume?.usd ?? fallback.total_volume,
      high_24h: data.market_data?.high_24h?.usd ?? fallback.high_24h,
      low_24h: data.market_data?.low_24h?.usd ?? fallback.low_24h,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h ?? fallback.price_change_percentage_24h,
      circulating_supply: data.market_data?.circulating_supply ?? fallback.circulating_supply,
      total_supply: data.market_data?.total_supply ?? fallback.total_supply,
      max_supply: data.market_data?.max_supply ?? fallback.max_supply,
      ath: data.market_data?.ath?.usd ?? fallback.ath,
      ath_change_percentage: data.market_data?.ath_change_percentage?.usd ?? fallback.ath_change_percentage,
      ath_date: data.market_data?.ath_date?.usd ?? fallback.ath_date,
      description: data.description?.en ? data.description.en.split('. ')[0] + '.' : fallback.description,
      sentiment_votes_up_percentage: data.sentiment_votes_up_percentage ?? fallback.sentiment_votes_up_percentage,
    };
  } catch (error) {
    return fallback;
  }
};
