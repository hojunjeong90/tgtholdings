---
name: supabase-trigger-manager
description: |
  Supabase 트리거 관리 스킬. MCP 또는 CLI를 통해 Supabase 트리거를 생성, 수정, 삭제(CRUD)하려 할 때 사용.
  (1) 트리거 생성/수정 요청 시
  (2) 트리거 목록 조회 시
  (3) 트리거 삭제 시
  (4) 데이터베이스 이벤트 자동화 설정 시
---

# Supabase Trigger Manager

## Naming Convention

모든 트리거 이름은 `{도메인}_{기능}` 포맷을 따른다.

| 구성 요소 | 설명 | 예시 |
|-----------|------|------|
| 도메인 | 트리거가 속한 테이블/기능 영역 | `users`, `orders`, `payments` |
| 기능 | 트리거가 수행하는 작업 | `audit_log`, `update_timestamp`, `notify_slack` |

예시:
- `users_audit_log` - users 테이블 변경 감사 로그
- `orders_update_total` - orders 테이블 총액 자동 계산
- `payments_notify_webhook` - 결제 시 웹훅 호출

## Workflow

### 트리거 생성 전 (필수)

1. **기존 트리거 조회**
```sql
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

2. **중복 검사**
   - 동일 테이블에 같은 이벤트(INSERT/UPDATE/DELETE)를 처리하는 트리거가 있는지 확인
   - 비슷한 기능을 수행하는 트리거가 있다면 사용자에게 알림:
     - 기존 트리거 업데이트
     - 기존 트리거 삭제 후 새로 생성
     - 병합하여 하나의 트리거로 통합

3. **이름 검증**
   - `{도메인}_{기능}` 포맷인지 확인
   - 기존 트리거와 이름 충돌 여부 확인

### 트리거 생성

```sql
-- 함수 생성
CREATE OR REPLACE FUNCTION {도메인}_{기능}_fn()
RETURNS TRIGGER AS $$
BEGIN
  -- 트리거 로직
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER {도메인}_{기능}
  AFTER INSERT OR UPDATE ON {테이블}
  FOR EACH ROW
  EXECUTE FUNCTION {도메인}_{기능}_fn();
```

### 트리거 수정

기존 트리거 수정 시 함수만 업데이트:
```sql
CREATE OR REPLACE FUNCTION {기존_함수명}()
RETURNS TRIGGER AS $$
BEGIN
  -- 수정된 로직
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 트리거 삭제

```sql
DROP TRIGGER IF EXISTS {트리거명} ON {테이블};
DROP FUNCTION IF EXISTS {함수명}();
```

## Checklist

트리거 작업 시 항상 확인:

- [ ] 이름이 `{도메인}_{기능}` 포맷인가?
- [ ] 기존 트리거 목록을 조회했는가?
- [ ] 중복/유사 트리거가 있다면 사용자에게 보고했는가?
- [ ] 중복 시 업데이트/삭제/병합 중 하나를 선택했는가?
