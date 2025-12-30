/**
 * 암호화폐 관련 TypeScript 타입 정의
 */

// =============================================
// 거래소 및 코인 타입
// =============================================

/** 지원 거래소 */
export type CryptoExchange = 'upbit' | 'bithumb' | 'binance' | 'bybit' | 'coingecko';

/** 암호화폐 심볼 */
export type CryptoSymbol =
  | 'BTC' | 'ETH' | 'XRP' | 'SOL' | 'DOGE'
  | 'ADA' | 'AVAX' | 'DOT' | 'MATIC' | 'LINK'
  | 'ATOM' | 'UNI' | 'LTC' | 'BCH' | 'ETC'
  | 'XLM' | 'ALGO' | 'FIL' | 'VET' | 'AAVE'
  | 'SAND' | 'MANA' | 'AXS' | 'NEAR' | 'APT'
  | string; // 확장 가능

// =============================================
// 가격 데이터 타입
// =============================================

/** 암호화폐 가격 정보 (DB 테이블) */
export interface CryptoPrice {
  id: string;
  symbol: string;
  exchange: CryptoExchange;
  price_krw: number | null;
  price_usd: number | null;
  volume_24h: number | null;
  change_24h: number | null;
  market_cap: number | null;
  created_at: string;
}

/** 통합 가격 정보 (프론트엔드용) */
export interface CryptoPriceInfo {
  symbol: string;
  name: string;
  upbitPriceKrw: number | null;
  coingeckoPriceUsd: number | null;
  coingeckoPriceKrw: number | null;
  change24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  updatedAt: string;
}

// =============================================
// 김치프리미엄 타입
// =============================================

/** 김치프리미엄 정보 */
export interface KimchiPremium {
  symbol: string;
  name: string;
  upbitPriceKrw: number;
  binancePriceUsd: number;
  binancePriceKrw: number;
  exchangeRate: number;
  premiumPercent: number;
  premiumKrw: number;
  updatedAt: string;
}

/** 프리미엄 상태 */
export type PremiumStatus = 'high' | 'normal' | 'discount';

// =============================================
// 펀딩비 타입
// =============================================

/** 펀딩비 정보 (DB 테이블) */
export interface FundingRate {
  id: string;
  symbol: string;
  exchange: 'binance' | 'bybit';
  funding_rate: number;
  funding_time: string | null;
  mark_price: number | null;
  index_price: number | null;
  open_interest: number | null;
  created_at: string;
}

/** 통합 펀딩비 정보 (프론트엔드용) */
export interface FundingRateInfo {
  symbol: string;
  binanceRate: number | null;
  bybitRate: number | null;
  avgRate: number;
  nextFundingTime: string | null;
  signal: FundingSignal;
  openInterest: number | null;
}

/** 펀딩 시그널 */
export type FundingSignal = 'long_heavy' | 'long' | 'neutral' | 'short' | 'short_heavy';

// =============================================
// 일정 타입
// =============================================

/** 이벤트 유형 */
export type CryptoEventType =
  | 'token_unlock'
  | 'listing'
  | 'airdrop'
  | 'mainnet'
  | 'halving'
  | 'fork'
  | 'other';

/** 중요도 */
export type EventImportance = 'high' | 'medium' | 'low';

/** 암호화폐 일정 */
export interface CryptoEvent {
  id: string;
  symbol: string | null;
  event_type: CryptoEventType;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  source_url: string | null;
  importance: EventImportance;
  created_at: string;
}

// =============================================
// 상수 및 메타데이터
// =============================================

/** 코인 정보 메타데이터 */
export interface CoinMeta {
  symbol: string;
  name: string;
  nameKo: string;
  icon?: string;
  color?: string;
}

/** 주요 코인 정보 */
export const COIN_INFO: Record<string, CoinMeta> = {
  BTC: { symbol: 'BTC', name: 'Bitcoin', nameKo: '비트코인', color: '#F7931A' },
  ETH: { symbol: 'ETH', name: 'Ethereum', nameKo: '이더리움', color: '#627EEA' },
  XRP: { symbol: 'XRP', name: 'Ripple', nameKo: '리플', color: '#23292F' },
  SOL: { symbol: 'SOL', name: 'Solana', nameKo: '솔라나', color: '#9945FF' },
  DOGE: { symbol: 'DOGE', name: 'Dogecoin', nameKo: '도지코인', color: '#C2A633' },
  ADA: { symbol: 'ADA', name: 'Cardano', nameKo: '카르다노', color: '#0033AD' },
  AVAX: { symbol: 'AVAX', name: 'Avalanche', nameKo: '아발란체', color: '#E84142' },
  DOT: { symbol: 'DOT', name: 'Polkadot', nameKo: '폴카닷', color: '#E6007A' },
  MATIC: { symbol: 'MATIC', name: 'Polygon', nameKo: '폴리곤', color: '#8247E5' },
  LINK: { symbol: 'LINK', name: 'Chainlink', nameKo: '체인링크', color: '#2A5ADA' },
  ATOM: { symbol: 'ATOM', name: 'Cosmos', nameKo: '코스모스', color: '#2E3148' },
  UNI: { symbol: 'UNI', name: 'Uniswap', nameKo: '유니스왑', color: '#FF007A' },
  LTC: { symbol: 'LTC', name: 'Litecoin', nameKo: '라이트코인', color: '#BFBBBB' },
  BCH: { symbol: 'BCH', name: 'Bitcoin Cash', nameKo: '비트코인캐시', color: '#8DC351' },
  ETC: { symbol: 'ETC', name: 'Ethereum Classic', nameKo: '이더리움클래식', color: '#328332' },
  XLM: { symbol: 'XLM', name: 'Stellar', nameKo: '스텔라루멘', color: '#000000' },
  ALGO: { symbol: 'ALGO', name: 'Algorand', nameKo: '알고랜드', color: '#000000' },
  FIL: { symbol: 'FIL', name: 'Filecoin', nameKo: '파일코인', color: '#0090FF' },
  VET: { symbol: 'VET', name: 'VeChain', nameKo: '비체인', color: '#15BDFF' },
  AAVE: { symbol: 'AAVE', name: 'Aave', nameKo: '에이브', color: '#B6509E' },
  SAND: { symbol: 'SAND', name: 'The Sandbox', nameKo: '샌드박스', color: '#00ADEF' },
  MANA: { symbol: 'MANA', name: 'Decentraland', nameKo: '디센트럴랜드', color: '#FF2D55' },
  AXS: { symbol: 'AXS', name: 'Axie Infinity', nameKo: '엑시인피니티', color: '#0055D5' },
  NEAR: { symbol: 'NEAR', name: 'NEAR Protocol', nameKo: '니어프로토콜', color: '#000000' },
  APT: { symbol: 'APT', name: 'Aptos', nameKo: '앱토스', color: '#000000' },
};

/** 우선 표시 코인 (상위 고정) */
export const PRIORITY_COINS: string[] = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE'];

/** 업비트 마켓 코드 매핑 */
export const UPBIT_MARKET_MAP: Record<string, string> = {
  BTC: 'KRW-BTC',
  ETH: 'KRW-ETH',
  XRP: 'KRW-XRP',
  SOL: 'KRW-SOL',
  DOGE: 'KRW-DOGE',
  ADA: 'KRW-ADA',
  AVAX: 'KRW-AVAX',
  DOT: 'KRW-DOT',
  MATIC: 'KRW-MATIC',
  LINK: 'KRW-LINK',
  ATOM: 'KRW-ATOM',
  // ... 더 추가 가능
};

/** CoinGecko ID 매핑 */
export const COINGECKO_ID_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  XRP: 'ripple',
  SOL: 'solana',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  ATOM: 'cosmos',
  UNI: 'uniswap',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  ETC: 'ethereum-classic',
  // ... 더 추가 가능
};

// =============================================
// 유틸리티 함수
// =============================================

/**
 * 김치프리미엄 상태 판단
 */
export function getPremiumStatus(premiumPercent: number): PremiumStatus {
  if (premiumPercent >= 3) return 'high';
  if (premiumPercent <= -1) return 'discount';
  return 'normal';
}

/**
 * 펀딩 시그널 판단
 */
export function getFundingSignal(rate: number): FundingSignal {
  const pct = rate * 100; // 0.0001 → 0.01%
  if (pct >= 0.05) return 'long_heavy';
  if (pct >= 0.01) return 'long';
  if (pct <= -0.05) return 'short_heavy';
  if (pct <= -0.01) return 'short';
  return 'neutral';
}

/**
 * 펀딩비 포맷팅 (소수점 4자리 → 퍼센트)
 */
export function formatFundingRate(rate: number): string {
  const pct = rate * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(4)}%`;
}

/**
 * 가격 포맷팅 (원화)
 */
export function formatPriceKrw(price: number): string {
  return price.toLocaleString('ko-KR', {
    maximumFractionDigits: 0,
  });
}

/**
 * 가격 포맷팅 (달러)
 */
export function formatPriceUsd(price: number): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  });
}

/**
 * 변동률 포맷팅
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * 코인 이름 가져오기
 */
export function getCoinName(symbol: string): string {
  return COIN_INFO[symbol]?.nameKo || COIN_INFO[symbol]?.name || symbol;
}
