---
title: "Volatility Targeting as the Primary Sharpe Lever"
date: "2026-03-18"
category: "Infrastructure"
summary: "A 40.7% CAGR at Sharpe 0.62 is not a success. Diagnosing why reveals that volatility targeting is the dominant mechanism for risk-adjusted improvement."
slug: "volatility-targeting-sharpe-lever"
---

## The CAGR-Sharpe Puzzle

Alpha Factory v3 produced a compounded annual growth rate of 40.7%. The Sharpe ratio was 0.62. These two numbers should not coexist in a well-functioning systematic strategy. A CAGR in that range with a Sharpe below 1.0 points to one thing: the return is real, but the ride is not survivable at institutional scale.

The arithmetic is direct. Under the approximation $\text{Sharpe} \approx \frac{\mathbb{E}[r]}{\sigma}$, the implied annualized volatility is

$$\sigma = \frac{0.407}{0.62} \approx 65.6\%$$

A 65% realized volatility is not a systematic strategy. It is a concentrated directional bet with a positive expected value. The distribution of outcomes at that vol level — across reasonable drawdown sequences — includes catastrophic interim losses that would trigger risk limits, margin calls, or investor redemptions long before the compounded return materializes. CAGR is a terminal statistic. Volatility is an ongoing one.

## Why the Vol Target Failed

The system included a volatility targeting mechanism. The nominal target was $\sigma^* = 12\%$. The scaling rule was

$$w_{\text{scale}} = \min\!\left(\frac{\sigma^*}{\hat{\sigma}}, 1.5\right)$$

where $\hat{\sigma}$ is the rolling realized volatility estimated over a 40-day lookback. Three structural failures caused the mechanism to be ineffective in practice.

The cap of 1.5x is too permissive. During low-volatility periods, the scaler maxes out and the system adds leverage up to 150% of the nominal position. In regimes where measured volatility is suppressed — which tend to precede volatility expansions — the model is most aggressively deployed at precisely the wrong moment. The cap converts the vol target from a risk limiter into a lever that amplifies regime transitions.

The 40-day lookback is too short. Volatility is persistent and mean-reverting at horizons longer than a month. A 40-day window tracks recent realized vol closely but lags at regime transitions by two to four weeks. The lag is asymmetric: volatility spikes faster than it decays. During a vol expansion, the 40-day estimate is systematically below the contemporaneous realized vol, so $w_{\text{scale}}$ remains above 1.0 as the drawdown accumulates.

The scaler is also the sole control mechanism. A single multiplicative scalar applied uniformly across all positions does not address cross-sectional heterogeneity in individual position volatilities. Two positions with the same signal strength but threefold difference in realized volatility receive the same proportional scaling — which means the high-vol position remains oversized relative to its risk contribution after scaling.

## The Dominance of Recalibration

Six improvement paths were evaluated against a common framework: Signal EMA smoothing (A), volatility targeting recalibration (B), alpha diversity (C), combination method (D), holding period adjustment (E), and universe filtering (F). Projected Sharpe contributions ranged from $-0.05$ to $+0.30$ across paths. Path B — recalibration of the vol targeting parameters — accounted for approximately 80% of the realized improvement.

The recalibrated configuration used three changes: target volatility maintained at $\sigma^* = 12\%$, lookback extended to 63 trading days, and the cap reduced from 1.5x to 1.2x. The lookback extension to 63 days aligns the estimation window with a standard quarterly horizon — long enough to smooth within-quarter noise while remaining responsive to persistent regime changes. The cap reduction from 1.5x to 1.2x eliminates the most aggressive leverage additions during low-vol periods without entirely removing the ability to scale up in calm markets.

The result was Sharpe 1.04, up from 0.62. CAGR fell from 40.7% to 23.5%. This outcome is not a failure of the optimization. It is the intended consequence of targeting a lower volatility regime. The return and the risk both declined; the ratio of return to risk improved by 68%. The 40.7% CAGR was not alpha. It was vol-amplified alpha. Stripping the amplification reveals the underlying signal quality.

## Disciplined Rejection: The EMA Smoothing Case

Path A — signal EMA smoothing — merits a separate discussion because it illustrates the decision process for rejecting an improvement that appears numerically plausible.

The proposed mechanism applied an exponential moving average to cross-sectional signal ranks before position entry, then re-ranked the smoothed values to restore a uniform ordinal distribution. The intention was to reduce signal churn driven by short-horizon rank volatility. In-sample, the procedure reduced turnover and produced modestly smoother equity curves.

Walk-forward validation invalidated this. Across five out-of-sample folds, the optimal EMA span was $[5, 30, 30, 21, 21]$. The instability of the optimal parameter across folds indicates that the span is fitting noise local to each period rather than a structural property of the signal. A parameter that must be re-estimated each period to perform well is not a parameter — it is an additional source of model risk.

The re-ranking step introduced a second problem. Smoothing and re-ranking are not commutative operations in the way this pipeline used them. Applying EMA to ranks and then re-ranking does not preserve the ordinal information that the original ranking was designed to capture. Signals that moved steadily in one direction were treated equivalently to signals that oscillated across the same range. The smoothing attenuated the information content of directional momentum precisely where the signal had the most predictive content.

The path received a CONDITIONAL_PASS designation in the internal evaluation — meaning it showed positive contribution in some configurations but failed robustness criteria. It was rejected in favor of the recalibrated vol targeting, where the mechanism is transparent, the parameter space is constrained, and the economic rationale is unambiguous.

## What the CAGR Obscured

The most important lesson from this analysis is not technical. It is about which performance statistics are selected for attention.

A 40.7% CAGR is a number that demands explanation. The instinct — and the common error — is to ask how to preserve it. The correct question is what it implies about the underlying vol regime. A Sharpe of 0.62 with CAGR above 40% implies not that the strategy is exceptional, but that it is running at approximately five times its target volatility. The vol target was a label, not a constraint.

Systematic strategies are not evaluated in isolation. They are evaluated against alternatives, against leverage, and against the probability of surviving a 20% drawdown at the wrong moment in the capital cycle. A Sharpe of 1.04 at CAGR 23.5% is a different asset than a Sharpe of 0.62 at CAGR 40.7%. The first can be leveraged toward a return target with controlled risk. The second cannot be delevered into safety — delevering a 65% vol strategy to 12% vol reduces the return to roughly 7.5%, and the surviving Sharpe does not improve because the denominator scales proportionally with the numerator under linear scaling.

The only path to a genuinely higher Sharpe is to reduce realized volatility at the portfolio level while preserving signal quality — which is precisely what the recalibration accomplished. The 17-point CAGR decline was the cost of removing noise that had been masquerading as return.

## The Lever, Not the Edge

Volatility targeting is frequently described as a risk management technique. That framing undersells its role. In a leveraged systematic strategy, the vol targeting mechanism is not downstream of the alpha model. It is a co-equal determinant of risk-adjusted performance. An alpha model that generates 0.62 Sharpe with poor vol control generates 1.04 Sharpe with correct vol control — using the identical underlying signal. No new information was added. No additional alpha was discovered. The improvement came entirely from the mechanics of how position sizes were computed.

This has a direct implication for research prioritization. When a strategy produces a disappointing Sharpe ratio, the first diagnostic should not be signal enhancement — it should be an audit of the scaling mechanism. Signal improvement is expensive. It requires new data, new modeling cycles, and robustness validation across regimes. Fixing a broken volatility estimator is comparatively cheap. The return on research effort from infrastructure work frequently exceeds the return from alpha research, particularly in strategies where the alpha exists but the sizing obscures it.

Whether the same principle holds when the Sharpe is already above 1.5 — when the signal is genuinely weak rather than merely mis-scaled — is a different question.
