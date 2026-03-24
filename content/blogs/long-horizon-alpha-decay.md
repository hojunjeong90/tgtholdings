---
title: "Alpha That Improves With Time"
date: "2026-03-20"
category: "Signals"
summary: "Not all signals decay. Some alphas strengthen with holding horizon — and knowing which ones is the foundation of a long-horizon systematic strategy."
slug: "long-horizon-alpha-decay"
---

## The Direction of Decay

The default assumption in alpha research is that signal quality degrades as holding horizon extends. Market efficiency erodes information advantages; competitors act on the same signals; microstructure noise eventually resolves into fundamental value. The decay curve is taken for granted.

It is not universal.

Across a universe of 200 names ranked by dollar volume, evaluated over 2,562 trading days from 2016 through 2026, all seven representative alpha archetypes exhibit positive and increasing information coefficients as horizon extends from 14 days out to 252 days. This pattern — which we term LONG_FAVORABLE — is not a statistical curiosity. It is a structural property of how certain fundamental forces transmit into price, and it has direct consequences for how a systematic strategy should be designed, evaluated, and validated.

## What Information Coefficient Horizon Reveals

The information coefficient $\text{IC}(h)$ measures the rank correlation between a signal at time $t$ and forward returns over a horizon of $h$ days. A signal with IC rising monotonically in $h$ is not simply slow to be priced — it is capturing a process that accumulates over time rather than one that mean-reverts.

Realized volatility illustrates the principle sharply. The signal $\text{sigmoid}(\hat{\sigma}_{60})$, computed from 60-day realized close-to-close volatility, produces an IC of $+0.098$ at a 60-day horizon, $+0.125$ at 120 days, and $+0.195$ at 252 days. The signal grows stronger as more time passes. The economic mechanism is not mysterious: low-volatility stocks systematically attract more stable capital flows, face lower financing frictions, and are less susceptible to forced liquidation. These structural advantages compound over quarters, not days.

The Amihud illiquidity signal exhibits the same LONG_FAVORABLE profile. At a 40-day horizon, IC reaches $+0.10$. At 120 days, $+0.17$. Illiquidity imposes a persistent friction cost on capital that must transact at scale — institutions cannot easily rotate out of positions in thin markets. That friction is not priced away at daily or weekly resolution; it compounds into a durable return differential over longer periods.

## The Structural Failure of Mean Reversion

Not every archetype can survive the horizon extension. Mean reversion alphas — signals built on short-term price normalization, oscillators, or deviation-from-trend measures — produce a Gate 1 pass rate of zero percent across all candidate signals in this universe. The failure is not marginal; it is absolute.

The structural reason is asymmetric payoff. Mean reversion in its classic formulation requires both sides of the trade: long the underperformer, short the outperformer. In a long-only portfolio, the short leg is unavailable. A signal that identifies stocks whose price has fallen sharply and therefore "should" bounce will, on average, deliver the bounce in some names and permanent impairment in others. Without the ability to short the mean-reverting upside capture, the long-only implementation systematically selects into the left tail of the underlying distribution.

At 14 to 20 day horizons, noise might partially mask this asymmetry. At 60 to 120 day horizons, it cannot. Stocks that were cheap on a reversion metric and continued falling have had four to six months to confirm the new regime. The position is not mean-reverting; it is just losing. Mean reversion requires a symmetric constraint structure that the long-only mandate structurally violates.

## Effective Diversification and the Duplication Problem

Identifying strong individual signals is necessary but not sufficient. The relevant quantity for portfolio construction is not the number of validated alphas but the number of effectively independent alphas — what we measure as Effective $N$.

Given a set of $K$ validated signals with pairwise rank correlations $\rho_{ij}$, the Effective $N$ is computed as:

$$N_{\text{eff}} = \frac{K}{1 + (K-1)\bar{\rho}}$$

where $\bar{\rho}$ is the average pairwise rank correlation across all signal pairs. For the current set of 29 validated alphas, $\bar{\rho} = +0.042$, yielding $N_{\text{eff}} = 18.0$. The universe of signals is well-diversified — a meaningful result given that naively assembled signal libraries often reach Effective $N$ of 3 to 5 due to latent factor overlap.

The duplication problem appears most clearly in the liquidity archetype. Of 200 candidate signals tested, 99 are variants of the Amihud illiquidity ratio — turnover adjustments, window variations, normalization choices. These variants share the same underlying economic exposure and produce highly correlated rank orderings of the universe. The effective independent contribution from the entire liquidity archetype is 1 to 2 signals, not 99. Counting validated candidates as independent discoveries inflates the signal inventory without improving portfolio diversification.

## Volatility Is Underrepresented

Given the volatility archetype's exceptional long-horizon performance, its current representation in the validated signal set is disproportionately low. Only three volatility signals have cleared validation, despite a Gate 1 pass rate of 46.1% — the second highest among all archetypes. Carry yield passes at 55.6% but contributes lower absolute IC. Volatility passes at 46.1% and contributes IC reaching $+0.195$ at a one-year horizon.

The implication is that the current signal book is leaving diversified alpha on the table. Expanding volatility candidates — across estimation windows, return definitions, and normalization schemes — represents a higher-return research allocation than further mining of the liquidity archetype, where marginal candidates add duplication rather than edge.

Behavioral and trend archetypes are structurally different. The behavioral archetype's average pairwise rank correlation with existing alphas is $-0.03$, which is approximately zero. Signals with near-zero correlation to the existing pool do not need to be strong in absolute IC terms to improve portfolio Sharpe; their contribution is purely diversifying. A signal with IC of $+0.04$ and zero correlation to the existing book increases $N_{\text{eff}}$ by approximately one full unit, which at reasonable IC-to-Sharpe conversion ratios is worth more than a stronger signal with $+0.15$ correlation.

## Recalibrating the Measurement Window

The current validation framework evaluates signals at IC horizons of 14, 20, 40, and 60 days. For a strategy whose empirically validated alpha is concentrated at 60 to 252 day horizons, this calibration creates a systematic bias. Signals that are genuinely long-favorable will appear weak at the 14 and 20 day evaluation points — not because they lack edge, but because they have not had time to express it.

The practical consequence is double: good long-horizon signals are underscored at short horizons, and signals that score well at 14 to 20 days but are not LONG_FAVORABLE are rewarded in validation despite misalignment with the holding structure. Shifting the evaluation grid to 20, 40, 60, and 120 days corrects this measurement bias without fundamentally altering the validation infrastructure. It also resolves a logical inconsistency: a portfolio designed around 2-week to 1-month holding periods should not evaluate its signals at 14-day resolution as a primary criterion.

## The Asymmetry in Research Allocation

A LONG_FAVORABLE signal universe implies something specific about research priority. Signals that are structurally improving over time carry a property that many market participants systematically ignore: the edge grows as capital stays patient. Short-horizon alpha extraction requires continuous signal refreshment and benefits minimally from holding. Long-horizon alpha accumulates in the position.

For a systematic firm operating with defined turnover targets, this is not a philosophical preference — it is a structural advantage. The market prices daily and weekly noise efficiently. It is considerably less efficient at pricing the cumulative effects of realized volatility regimes and persistent illiquidity frictions over 120 to 252 day windows. The question is not whether this edge exists. The data across 2,562 days says it does. The question is whether the measurement infrastructure is designed to see it clearly enough to act on it.
