---
title: "What Accumulation Signals Actually Predict"
date: "2026-03-15"
category: "Signals"
summary: "Rank IC and Pearson IC diverge sharply for accumulation-based signals. The gap reveals why IC-weighting fails and what the signals actually measure."
slug: "accumulation-alpha-patterns"
---

## The Hypothesis

Institutional accumulation leaves traces before it is visible in price. The logic is straightforward: large buyers cannot transact instantaneously. They accumulate over days and weeks, and the process imprints on price structure, volume, and volatility in ways that are too gradual to attribute to noise. The question is whether those traces are systematic enough to be formalized as predictive signals.

We operationalized this hypothesis around five behavioral patterns: gradual directional drift rather than punctuated spikes; volume concentration on up days relative to down days; suppressed volatility consistent with a controlled buyer limiting price impact; moving average alignment of the form $P > \text{MA}_{50} > \text{MA}_{200}$; and momentum persistence, measurable as the autocorrelation structure of returns over intermediate horizons. From these five patterns we constructed ten engineered features, then evaluated them across 2,562 trading days and 3,060 stocks spanning January 2016 through March 2026.

## Feature Construction

The feature set covers the full behavioral spectrum of the hypothesis. MA alignment is binary, checking whether the strict ordering $P_t > \text{MA}_{50} > \text{MA}_{200}$ holds. Volume-to-return conditional ratios capture whether positive-return days carry disproportionate volume. Quiet rally features measure the joint condition of positive drift over 20- and 60-day windows alongside low realized volatility — accumulation, by this definition, is the combination of upward movement and suppressed noise. Momentum persistence features use rolling autocorrelation of daily returns over a 60-day window.

The composite score aggregates the feature set into a single cross-sectional rank, normalized to $[0, 1]$ across the universe at each date. In isolation, none of these features is novel. The hypothesis is that their joint occurrence is more informative than any individual component, because institutional accumulation is a multi-dimensional process.

## Rank IC Results

Evaluated on a 2016–2026 panel, the accumulation features produce the strongest Information Coefficients we have measured against any existing signal in the production set. The full IC profile by forecast horizon is below.

$$\text{Rank IC}_{120d}(\text{accum\_ma\_alignment}) = +0.031$$

$$\text{Rank IC}_{120d}(\text{accum\_quiet\_rally\_60}) = +0.027$$

$$\text{Rank IC}_{120d}(\text{accum\_composite\_score}) = +0.024$$

At the 120-day horizon, these three features alone outperform the average Rank IC of the existing validated signal library by a factor of approximately 14 — the existing average is $+0.0007$ at that horizon against $+0.0095$ for the accumulation set. The $+0.031$ on MA alignment at 120 days is, by this metric, the strongest single signal the system has identified.

The IC profile is also shaped as expected for accumulation logic: it builds with horizon. The 5-day Rank IC is near zero. The 20-day figure is modest. The signal reaches its peak at 60 to 120 days and decays beyond that. This is consistent with the behavioral interpretation — accumulation is a slow process, and the price effect manifests over weeks to months rather than days.

## The Pearson–Rank IC Divergence

This is where the signal requires careful handling. The Rank IC and Pearson IC for the same features diverge sharply, and the divergence is not a rounding artifact.

For `accum_ma_alignment`, the Pearson IC is $-0.0170$ while the Rank IC is $+0.0133$. The signs are opposite. For the composite score, the same sign reversal holds at the 120-day horizon.

The interpretation is precise. Rank IC measures the Spearman correlation between the cross-sectional rank of a signal and the cross-sectional rank of forward returns. Pearson IC measures the linear correlation between raw signal values and raw forward returns. A negative Pearson IC alongside a positive Rank IC means the signal is monotonically informative for relative ordering — stocks that score higher on accumulation features tend to rank higher in subsequent returns — but the linear relationship between signal magnitude and return magnitude is negative. Extreme raw signal values do not predict proportionally extreme positive returns. Some outliers are pulling the Pearson correlation negative while the ordinal relationship remains intact.

This distinction has a direct consequence for portfolio construction. Standard IC-weighting schemes, such as those that determine signal blend weights using historical Pearson IC, assign a weight of zero or negative to these features. The signal is penalized by a method that is not measuring what the signal is actually doing. IC-weighting is calibrated for signals where the linear mapping from signal value to return is stable; it systematically misidentifies rank-ordinal signals as non-predictive.

The practical fix is equal-weight combination within the accumulation feature set, bypassing IC-weighting entirely for these factors. When integrated into a 32-signal composite using equal weighting, the accumulation alphas measurably improve the signal quality of the full system. IC-weighting erases that contribution.

## What the Divergence Implies About Distribution

The Pearson–Rank IC gap points to a specific structure in the joint distribution of signal and returns. Define $S_i$ as the accumulation score for stock $i$ and $r_i^{(120)}$ as its forward 120-day return. The positive Rank IC confirms that $\text{Cov}(\text{rank}(S_i), \text{rank}(r_i^{(120)})) > 0$. The negative Pearson IC confirms that $\text{Cov}(S_i, r_i^{(120)}) < 0$ when computed on raw values.

This combination arises when the return distribution conditional on high signal values is heavy-tailed to the upside — the median conditional return is positive, which the Rank IC captures, but the mean conditional return is depressed by the tail behavior of low-signal stocks that occasionally produce extreme positive returns. Outlier names with no accumulation signature but massive subsequent returns are a known contaminant in large cross-sectional studies. They are relatively infrequent but large enough in magnitude to dominate the Pearson covariance.

This also clarifies the signal's domain of application. It is a cross-sectional ranking tool, not an absolute return predictor. Using it to decide whether a stock will go up is a misapplication. Using it to decide which stocks are likely to go up *relative to the universe* over the next quarter is the correct inference.

## Long-Horizon Investing Implications

The IC profile's horizon structure carries a direct implication for how accumulation signals interact with portfolio turnover. At 5-day and 20-day horizons, the Rank IC is near zero. The cost of acting on the signal at short horizons — transaction costs, slippage, market impact — is not recovered because the forecasting content is negligible at those timescales. The signal's expected value is concentrated in the 60- to 120-day window.

This is not an incidental observation. It means the signal is structurally incompatible with high-turnover execution models. A portfolio that trades on weekly rebalancing cycles and uses this signal as one of many inputs will effectively harvest noise from the accumulation features. The holding period must match the forecast horizon. For a signal that peaks at 120 days, the natural rebalancing frequency is monthly at minimum, and the expected alpha from the feature only accrues to portfolios patient enough to hold through the accumulation-to-realization cycle.

There is a second implication for risk attribution. Because accumulation signals are strongest during quiet, low-volatility upward drift, the periods when they generate the most signal value are precisely the periods when realized volatility is lowest. This creates a selection effect: the signal is most informative when the portfolio is least noisy, and it degrades during high-volatility regimes where the behavioral signature of institutional accumulation is obscured by broader market noise. Any risk model that assigns volatility-scaled weights to this signal will inadvertently dilute it during its most predictive periods and amplify it during its least predictive ones.

## The Scope of What Was Confirmed

Ten features. 2,562 days. 3,060 stocks. The accumulation hypothesis — that institutional buying leaves a detectable multi-dimensional footprint — survives empirical scrutiny at long horizons. The strongest individual feature, MA alignment, produces a Rank IC of $+0.031$ at 120 days, a figure that holds across a sample spanning multiple volatility regimes, sector rotations, and market structures.

The result does not confirm that accumulation signals predict absolute returns. It confirms they predict relative returns, in rank order, over quarters. The distinction matters more than it might appear. Practitioners who deploy these features under the wrong IC-weighting framework will conclude they do not work. They will be measuring the wrong thing.

Whether the Pearson–Rank divergence itself is a stable structural feature of accumulation dynamics, or an artifact of specific distributional conditions in this sample period, remains an open question.
