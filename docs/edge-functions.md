# Edge Functions 사용 가이드

## 개요

이 프로젝트에서 사용하는 Supabase Edge Functions 목록과 사용 방법입니다.

---

## fetch-stock-prices

주식 주봉(Weekly) 데이터를 Yahoo Finance에서 수집하여 데이터베이스에 저장하고 반환합니다.

### 엔드포인트

```
POST https://rxbyjgwsglafuwaxfoda.supabase.co/functions/v1/fetch-stock-prices
```

### 요청 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| ticker | string | O | 티커 심볼 (예: AAPL, 005930.KS) |
| start_date | string | O | 시작일 (YYYY-MM-DD) |
| end_date | string | O | 종료일 (YYYY-MM-DD) |

### 동작 방식

1. DB에서 해당 티커의 최신 데이터 날짜를 확인
2. 최신 데이터가 `end_date`보다 이전이면 Yahoo Finance에서 새 데이터 수집
3. 수집한 데이터를 DB에 upsert (중복 시 업데이트)
4. 요청한 기간의 전체 데이터를 반환

### 사용 예시

#### cURL

```bash
curl -X POST \
  "https://rxbyjgwsglafuwaxfoda.supabase.co/functions/v1/fetch-stock-prices" \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'
```

#### JavaScript/TypeScript

```typescript
const response = await fetch(
  'https://rxbyjgwsglafuwaxfoda.supabase.co/functions/v1/fetch-stock-prices',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      ticker: 'AAPL',
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    })
  }
);

const result = await response.json();
console.log(result.data);
```

### 응답 형식

#### 성공 응답

```json
{
  "success": true,
  "fetched_new": true,
  "fetched_count": 52,
  "data": [
    {
      "id": "uuid",
      "ticker": "AAPL",
      "date": "2024-01-01",
      "open": 185.50,
      "high": 188.25,
      "low": 183.10,
      "close": 187.00,
      "volume": 45000000,
      "adjusted_close": 186.50,
      "source": "YAHOO",
      "created_at": "2024-12-26T00:00:00Z",
      "updated_at": "2024-12-26T00:00:00Z"
    }
  ]
}
```

#### 에러 응답

```json
{
  "success": false,
  "error": "Yahoo Finance API error: Invalid ticker"
}
```

### 티커 형식

| 시장 | 형식 | 예시 |
|------|------|------|
| 미국 | SYMBOL | AAPL, MSFT, GOOGL, NVDA |
| 한국 | 종목코드.KS | 005930.KS (삼성전자), 000660.KS (SK하이닉스) |
| 일본 | 종목코드.T | 7203.T (토요타), 6758.T (소니) |
| 홍콩 | 종목코드.HK | 0700.HK (텐센트) |
| ETF | SYMBOL | SPY, QQQ, VOO, VTI |

### 데이터베이스 테이블

데이터는 `stock_prices_weekly` 테이블에 저장됩니다.

```sql
CREATE TABLE stock_prices_weekly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  date date NOT NULL,
  open numeric,
  high numeric,
  low numeric,
  close numeric NOT NULL,
  volume bigint,
  adjusted_close numeric,
  source text DEFAULT 'YAHOO',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ticker, date)
);
```

### 주의사항

- Yahoo Finance API는 비공식 API이므로 과도한 요청은 자제해주세요
- 주봉 데이터만 지원합니다 (일봉, 월봉은 지원하지 않음)
- 요청 시간대에 따라 당일 데이터가 포함되지 않을 수 있습니다
- 한국 주식은 `.KS` 접미사를 반드시 붙여야 합니다

---

## fetch-wealth-scenario

부의 시나리오 대시보드용 경제 지표 데이터를 수집합니다.

### 엔드포인트

```
POST https://rxbyjgwsglafuwaxfoda.supabase.co/functions/v1/fetch-wealth-scenario
```

### 요청 파라미터

없음 (POST body 비워서 호출)

### 응답 형식

```json
{
  "success": true,
  "data": {
    "fed_rate": [...],
    "m2_money_supply": [...],
    "dxy": [...],
    // ... 기타 지표
  },
  "lastUpdated": "2024-12-26T00:00:00Z"
}
```

---

## 공통 사항

### 인증

모든 Edge Function 호출 시 Authorization 헤더에 Supabase anon key를 포함해야 합니다:

```
Authorization: Bearer <anon-key>
```

### CORS

CORS가 활성화되어 있어 브라우저에서 직접 호출 가능합니다.

### 환경 변수

프론트엔드에서 호출 시 필요한 환경 변수:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rxbyjgwsglafuwaxfoda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
