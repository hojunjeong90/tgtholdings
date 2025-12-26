/**
 * 100대 통계지표 관련 TypeScript 타입 정의
 */

// DB 테이블 레코드
export interface KeyStatistic {
  id: string;
  class_name: string;      // 통계그룹명
  keystat_name: string;    // 통계명
  data_value: string | null;  // 값
  cycle: string;           // 시점 (202003 형식)
  unit_name: string | null;   // 단위
  created_at: string;
  updated_at: string;
}

// ECOS API 응답 아이템
export interface EcosKeyStatisticItem {
  CLASS_NAME: string;
  KEYSTAT_NAME: string;
  DATA_VALUE: string;
  CYCLE: string;
  UNIT_NAME: string;
}

// ECOS API 응답
export interface EcosKeyStatisticResponse {
  KeyStatisticList?: {
    row?: EcosKeyStatisticItem[];
  };
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

// 통계그룹 목록 (필터용)
export const STAT_CLASS_NAMES = [
  '국민소득·경기·기업경영',
  '물가',
  '고용·임금',
  '대외거래',
  '통화·금융',
  '금리',
  '증권·자금순환',
  '환율·외환보유액',
  '재정·조세',
  '국제비교',
] as const;

export type StatClassName = typeof STAT_CLASS_NAMES[number];
