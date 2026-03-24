---
title: "Alpha Factory v3: A Five-Gate Pipeline for Long-Only Signal Selection"
date: "2026-03-14"
category: "Research"
summary: "How a template-based generation system producing 9,000 candidate alphas distills to 29 deployable signals — and why a liquidity archetype dominates the result."
slug: "alpha-factory-v3-pipeline"
---

## The Generation Problem

Most alpha research begins with a hypothesis and ends with a backtest. The implied sequence — idea, formalization, validation — is appealing in its clarity, but it is also a selection funnel with a single data point at the entry: researcher intuition. Alpha Factory v3 inverts this. It begins with a combinatorial generation step that produces 9,000 candidate signals across 11 structural archetypes, then imposes a sequence of increasingly demanding filters. The role of human judgment shifts from signal origination to pipeline architecture.

The 11 archetypes span the standard taxonomy of equity signal construction: momentum, mean reversion, volatility, quality, volume, trend, composite, and multi-timeframe. Version 3 adds three new families — carry/yield, liquidity, and behavioral. Each archetype is instantiated across a grid of parameterizations. The result is a universe of signals dense enough that the selection problem becomes statistical rather than discretionary.

The evaluation horizon is 14 days, tested against IC measurements at $[14, 20, 40, 60]$ day windows over a sample from 2017-02 through 2026-03 — approximately 9.1 years of out-of-sample structure spanning multiple volatility regimes, two significant drawdown episodes, and sustained momentum-driven bull phases.

## The Five-Gate Funnel

The pipeline imposes five sequential filters. Each gate addresses a distinct failure mode. Understanding why each exists is as important as knowing what it eliminates.

**Gate 1** applies a statistical threshold: $\text{IC} \geq 0.01$ with a $t$-statistic $\geq 1.64$, the one-tailed 5% critical value. Of 9,000 candidates, 742 pass — an 8.2% pass rate. The low bar is intentional. Gate 1 is not designed to identify strong signals; it is designed to eliminate pure noise. A signal with $\text{IC} = 0.012$ and $t = 1.7$ carries almost no practical value in isolation, but rejecting it at this stage and retaining a higher-IC signal with $t = 1.5$ would be the wrong trade-off. The gate enforces minimum evidence for statistical existence, nothing more.

**Gate 2** tests temporal stability through 4-fold walk-forward validation, requiring at least 3 of 4 folds to show positive IC. Of the 742 passing Gate 1, 343 survive — a 46.2% pass rate. This gate is the most conceptually important in the pipeline. A signal that scores well in aggregate but deteriorates in the most recent fold is a signal in decay. A signal that performs in 3 of 4 non-overlapping time segments is demonstrating robustness to regime variation, not just fitting the dominant market structure of a single era. The fold structure across 9.1 years means each window covers roughly 2.3 years — long enough to include at least one full volatility cycle.

**Gate 3** applies a turnover constraint: daily turnover $\leq 0.30$. All 343 signals from Gate 2 pass, producing a 100% pass rate. This is not a trivial outcome. It confirms that the temporal stability filter in Gate 2 implicitly selects against high-frequency signals with excessive churn. Signals that are stable across time tend to be signals that do not require constant position reorganization. The cost filter passes cleanly because the time-stability filter has already removed the unstable candidates most likely to generate turnover.

**Gate 4** applies pairwise correlation screening: any signal correlated above 0.60 with an already-accepted signal is removed. The 343 inputs reduce to 29 — an 8.5% pass rate. This is the most aggressive gate in the funnel by elimination count. It addresses the redundancy problem that is endemic to template-based generation: many parameterizations of the same underlying archetype will produce highly correlated signals. A portfolio of 343 signals with average pairwise correlation of 0.80 offers far less diversification than 29 signals at 0.30. The gate does not optimize an objective function over the correlation matrix; it applies a sequential greedy selection ordered by information ratio, accepting each candidate signal that falls below the 0.60 threshold with respect to all previously accepted signals.

**Gate 5** tests regime robustness. The 29 survivors from Gate 4 pass entirely, a 100% pass rate. Signals that have already passed statistical, temporal, cost, and correlation filters tend to derive their edge from persistent microstructure phenomena rather than regime-specific patterns. The regime gate serves as a diagnostic confirmation. Its universal pass rate for the final 29 signals is informative: the earlier gates have already screened out regime-conditional signals as an implicit consequence of the walk-forward requirement.

The overall funnel compresses 9,000 inputs to 29 outputs — a 0.32% retention rate. That compression is not a failure of the generation step. It is the correct operating point for a pipeline whose cost of false positives (deploying a spurious signal) exceeds its cost of false negatives (discarding a marginal signal).

## The Liquidity Archetype

The most significant finding of Alpha Factory v3 is the dominance of the liquidity archetype in the final signal set. The top-ranked signal by information ratio is `LIQ_d2847460`, with $\text{IC} = 0.068$, $\text{IR} = 0.524$, and $t\text{-stat} = 26.35$. The $t$-statistic is not a typo. At 26.35 over a 9.1-year sample, this signal is not fluctuating near significance — it is expressing a systematic relationship with near-zero probability of arising by chance.

The liquidity signals are constructed from the Amihud illiquidity ratio, defined as:

$$\text{ILLIQ}_{i,t} = \frac{1}{D_t} \sum_{d=1}^{D_t} \frac{|r_{i,d}|}{V_{i,d}}$$

where $|r_{i,d}|$ is the absolute daily return of stock $i$ on day $d$, $V_{i,d}$ is the dollar trading volume, and $D_t$ is the number of trading days in the measurement window. The ratio captures the price impact per unit of dollar volume — a higher value indicates that small trades move prices more, i.e., the stock is illiquid in the Kyle (1985) sense.

That a signal derived from this ratio dominates the IR ranking among all 9,000 candidates across all 11 archetypes is a statement about market microstructure. Liquidity premia in equity markets are well-documented — Amihud (2002) establishes the cross-sectional relationship between illiquidity and expected returns — but their persistence as an operational signal at a 14-day holding period, surviving a regime robustness gate over nine years, is a stronger result than the academic literature might suggest. The implication is that the compensation for bearing illiquidity risk is not arbed away by the capital that could most easily bear it, possibly because the investors with the longest horizons — those best positioned to collect the premium — face institutional constraints that prevent them from doing so systematically.

## Portfolio Construction and Sharpe Optimization

The 29-signal ensemble, constrained to long-only positions and evaluated at Tier 2 combination weights, produces the following performance characteristics over the full 9.1-year sample: Sharpe ratio of 0.62, CAGR of 40.7%, maximum drawdown of $-20.9\%$, Calmar ratio of 1.94, and a total return of approximately 2,093%. The average holding period is 32 days — slightly longer than the 14-day signal evaluation horizon, which is expected when signals at $[14, 20, 40, 60]$ day IC windows are combined and position exit is conditioned on signal decay rather than a fixed date.

A volatility-targeting overlay — targeting realized volatility of 12% with a 63-day lookback window — substantially improves the Sharpe ratio to 1.04 at the cost of a lower CAGR of 23.5%. The maximum drawdown deepens marginally to $-21.9\%$. The Sharpe improvement from 0.62 to 1.04 under constant gross exposure reduction during elevated volatility periods follows directly from the mechanics of volatility scaling: $\text{Sharpe} \approx \mu / \sigma$, and if $\mu$ scales proportionally with $\sigma$ (which it does under a multiplicative volatility-targeting rule), then the ratio is preserved — but the empirical result exceeds preservation, suggesting that a portion of the raw return series is negatively autocorrelated volatility spikes that the scaler suppresses without proportionally suppressing the mean.

The Calmar ratio of 1.94 on the unscaled portfolio is the metric that warrants attention. Calmar — defined as $\text{CAGR} / |\text{MDD}|$ — penalizes the full realized drawdown rather than a volatility estimate. A ratio above 1.0 indicates that the system generates more than one unit of annualized return per unit of peak-to-trough loss. That is a functional property, not a statistical artifact: it implies that the drawdown recovery is not simply variance reverting to mean but that the underlying alpha is generating net directional contribution even through its worst sustained period.

## What the Funnel Reveals

A pipeline that reduces 9,000 candidates to 29 is, structurally, an argument about the distribution of alpha in equity markets. If alpha were uniformly distributed across signal types and parameterizations, the funnel's gates would produce a representative sample of archetypes. Instead, the final set is dominated by a single archetype — liquidity — that was not even present in prior versions of the system.

This suggests that the template-generation approach is not simply recovering well-known factor premia in disguise. The behavioral and carry/yield archetypes, also new in v3, produce candidates that pass statistical and walk-forward gates but are largely eliminated by the correlation filter. They contribute real information but not orthogonal information — their predictive content is already captured by signals from older archetypes that express the same underlying mechanism through different parameterizations.

The liquidity archetype survives the correlation gate because it accesses a different source of return variation. Price impact is a property of the supply-demand microstructure at the individual stock level, not a derived characteristic of price history or earnings quality. A momentum signal and a mean-reversion signal will, in many environments, be negatively correlated — their combination is mechanically attractive. A liquidity signal and a momentum signal measure different properties of the same security entirely. Their orthogonality is structural rather than statistical, and the funnel's architecture is designed to detect and preserve exactly that distinction.

The practical consequence is that the dominant alpha source in a long-only equity system, tested over nine years and distilled from 9,000 candidates, turns out to be a measure of how much it costs to trade the asset. In a market where information is increasingly commoditized and price-based signals face relentless competitive pressure, the edge migrates toward frictions — and frictions compound quietly for those willing to hold for 32 days.
