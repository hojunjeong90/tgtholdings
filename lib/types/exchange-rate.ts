/**
 * 환율 관련 TypeScript 타입 정의
 */

// 지원 통화 코드 (12개)
export type CurrencyCode =
  | 'KRW'
  | 'USD'
  | 'JPY'
  | 'EUR'
  | 'CNY'
  | 'GBP'
  | 'CHF'
  | 'AUD'
  | 'CAD'
  | 'HKD'
  | 'SGD'
  | 'THB';

// DB 테이블 레코드
export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string; // 기본 'KRW'
  rate: number;
  created_at: string;
}

// 통화 정보 (UI용)
export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  flag: string;
  symbol: string;
}

// 환율 맵 (통화코드 -> KRW 환율)
export type ExchangeRateMap = Record<CurrencyCode, number>;

// 통화 입력 상태
export interface CurrencyInputState {
  activeCurrency: CurrencyCode;
  amount: number;
}

// 통화 정보 상수
export const CURRENCY_INFO: Record<CurrencyCode, CurrencyInfo> = {
  KRW: { code: 'KRW', name: '대한민국 원', flag: '🇰🇷', symbol: '₩' },
  USD: { code: 'USD', name: '미국 달러', flag: '🇺🇸', symbol: '$' },
  JPY: { code: 'JPY', name: '일본 엔', flag: '🇯🇵', symbol: '¥' },
  EUR: { code: 'EUR', name: '유로', flag: '🇪🇺', symbol: '€' },
  CNY: { code: 'CNY', name: '중국 위안', flag: '🇨🇳', symbol: '¥' },
  GBP: { code: 'GBP', name: '영국 파운드', flag: '🇬🇧', symbol: '£' },
  CHF: { code: 'CHF', name: '스위스 프랑', flag: '🇨🇭', symbol: 'Fr' },
  AUD: { code: 'AUD', name: '호주 달러', flag: '🇦🇺', symbol: 'A$' },
  CAD: { code: 'CAD', name: '캐나다 달러', flag: '🇨🇦', symbol: 'C$' },
  HKD: { code: 'HKD', name: '홍콩 달러', flag: '🇭🇰', symbol: 'HK$' },
  SGD: { code: 'SGD', name: '싱가포르 달러', flag: '🇸🇬', symbol: 'S$' },
  THB: { code: 'THB', name: '태국 바트', flag: '🇹🇭', symbol: '฿' },
};

// 우선순위 통화 (최상단 배치)
export const PRIORITY_CURRENCIES: CurrencyCode[] = ['KRW', 'USD', 'JPY'];

// 전체 통화 순서 (우선순위 + 나머지)
export const ORDERED_CURRENCIES: CurrencyCode[] = [
  'KRW',
  'USD',
  'JPY', // 우선순위
  'EUR',
  'CNY',
  'GBP',
  'CHF',
  'AUD',
  'CAD',
  'HKD',
  'SGD',
  'THB',
];

// 트렌드 방향
export type TrendDirection = 'up' | 'down' | 'neutral';

// 트렌드 강도
export type TrendStrength = 'strong' | 'moderate' | 'weak';

// 환율 트렌드 정보
export interface RateTrend {
  current: number;
  avg1w: number; // 1주 평균
  avg2w: number; // 2주 평균
  avg4w: number; // 4주 평균
  diff1w: number; // 1주 평균 대비 차이 (절대값)
  diff2w: number; // 2주 평균 대비 차이 (절대값)
  diff4w: number; // 4주 평균 대비 차이 (절대값)
  pct1w: number; // 1주 평균 대비 변동률 (%)
  pct2w: number; // 2주 평균 대비 변동률 (%)
  pct4w: number; // 4주 평균 대비 변동률 (%)
  trend1w: TrendDirection; // 1주 대비 방향
  trend2w: TrendDirection; // 2주 대비 방향
  trend4w: TrendDirection; // 4주 대비 방향
  strength: TrendStrength; // 트렌드 강도
  history: number[]; // 최근 28일 환율 (스파크라인용)
  signal: '유리' | '불리' | '보통'; // 환전 시그널
}

// 통화별 트렌드 맵
export type ExchangeRateTrendMap = Record<CurrencyCode, RateTrend>;

// 히스토리 데이터 포인트
export interface RateHistoryPoint {
  date: string;
  rate: number;
}
