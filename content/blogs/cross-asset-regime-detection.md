---
title: "Six Signals Across Four Assets"
date: "2026-03-16"
category: "Risk"
summary: "Replacing a 13-signal single-asset regime with 6 cross-asset indicators improves MDD from -21.9% to -20.0% while raising Sharpe from 1.04 to 1.16."
slug: "cross-asset-regime-detection"
---

## The Problem With Single-Asset Regime Detection

A regime detector built entirely on the equity it is protecting has a structural weakness: it cannot see stress arriving from adjacent markets before it reaches the equity itself. By the time SPY's own momentum, volatility, and breadth signals converge on a risk-off reading, the drawdown is already underway. The detector is confirming a move it was supposed to prevent.

The V2 regime framework used 13 signals — all drawn from SPY's own price history. In a full-sample backtest against our Core strategy universe, that approach produced a Sharpe ratio of 1.04, a CAGR of 23.5%, and a maximum drawdown of -21.9%. The MDD target was -20.0%. Thirteen signals were not enough because all thirteen were looking at the same thing.

## Cross-Asset Signals as Early Warning

Risk regime shifts typically propagate through asset classes before they concentrate in equities. Flight-to-safety flows rotate into long-duration Treasuries. Technology sector relative weakness often precedes broad index drawdowns. Realized volatility in options markets prices in stress before it appears in daily returns. These cross-market transmissions carry information that single-asset signals structurally cannot.

The replacement architecture uses six indicators drawn from SPY, TLT, QQQ, and their derived ratios:

The first indicator measures the TLT/SPY price ratio against its 50-day moving average. When that ratio exceeds its MA50 by more than 2%, it registers as bond strength — capital rotating out of equities into duration. The second measures the QQQ/SPY relative strength over a 50-day window; a decline exceeding 3% signals technology sector deterioration relative to the broad index. The third is the 21-day realized volatility of SPY, evaluated against its own 252-day distribution; readings above the 80th percentile constitute a high-volatility regime trigger. The fourth is a simple SPY drawdown threshold: below -10% from the trailing peak. The fifth compares SPY to its 200-day moving average — a bear trend confirmation. The sixth measures the 50-day change in the SPY/MA200 ratio; a decline exceeding 5% captures trend deterioration even when SPY remains above MA200.

Each indicator is binary. The composite risk score $r$ is:

$$r = \frac{1}{6} \sum_{i=1}^{6} \mathbf{1}[\text{indicator}_i \text{ triggered}]$$

The cash fraction allocated on any given day is then:

$$\text{cash\_frac} = r \times \text{max\_cash}$$

With $\text{max\_cash} = 0.60$, the system moves from fully invested to 60% cash as all six indicators trigger simultaneously. The transition is continuous rather than discrete — no cliff edge between "normal" and "risk-off." The risk score carries a 3-day moving average to suppress single-day noise.

## Walk-Forward Validation

In-sample improvement is necessary but not sufficient. The six thresholds — 1.02, -3%, 80th percentile, -10%, 0%, -5% — were set by research and could be fit to the historical period. Walk-forward out-of-sample validation addresses this directly.

The validation uses a 5-fold rolling design: 4-year training windows followed by 1-year out-of-sample test periods. S1 is compared to S0 on both Sharpe and MDD in each fold.

The fold-by-fold results:

| Fold | OOS Period | S0 Sharpe | S1 Sharpe | S0 MDD | S1 MDD |
|:----:|-----------|----------:|----------:|-------:|-------:|
| 1 | 2021-02 – 2022-01 | 0.76 | 0.73 | -19.4% | -20.1% |
| 2 | 2022-02 – 2023-01 | -0.35 | -0.03 | -19.0% | -18.6% |
| 3 | 2023-02 – 2024-01 | 1.68 | 1.78 | -14.9% | -14.5% |
| 4 | 2024-02 – 2025-01 | 1.45 | 1.52 | -9.6% | -9.2% |
| 5 | 2025-02 – 2026-03 | 1.13 | 1.23 | -17.1% | -16.2% |

S1 outperforms S0 on Sharpe in 4 of 5 folds and on MDD in 4 of 5 folds. The only exception is fold 1 (calendar year 2021), where S1 Sharpe lags by 0.03 and MDD is marginally worse by 0.7 percentage points — a period characterized by low volatility and sustained equity momentum, precisely the environment where cash drag penalizes the strategy.

Fold 2 carries the most diagnostic weight. The 2022 period represents the fastest and most sustained rate-hiking cycle in four decades. S0 posted a Sharpe of -0.35; S1 posted -0.03. The cross-asset indicators — particularly the bond/equity ratio, realized vol percentile, and SPY/MA200 relationship — all triggered concurrently as inflation data forced Federal Reserve acceleration. The system held elevated cash through the worst months.

## The Full-Sample Result

Against the Core strategy universe over the 2016–2026 period, S1 (cross-asset regime, $\text{max\_cash} = 0.60$) produces a Sharpe of 1.16, CAGR of 26.2%, and MDD of -20.0%. The baseline S0 produces Sharpe 1.04, CAGR 23.5%, MDD -21.9%.

The MDD target of -20.0% is met exactly. The Calmar ratio improves from 1.08 to 1.31. The improvement is not achieved by sacrificing return — CAGR increases by 2.7 percentage points alongside the drawdown reduction.

The year 2022 exemplifies what cross-asset regime detection provides that single-asset detection cannot: the TLT/SPY ratio began signaling bond strength in January of that year, before SPY had made a meaningful directional move. The QQQ/SPY relative weakness confirmed in February. By March, realized vol had crossed the 80th percentile threshold. All six indicators triggered sequentially as the regime developed, not simultaneously after the damage was done.

## The Opportunity Cost Problem

No protection mechanism is free. In fold 1 (2021), S1 underperforms by 0.03 Sharpe and 1.3 CAGR percentage points. The environment that year — low cross-asset stress, consistent equity appreciation, no regime triggers beyond brief episodes — generated unnecessary cash drag. This is the permanent trade-off: cash earns nothing when the equity it displaced continues to appreciate.

At $\text{max\_cash} = 0.50$, the regime produces a Sharpe of 0.99 and MDD of -21.7% — worse than S0 on Sharpe and barely better on MDD. The $\text{max\_cash} = 0.40$ scenario deteriorates further. The protection mechanism only pays for itself at sufficient cash ceiling. Below 50%, the regime generates friction without meaningful downside absorption.

The functional relationship between max_cash and the protection/opportunity cost trade-off is not linear. At 60%, six triggered indicators produce a 60% cash allocation that compresses drawdowns in sustained bear markets. At 40%, even full activation leaves the portfolio 60% exposed. The threshold at which protection becomes material appears to be somewhere between 50% and 60% — though this boundary is empirically derived from a specific historical sample and deserves continued monitoring.

## What the System Cannot Do

The cross-asset risk score is contemporaneous, not predictive. The score rises sharply at drawdown entry, confirming that the system reacts quickly to developing stress rather than anticipating it.

This is not a flaw in the design. It is a precise characterization of what cross-asset information provides: rapid confirmation of regime shifts from multiple independent asset classes, rather than prediction from within any single one. The regime transitions faster than a single-asset detector but still after the stress has begun to materialize in market prices. The residual drawdown in any stress period is the cost of that latency.

The question that remains open is whether adding flow data — credit spreads, futures positioning, options-implied skew — could extend the lead time from contemporaneous detection toward genuine anticipation.
