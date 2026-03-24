---
title: "Stock Picking at 4.25, With Thin Volume Underneath"
date: "2026-03-22"
category: "Macro"
summary: "The Korean composite regime score reached +4.25 on 2026-03-24 as correlation collapsed to 0.319 and dispersion widened — but 96.5% portfolio turnover and persistent thin liquidity complicate the clean read."
slug: "kr-market-regime-march-24-2026"
---

## The Composite Has Deepened

On 2026-03-11, the Korean equity composite shifted from Transition to Stock Picking at $+2.08$. Thirteen sessions later it sits at $+4.25$ — a day-over-day gain of $+3.67$. The regime label is the same, but the score has more than doubled. That distance matters. A score near the regime boundary is a conditional signal; a score of $+4.25$ reflects a cross-section that has organized into genuine dispersion. The question is not whether the regime is real. The question is whether the infrastructure underlying it can support execution.

## Correlation Has Done the Work

The Correlation/Dispersion layer scores $+3.00$ with average pairwise correlation at $0.319$ and cross-sectional dispersion at $5.1\%$. These figures are not structurally different from the $0.318$ average correlation recorded on March 11, but their persistence through thirteen sessions of continued market movement is the signal. Correlation regimes decay. A pairwise correlation near $0.32$ across a 2,787-symbol universe, held for two weeks, is not noise. It describes a market where the dominant risk factor is not the index — it is the individual name.

The arithmetic of portfolio construction in this environment is straightforward. For a portfolio of $n$ equal-weighted long positions, portfolio variance is approximately:

$$\sigma_p^2 \approx \frac{\sigma_i^2}{n}\left(1 + (n-1)\rho\right)$$

At $\rho = 0.319$ and $n = 20$, the correlation term contributes roughly $6.1\times$ the idiosyncratic component. At $\rho = 0.80$ — a typical crisis-correlated environment — the same portfolio would carry approximately $15.6\times$ the idiosyncratic variance in its correlation loading. The practical difference in portfolio-level volatility between these two states, holding all else equal, is large enough to change the optimal position count and sizing regime entirely. The dispersion environment is not a theoretical benefit. It is a direct input to the denominator of Sharpe ratio optimization.

## Breadth Is Mixed, Not Strong

The Breadth layer scores $+1.00$ with a 1-day advance ratio of $70.2\%$ and $39.6\%$ of symbols above their MA50. The 1-day advance ratio is constructive. The MA50 penetration rate is not. $39.6\%$ above MA50 means $60.4\%$ of the 2,787-symbol universe remains below its own 50-day average — a figure that is consistent with a market that has corrected but not recovered.

The five-day trend data is directionally relevant but small in magnitude. Risk pressure has improved from $-2.2\%$ to $-0.5\%$, a $+1.68$ percentage point shift. Breadth-above-MA50 has declined marginally from $43.7\%$ to $41.7\%$ over the same window, a $-2.08$ percentage point drift. The early warning module reads Normal across all metrics except 20-day lows, which at $7.9\%$ approach the $8\%$ threshold that triggers a caution flag but have not crossed it. This is a market where the majority of names are below medium-term trend and the forward indicators are stable — not accelerating in either direction.

The Trend layer scores $+2.00$ with KOSPI classified Bull, KOSDAQ Neutral, and KONEX Bear. The divergence across exchanges is a structural feature of this cycle. KOSPI's large-cap tier has recovered and held; KOSDAQ remains range-bound on the medium horizon; KONEX continues to deteriorate. Any systematic strategy that treats KR equity as a single trend vehicle faces a three-way index disagreement that the composite number compresses into a single positive score. Index-level positioning is not the trade this environment offers.

## Liquidity Has Not Followed

The Liquidity layer scores $-1.00$: Thin. Volume has declined from prior-session levels, and the Volatility layer — while improved to $-0.50$ from the $-3.00$ Crisis reading of two weeks ago — still reflects proxy vol at $82.07$ on a 20-day basis. The volatility classification has moved from Stressed to Normal in label, but $82.07$ is not a low number. The composite is moving higher while the execution environment remains constrained.

The operational consequence is not subtle. In a Stock Picking regime with normal liquidity and normal volatility, the signal from a $+4.25$ composite score implies broad access to the cross-section. In the present configuration, the cross-section is disperse but the volume substrate for accessing that dispersion is thin. Names where the energy build-up has concentrated — particularly small-cap KOSDAQ issues — carry execution risk that the regime score does not price. The spread between alpha opportunity as measured by the composite and alpha capture as limited by liquidity is the defining friction of the current environment.

## The Energy Watchlist as Forward Probability

The energy build-up framework identifies three upside-biased candidates at the top of the distribution. The emergency watchlist of seven symbols with energy $\geq 85$ and explosion probability $\geq 80$ contains five downside-biased names and two upside.

The $5$-to-$2$ downside skew in the high-energy emergency cohort is a specific diagnostic. In a fully recovered Stock Picking environment, this distribution would be symmetric or tipped toward upside. The persistence of downside skew at the extreme energy tail — even as the composite sits at $+4.25$ — indicates that the cross-sectional compression has not fully released in the downside direction. Some portion of the universe carries accumulated kinetic energy that has not yet found a directional expression. This is not a contradiction of the regime label. It is a description of the tail risk that the regime label does not encode.

The signal filter records zero new 52-week and zero new 52-day highs across the quality-filtered universe. The absence of new highs in a Stock Picking regime at $+4.25$ composite is notable. The dominant buy signals — $579$ ADX trend initiations, $201$ Williams %R buy events, $182$ stochastic buy events, $164$ Ichimoku breakouts — are momentum-following and mean-reversion signals firing on names that have recovered from depressed levels, not names making new high-water marks. The signal profile is recovery, not breakout.

## Turnover as a Regime Confirmation

The monthly rebalance on 2026-03-24 registers turnover of $96.48\%$ — 29 additions and 29 removals in a single rebalance cycle. This is not routine portfolio maintenance. A turnover rate approaching $100\%$ on a monthly cycle implies that the factor structure underlying the selection model has reasserted itself after a period where factor returns were insufficient to produce stable rankings. The additions represent a systematic re-entry into the cross-section at a reset point.

High turnover at a regime confirmation is interpretable in two directions simultaneously. It confirms that the prior portfolio's factor exposures became stale — the names held through the correction cycle no longer carry the regime-optimal signal profile. It also produces a near-complete transition in execution cost: a $96.5\%$ turnover rate means the model is paying transaction costs on effectively the entire portfolio. In a thin-liquidity environment, the execution-cost drag on a full portfolio reset is non-trivial, and the forward alpha required to justify the churn must exceed that drag before the rebalance generates net positive expected value.

## What the Score Does Not Say

A composite of $+4.25$ with Normal volatility, Neutral early warning, and a cross-sectional dispersion of $5.1\%$ is the cleanest Stock Picking read the Korean market has produced in this cycle. The conditions for active selection — low correlation, high dispersion, recovering breadth, no macro shock signals — are present and have been stable for two weeks.

But the score is a description of the cross-section. It is not a description of the execution infrastructure. Thin Liquidity at $-1.00$ and proxy vol at $82.07$ mean the universe is wide open for selection and narrow in capacity. The energy watchlist's downside skew at the extreme tail means the cross-section carries residual compression risk that has not expressed directionally. The zero-new-highs signal filter means the recoveries are from depth, not from strength.

The regime is genuine. Its constraints are also genuine. The distance between a $+4.25$ composite and the prior cycle's Crisis reading is large enough that it represents a structural change in the opportunity set — not a reflexive bounce inside a bear cycle. Whether that structural change has moved faster than the liquidity environment's capacity to support acting on it remains the open question this market has not yet answered.
