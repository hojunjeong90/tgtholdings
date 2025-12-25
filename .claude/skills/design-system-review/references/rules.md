# 디자인 시스템 상세 규칙

## 1. 신규 UI 컴포넌트 규칙

### shadcn/ui 우선 원칙

새 버튼/모달/드롭다운/탭/토스트/폼 등은 shadcn 컴포넌트를 우선 추가:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### 확장 컴포넌트 생성

shadcn에 없는 패턴은 shadcn 스타일을 따라 확장:

```tsx
// components/ui/stat-card.tsx
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const statCardVariants = cva(
  "rounded-lg border p-4",
  {
    variants: {
      trend: {
        up: "border-green-200 bg-green-50",
        down: "border-red-200 bg-red-50",
        neutral: "border-border bg-card",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
)

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  change?: string
}

export function StatCard({ title, value, change, trend }: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ trend }))}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {change && <p className="text-xs">{change}</p>}
    </div>
  )
}
```

### Radix 직접 사용 시

반드시 래핑해서 `components/ui/`에 추가:

```tsx
// ❌ Bad - 페이지에서 직접 사용
import * as Popover from "@radix-ui/react-popover"

// ✅ Good - 래핑 후 재사용
// components/ui/popover.tsx
import * as PopoverPrimitive from "@radix-ui/react-popover"

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverContent = React.forwardRef<...>(...)
```

## 2. 하드코딩 금지 규칙

### 컴포넌트화 기준

동일/유사 UI가 2번 이상 등장 가능 → 즉시 컴포넌트화:

```tsx
// ❌ Bad - 페이지에 반복
<div className="flex items-center gap-2 rounded-lg border p-4">
  <Icon />
  <span>{text}</span>
</div>

// ✅ Good - 컴포넌트로 추출
// components/shared/icon-label.tsx
export function IconLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-4">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  )
}
```

### 페이지 역할

페이지 파일은 **레이아웃/조합만** 담당:

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <PageLayout>
      <PageHeader title="대시보드" />
      <StatsGrid>
        <StatCard title="매출" value="₩1,234,567" />
        <StatCard title="주문" value="123" />
      </StatsGrid>
      <RecentOrdersTable />
    </PageLayout>
  )
}
```

## 3. Variant 확장 가이드

### 기본 variant 구조

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### 상태 표현

각 컴포넌트가 자체적으로 상태 표현:

```tsx
interface ButtonProps {
  isLoading?: boolean
  disabled?: boolean
}

export function Button({ isLoading, disabled, children, ...props }: ButtonProps) {
  return (
    <button disabled={disabled || isLoading} {...props}>
      {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
      {children}
    </button>
  )
}
```

## 4. 토큰 시스템

### 색상 토큰

| 용도 | 토큰 |
|------|------|
| 배경 | `bg-background`, `bg-card`, `bg-muted` |
| 텍스트 | `text-foreground`, `text-muted-foreground` |
| 테두리 | `border-border`, `border-input` |
| 강조 | `bg-primary`, `text-primary` |
| 위험 | `bg-destructive`, `text-destructive` |
| 성공 | `text-green-600` (또는 커스텀 토큰) |

### 간격 스케일

```
space-1: 0.25rem (4px)
space-2: 0.5rem (8px)
space-3: 0.75rem (12px)
space-4: 1rem (16px)
space-6: 1.5rem (24px)
space-8: 2rem (32px)
```

### 라운드 스케일

```
rounded-sm: 0.125rem
rounded-md: 0.375rem
rounded-lg: 0.5rem
rounded-xl: 0.75rem
rounded-2xl: 1rem
rounded-full: 9999px
```

## 5. 접근성/상호작용 규칙

### 포커스/키보드 컴포넌트

Dialog, Popover, Dropdown, Tooltip → Radix 기반만 사용:

```tsx
// ✅ Good
import { Dialog } from "@/components/ui/dialog"
import { DropdownMenu } from "@/components/ui/dropdown-menu"

// ❌ Bad - 직접 구현
<div onClick={() => setOpen(!open)}>...</div>
```

### 클릭 영역

최소 크기 + hover/focus 스타일 유지:

```tsx
// ✅ Good
<button className="min-h-[44px] min-w-[44px] hover:bg-accent focus:ring-2">
  ...
</button>
```

### 로딩 상태 통일

```tsx
// components/ui/skeleton.tsx - 사용
<Skeleton className="h-4 w-[200px]" />

// components/ui/spinner.tsx - 사용
<Spinner size="sm" />
```

## 6. "use client" 최소화

### 규칙

- 서버 컴포넌트가 기본
- 상호작용 필요한 부분만 클라이언트 컴포넌트로 분리

```tsx
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await fetchData()

  return (
    <div>
      <h1>대시보드</h1>
      <StaticContent data={data} />
      <InteractiveChart data={data} /> {/* Client Component */}
    </div>
  )
}

// components/interactive-chart.tsx
"use client"
export function InteractiveChart({ data }) {
  const [filter, setFilter] = useState(...)
  return <Chart ... />
}
```

## 7. 예외 허용 조건

다음 중 하나면 하드코딩 허용 (주석 필수):

1. **성능/렌더링 최적화** - 추상화가 오히려 비용
2. **실험/일회성 이벤트 페이지** - 기한 명시
3. **외부 위젯/SDK 강제 마크업**

```tsx
{/* 예외: Stripe Elements SDK 요구사항 */}
<div id="card-element" style={{ padding: "12px" }} />
```
