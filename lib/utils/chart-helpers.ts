import type { IndicatorType, CountryCode } from '@/lib/types/monetary-indicators';

/**
 * 국가별 차트 색상
 */
export const COUNTRY_COLORS: Record<CountryCode, string> = {
  US: '#3B82F6', // blue-500
  KR: '#EF4444', // red-500
  JP: '#10B981', // emerald-500
};

/**
 * 국가명 (한글)
 */
export const COUNTRY_NAMES: Record<CountryCode, string> = {
  US: '미국',
  KR: '한국',
  JP: '일본',
};

/**
 * 지표 단위
 */
export const INDICATOR_UNITS: Record<IndicatorType, string> = {
  velocity: '배',
  multiplier: '배',
  interest_rate: '%',
  m2: '십억',
  m2_growth: '%',
  monetary_base: '십억',
  gdp: '십억',
};

/**
 * 날짜 포맷팅 (YYYY-MM-DD → YY.MM)
 */
export function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${year.slice(2)}.${month}`;
}

/**
 * 숫자 포맷팅
 */
export function formatValue(value: number, indicatorType: IndicatorType): string {
  if (indicatorType === 'interest_rate' || indicatorType === 'm2_growth') {
    return `${value.toFixed(2)}%`;
  }
  if (indicatorType === 'velocity' || indicatorType === 'multiplier') {
    return value.toFixed(2);
  }
  // m2, monetary_base, gdp - 큰 숫자
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * 지표별 Y축 도메인 설정
 */
export function getYAxisDomain(indicatorType: IndicatorType): [string | number, string | number] {
  switch (indicatorType) {
    case 'interest_rate':
      return [0, 'auto'];
    case 'm2_growth':
      return ['auto', 'auto']; // 음수도 가능
    case 'velocity':
    case 'multiplier':
      return ['auto', 'auto'];
    default:
      return ['auto', 'auto'];
  }
}
