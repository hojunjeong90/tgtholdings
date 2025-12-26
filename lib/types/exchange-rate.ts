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
