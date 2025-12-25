---
name: supabase-cron-manager
description: |
  Supabase cron_job(스케쥴러) 관리 스킬. MCP 또는 CLI를 통해 cron job을 관리하려 할 때 사용.
  (1) 스케쥴러 생성/수정 요청 시
  (2) 스케쥴러 목록 조회 시
  (3) 스케쥴러 삭제 시
  (4) 정기 작업 자동화 설정 시
  (5) "매일", "매시간", "주기적으로" 등 반복 작업 요청 시
---

# Supabase Cron Manager

## Naming Convention

모든 cron job 이름은 `{도메인}_{기능}` 포맷을 따른다.

| 구성 요소 | 설명 | 예시 |
|-----------|------|------|
| 도메인 | 스케쥴러가 처리하는 대상 영역 | `users`, `orders`, `reports`, `cleanup` |
| 기능 | 스케쥴러가 수행하는 작업 | `daily_sync`, `hourly_check`, `weekly_report` |

예시:
- `users_daily_cleanup` - 매일 비활성 사용자 정리
- `orders_hourly_sync` - 매시간 주문 동기화
- `reports_weekly_generate` - 주간 리포트 생성

## Workflow

### Cron Job 생성 전 (필수)

1. **기존 cron job 조회**
```sql
SELECT jobid, jobname, schedule, command
FROM cron.job
ORDER BY jobname;
```

2. **중복 검사**
   - 동일/유사한 기능을 수행하는 job이 있는지 확인
   - 비슷한 스케쥴러가 있다면 사용자에게 알림:
     - 기존 job 업데이트 (`cron.alter_job`)
     - 기존 job 삭제 후 새로 생성
     - 스케쥴 시간만 변경

3. **이름 검증**
   - `{도메인}_{기능}` 포맷인지 확인
   - 기존 job과 이름 충돌 여부 확인

### Cron Job 생성

```sql
SELECT cron.schedule(
  '{도메인}_{기능}',           -- job 이름
  '{cron_expression}',         -- 스케쥴 (예: '0 * * * *')
  $$
    -- 실행할 SQL
  $$
);
```

**Cron Expression 예시:**
| 표현식 | 의미 |
|--------|------|
| `* * * * *` | 매분 |
| `0 * * * *` | 매시간 정각 |
| `0 0 * * *` | 매일 자정 |
| `0 0 * * 0` | 매주 일요일 자정 |
| `0 0 1 * *` | 매월 1일 자정 |

### Cron Job 수정

```sql
-- 스케쥴 변경
SELECT cron.alter_job(
  job_id := {jobid},
  schedule := '{new_cron_expression}'
);

-- 명령어 변경
SELECT cron.alter_job(
  job_id := {jobid},
  command := $$ {new_sql} $$
);
```

### Cron Job 삭제

```sql
SELECT cron.unschedule('{job_name}');
-- 또는
SELECT cron.unschedule({jobid});
```

### 실행 이력 조회

```sql
SELECT jobid, runid, job_pid, status, start_time, end_time
FROM cron.job_run_details
WHERE jobid = {jobid}
ORDER BY start_time DESC
LIMIT 10;
```

## Checklist

Cron job 작업 시 항상 확인:

- [ ] 이름이 `{도메인}_{기능}` 포맷인가?
- [ ] 기존 cron job 목록을 조회했는가?
- [ ] 중복/유사 job이 있다면 사용자에게 보고했는가?
- [ ] 중복 시 업데이트/삭제/시간변경 중 하나를 선택했는가?
- [ ] pg_cron 확장이 활성화되어 있는가?
