/**
 * 통화 지표 관련 TypeScript 타입 정의
 */

// 국가 코드
export type CountryCode = 'US' | 'KR' | 'JP';

// 지표 유형
export type IndicatorType =
  | 'velocity'      // 통화유동속도
  | 'multiplier'    // 통화승수
  | 'interest_rate' // 기준금리
  | 'm2'            // M2 통화량
  | 'm2_growth'     // M2 증가율 (전년동기대비 %)
  | 'monetary_base' // 본원통화
  | 'gdp';          // GDP

// 데이터 소스
export type DataSource = 'FRED' | 'ECOS';

// 데이터 주기
export type Frequency = 'quarterly' | 'monthly' | 'daily';

// DB 테이블 레코드
export interface MonetaryIndicator {
  id: string;
  country_code: CountryCode;
  indicator_type: IndicatorType;
  date: string;
  value: number;
  source: DataSource;
  series_id: string | null;
  frequency: Frequency;
  created_at: string;
  updated_at: string;
}

// 차트용 데이터 포인트
export interface ChartDataPoint {
  date: string;
  US?: number;
  KR?: number;
  JP?: number;
}

// FRED 시리즈 매핑
export const FRED_SERIES: Record<CountryCode, Partial<Record<IndicatorType, string>>> = {
  US: {
    velocity: 'M2V',           // 통화유동속도 (분기)
    interest_rate: 'FEDFUNDS', // 연방기금금리 (월간)
    m2: 'M2SL',               // M2 통화량 (월간)
    monetary_base: 'BOGMBASE', // 본원통화 (월간)
  },
  KR: {
    interest_rate: 'IRSTCI01KRM156N', // 한국 단기금리 (월간)
    m2: 'MYAGM2KRM189N',              // 한국 M2 (월간)
  },
  JP: {
    interest_rate: 'IRSTCI01JPM156N', // 일본 단기금리 (월간)
    m2: 'MYAGM2JPM189N',              // 일본 M2 (월간)
  },
};

// 국가 정보
export const COUNTRY_INFO: Record<CountryCode, { name: string; flag: string; color: string }> = {
  US: { name: '미국', flag: '🇺🇸', color: '#3B82F6' },
  KR: { name: '한국', flag: '🇰🇷', color: '#EF4444' },
  JP: { name: '일본', flag: '🇯🇵', color: '#10B981' },
};

// 지표 정보
export const INDICATOR_INFO: Record<IndicatorType, { name: string; unit: string; description: string }> = {
  velocity: {
    name: '통화유동속도',
    unit: '배',
    description: '통화가 일정 기간 동안 거래에 사용된 평균 횟수 (GDP/M2)',
  },
  multiplier: {
    name: '통화승수',
    unit: '배',
    description: '본원통화 1단위가 창출하는 총 통화량 (M2/본원통화)',
  },
  interest_rate: {
    name: '금리',
    unit: '%',
    description: '각국 중앙은행 기준금리',
  },
  m2: {
    name: 'M2 통화량',
    unit: '',
    description: '광의통화 (현금 + 요구불예금 + 저축성예금)',
  },
  m2_growth: {
    name: '통화증가율',
    unit: '%',
    description: 'M2 통화량의 전년동기대비 증가율 - 중앙은행이 얼마나 돈을 찍어내고 있는지 보여줍니다',
  },
  monetary_base: {
    name: '본원통화',
    unit: '',
    description: '중앙은행이 발행한 화폐 (현금 + 지급준비금)',
  },
  gdp: {
    name: 'GDP',
    unit: '',
    description: '국내총생산',
  },
};
