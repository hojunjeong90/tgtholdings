/**
 * 부의 시나리오 거시경제 대시보드 타입 정의
 *
 * 인과 흐름: 금리 → 유동성 → 환율 → 자산가격
 */

// 시나리오 단계
export type ScenarioStep = 'policy' | 'liquidity' | 'currency' | 'assets';

// 지표 ID
export type IndicatorId =
  // STEP 1: 통화정책 & 금리
  | 'fed_rate'      // 미국 기준금리
  | 'bok_rate'      // 한국 기준금리
  | 'us_10y'        // 미국 10Y 국채
  | 'spread_2y10y'  // 2Y-10Y 스프레드
  // STEP 2: 유동성
  | 'us_m2'         // 미국 M2
  | 'kr_m2'         // 한국 M2
  | 'fed_assets'    // 연준 자산총액
  | 'bok_assets'    // 한은 자산총액
  // STEP 3: 환율 & 달러
  | 'usd_krw'       // USD/KRW
  | 'dxy'           // 달러 인덱스
  | 'usd_cny'       // USD/CNY
  // STEP 4: 자산시장
  | 'sp500'         // S&P 500
  | 'nasdaq'        // NASDAQ
  | 'kospi'         // KOSPI
  | 'gold'          // 금
  | 'btc';          // 비트코인

// 데이터 소스
export type DataSourceType = 'FRED' | 'ECOS' | 'YAHOO' | 'EXISTING';

// 포맷 타입
export type FormatType = 'number' | 'percent' | 'currency' | 'trillion';

// 지표 메타데이터
export interface ScenarioIndicator {
  id: IndicatorId;
  step: ScenarioStep;
  name: string;
  shortName: string;
  unit: string;
  source: DataSourceType;
  seriesId?: string;
  yahooSymbol?: string;
  format: FormatType;
  decimals: number;
  invertColor?: boolean; // 값이 높을수록 부정적일 때 true
}

// 데이터 포인트
export interface ScenarioDataPoint {
  date: string;
  value: number;
}

// 트렌드 데이터
export interface ScenarioTrendData {
  indicator: IndicatorId;
  current: number;
  previous: number;
  change1d: number;
  change1w: number;
  change1m: number;
  change3m: number;
  changeYtd: number;
  history: ScenarioDataPoint[];
  lastUpdated: string;
}

// KPI 신호
export type SignalType = '긴축' | '완화' | '중립' | '확장' | '축소' | '유지' | '강세' | '약세' | 'Risk-On' | 'Risk-Off';

export interface ScenarioKPIData {
  policyStance: '긴축' | '완화' | '중립';
  liquidityTrend: '확장' | '축소' | '유지';
  dollarStrength: '강세' | '약세' | '중립';
  riskAppetite: 'Risk-On' | 'Risk-Off' | '중립';
  yieldCurve: '정상' | '역전' | '평탄';
  inversionDays?: number; // 역전 지속 일수
}

// 단계별 설정
export interface StepConfig {
  title: string;
  color: string;
  bgColor: string;
  description: string;
  indicators: IndicatorId[];
}

// 지표 메타데이터 상수
export const SCENARIO_INDICATORS: Record<IndicatorId, ScenarioIndicator> = {
  // STEP 1: 통화정책 & 금리
  fed_rate: {
    id: 'fed_rate',
    step: 'policy',
    name: '미국 기준금리',
    shortName: 'Fed Rate',
    unit: '%',
    source: 'FRED',
    seriesId: 'FEDFUNDS',
    format: 'percent',
    decimals: 2,
  },
  bok_rate: {
    id: 'bok_rate',
    step: 'policy',
    name: '한국 기준금리',
    shortName: 'BOK Rate',
    unit: '%',
    source: 'EXISTING', // monetary_indicators 테이블
    format: 'percent',
    decimals: 2,
  },
  us_10y: {
    id: 'us_10y',
    step: 'policy',
    name: '미국 10Y 국채',
    shortName: 'US 10Y',
    unit: '%',
    source: 'FRED',
    seriesId: 'DGS10',
    format: 'percent',
    decimals: 2,
  },
  spread_2y10y: {
    id: 'spread_2y10y',
    step: 'policy',
    name: '2Y-10Y 스프레드',
    shortName: '2Y-10Y',
    unit: '%',
    source: 'FRED',
    seriesId: 'T10Y2Y',
    format: 'percent',
    decimals: 2,
    invertColor: true, // 음수(역전)일 때 경고
  },

  // STEP 2: 유동성
  us_m2: {
    id: 'us_m2',
    step: 'liquidity',
    name: '미국 M2',
    shortName: 'US M2',
    unit: 'T',
    source: 'FRED',
    seriesId: 'M2SL',
    format: 'trillion',
    decimals: 1,
  },
  kr_m2: {
    id: 'kr_m2',
    step: 'liquidity',
    name: '한국 M2',
    shortName: 'KR M2',
    unit: '조원',
    source: 'ECOS',
    format: 'trillion',
    decimals: 0,
  },
  fed_assets: {
    id: 'fed_assets',
    step: 'liquidity',
    name: '연준 자산총액',
    shortName: 'Fed BS',
    unit: 'T',
    source: 'FRED',
    seriesId: 'WALCL',
    format: 'trillion',
    decimals: 1,
  },
  bok_assets: {
    id: 'bok_assets',
    step: 'liquidity',
    name: '한은 자산총액',
    shortName: 'BOK BS',
    unit: '조원',
    source: 'ECOS',
    format: 'trillion',
    decimals: 0,
  },

  // STEP 3: 환율 & 달러
  usd_krw: {
    id: 'usd_krw',
    step: 'currency',
    name: 'USD/KRW',
    shortName: 'USD/KRW',
    unit: '원',
    source: 'EXISTING', // exchange_rates 테이블
    format: 'number',
    decimals: 0,
    invertColor: true, // 높을수록 원화 약세
  },
  dxy: {
    id: 'dxy',
    step: 'currency',
    name: '달러 인덱스',
    shortName: 'DXY',
    unit: '',
    source: 'YAHOO',
    yahooSymbol: 'DX-Y.NYB',
    format: 'number',
    decimals: 2,
  },
  usd_cny: {
    id: 'usd_cny',
    step: 'currency',
    name: 'USD/CNY',
    shortName: 'USD/CNY',
    unit: '',
    source: 'FRED',
    seriesId: 'DEXCHUS',
    format: 'number',
    decimals: 4,
  },

  // STEP 4: 자산시장
  sp500: {
    id: 'sp500',
    step: 'assets',
    name: 'S&P 500',
    shortName: 'S&P500',
    unit: '',
    source: 'YAHOO',
    yahooSymbol: '^GSPC',
    format: 'number',
    decimals: 0,
  },
  nasdaq: {
    id: 'nasdaq',
    step: 'assets',
    name: 'NASDAQ',
    shortName: 'NASDAQ',
    unit: '',
    source: 'YAHOO',
    yahooSymbol: '^IXIC',
    format: 'number',
    decimals: 0,
  },
  kospi: {
    id: 'kospi',
    step: 'assets',
    name: 'KOSPI',
    shortName: 'KOSPI',
    unit: '',
    source: 'YAHOO',
    yahooSymbol: '^KS11',
    format: 'number',
    decimals: 0,
  },
  gold: {
    id: 'gold',
    step: 'assets',
    name: '금',
    shortName: 'Gold',
    unit: '$',
    source: 'YAHOO',
    yahooSymbol: 'GC=F',
    format: 'currency',
    decimals: 0,
  },
  btc: {
    id: 'btc',
    step: 'assets',
    name: '비트코인',
    shortName: 'BTC',
    unit: '$',
    source: 'YAHOO',
    yahooSymbol: 'BTC-USD',
    format: 'currency',
    decimals: 0,
  },
};

// 단계별 설정
export const STEP_CONFIG: Record<ScenarioStep, StepConfig> = {
  policy: {
    title: 'STEP 1: 통화정책 & 금리',
    color: '#3B82F6', // Blue
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    description: '글로벌 자산의 기준 중력',
    indicators: ['fed_rate', 'bok_rate', 'us_10y', 'spread_2y10y'],
  },
  liquidity: {
    title: 'STEP 2: 유동성',
    color: '#8B5CF6', // Purple
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    description: '돈이 늘었는가, 줄었는가',
    indicators: ['us_m2', 'kr_m2', 'fed_assets', 'bok_assets'],
  },
  currency: {
    title: 'STEP 3: 환율 & 달러',
    color: '#F59E0B', // Amber
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    description: '국가 간 부의 이동',
    indicators: ['usd_krw', 'dxy', 'usd_cny'],
  },
  assets: {
    title: 'STEP 4: 자산시장 반응',
    color: '#10B981', // Emerald
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    description: '최종 결과',
    indicators: ['sp500', 'nasdaq', 'kospi', 'gold', 'btc'],
  },
};

// 단계 순서
export const STEP_ORDER: ScenarioStep[] = ['policy', 'liquidity', 'currency', 'assets'];

// 유틸리티: 지표별 값 포맷팅
export function formatIndicatorValue(value: number, indicator: ScenarioIndicator): string {
  const { format, decimals, unit } = indicator;

  switch (format) {
    case 'percent':
      return `${value >= 0 ? '' : ''}${value.toFixed(decimals)}%`;
    case 'currency':
      return `${unit}${value.toLocaleString('en-US', { maximumFractionDigits: decimals })}`;
    case 'trillion':
      if (unit === 'T') {
        // 미국 달러 Trillion
        const inTrillions = value / 1000; // 단위가 Billion일 경우
        return `$${inTrillions.toFixed(decimals)}T`;
      }
      return `${value.toLocaleString('ko-KR', { maximumFractionDigits: decimals })}${unit}`;
    default:
      return `${value.toLocaleString('ko-KR', { maximumFractionDigits: decimals })}${unit ? ` ${unit}` : ''}`;
  }
}

// 유틸리티: 변동률 포맷팅
export function formatChange(change: number, decimals = 2): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(decimals)}%`;
}

// 유틸리티: 변동 색상
export function getChangeColor(change: number, invertColor = false): string {
  const isPositive = invertColor ? change < 0 : change > 0;
  const isNegative = invertColor ? change > 0 : change < 0;

  if (isPositive) return 'text-green-600 dark:text-green-400';
  if (isNegative) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}
