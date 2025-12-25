---
name: design-system-review
description: |
  디자인 시스템 준수 여부를 검토하고 가이드라인을 제공하는 스킬.

  다음 상황에서 사용:
  - 새로운 UI 컴포넌트 개발 전 검토
  - 클라이언트 사이드 코드 리팩터링
  - UI/디자인 관련 PR 리뷰
  - 페이지나 컴포넌트의 디자인 시스템 준수 확인
  - "디자인 시스템 검토해줘", "UI 코드 리뷰해줘" 요청 시
---

# Design System Review

## 검토 워크플로우

### 1. 컴포넌트 검색 우선

새 UI 작업 시작 전:

```bash
# components/ui 확인 (shadcn)
ls components/ui/

# 기존 shared 컴포넌트 확인
ls components/shared/

# 특정 패턴 검색
grep -r "Button\|Card\|Dialog" components/
```

### 2. 검토 체크리스트

| 항목 | 확인 |
|------|------|
| `components/`에서 검색 후 재사용/확장했는가? | |
| 2번 이상 쓰일 UI를 페이지에 하드코딩하지 않았는가? | |
| 색/폰트/간격이 토큰/스케일을 따르는가? | |
| variant/props로 확장했는가 (복붙 금지)? | |
| `"use client"` 범위를 최소화했는가? | |

### 3. 컴포넌트 위치 규칙

```
components/
├── ui/           # shadcn 기반 순수 UI (Button, Dialog, Input)
├── shared/       # 앱 공통 조합 (EmptyState, PageHeader, StatCard)
├── layout/       # 레이아웃 전용 (Sidebar, Topbar, Section)
└── <domain>/     # 도메인 결합 컴포넌트
```

### 4. 토큰 사용 규칙

**색상** - 하드코딩 금지:
```tsx
// ❌ Bad
className="bg-[#1a1a1a] text-[#ffffff]"

// ✅ Good
className="bg-background text-foreground"
className="bg-muted text-muted-foreground"
className="border-border"
```

**간격/라운드** - 스케일만 사용:
```tsx
// ❌ Bad
className="p-[13px] rounded-[7px]"

// ✅ Good
className="p-4 rounded-lg"
className="space-y-2 gap-4"
```

### 5. Variant 기반 설계

```tsx
// ✅ Good - variant로 확장
<Button variant="destructive" size="sm" />
<Badge variant="secondary" />

// ❌ Bad - 인라인 스타일 오버라이드
<Button className="bg-red-500 text-xs" />
```

**통일된 variant 네이밍**:
- `size`: sm | md | lg
- `variant`: default | secondary | destructive | ghost | outline

### 6. 하드코딩 허용 예외

주석 필수 조건:
```tsx
{/* 예외: 차트 캔버스 - 추상화 비용 > 이득 */}
<canvas style={{ width: 400 }} />

{/* 예외: 2025-01-31 이벤트 페이지 - 기한 후 삭제 */}
<div className="bg-[#ff0000]" />
```

## 검토 결과 형식

```markdown
## 디자인 시스템 검토 결과

### 준수 항목 ✅
- ...

### 개선 필요 ⚠️
- [ ] 파일:라인 - 문제 설명 → 권장 해결책

### 위반 사항 ❌
- [ ] 파일:라인 - 위반 내용 → 필수 수정 사항
```

## 상세 규칙

자세한 내용은 [references/rules.md](references/rules.md) 참조.
