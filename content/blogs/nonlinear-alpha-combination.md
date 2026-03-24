---
title: "Nonlinear Alpha Combination: Why the Risk Validator Said No"
date: "2026-03-17"
category: "Research"
summary: "XGBoost beats linear IC-weighting on 4 of 5 OOS folds. The risk validator still rejected it. Here is why that outcome is correct."
slug: "nonlinear-alpha-combination"
---

## The Question

Twenty-nine validated alpha signals. Each has its own IC profile, decay curve, and correlation structure with the others. The standard approach combines them via IC-weighted linear blending: assign each signal a weight proportional to its rolling information coefficient, normalize, sum. It is transparent, interpretable, and stable. It is also, by construction, incapable of modeling interaction effects between signals.

The hypothesis is straightforward. If two signals are conditionally informative — if signal A predicts well precisely when signal B is elevated — then a linear combiner will miss that structure. Gradient-boosted trees, which partition the feature space recursively, can in principle capture such interactions without explicit specification. The question posed to the data: does that theoretical advantage materialize in out-of-sample performance across 29 real alphas?

## Why the First Attempt Failed

The initial formulation (v1) trained XGBoost to predict raw forward returns. This is the intuitive framing: the model sees 29 alpha values for a given stock-day observation and outputs an expected return. In practice, the target distribution made the problem intractable.

Raw equity returns are fat-tailed, asymmetric, and contaminated by earnings announcements, index rebalancing events, and idiosyncratic corporate actions. The cross-sectional standard deviation of 1-day forward returns was 2.878 — a figure so large relative to the signal being forecasted that gradient boosting simply memorized the outlier dates. The out-of-sample IC was unstable across folds: large in absolute value but sign-inconsistent, a hallmark of a model that has fit noise rather than structure. The loss surface was dominated by extreme observations that have no relationship to the predictive content of the 29 alphas.

This failure is not surprising in retrospect. Linear IC-weighting implicitly uses rank correlation — a transformation that is outlier-resistant by construction. Asking a tree-based model to compete on the raw returns problem is a category mismatch. The signal lives in the cross-sectional rank. The noise lives in the level.

## The Rank Transform Fix

Version 2 reframes the problem as cross-sectional rank prediction. For each day $t$, the forward return of each symbol is converted to its percentile rank within the cross-section, producing a target $\tilde{y}_{i,t} \in [0, 1]$. The 29 input features are similarly rank-transformed within their daily cross-sections. Missing signal values — present when a stock is too new for a given lookback window to be populated — are set to the neutral rank of 0.5 rather than being dropped, which would introduce selection bias into the training distribution.

This transformation has three useful properties. It removes the outlier problem entirely: the maximum target value is 1 and the minimum is 0, regardless of what happens to any individual stock. It aligns the model's optimization target with the quantity that actually drives realized PnL in a long/short equity book: cross-sectional rank, not absolute return magnitude. And it preserves the same signal regime as IC-weighting, making the two methods genuinely comparable.

The model was trained with moderate regularization — maximum depth of 4, minimum child weight of 10, subsample ratio of 0.8 — to limit overfitting to the training cross-sections. Early stopping on a held-out validation portion of the training fold prevented the tree ensemble from running to full depth on in-sample residuals.

## Walk-Forward Results

The 5-fold walk-forward used expanding-window training: each fold trains on all data prior to the evaluation year and tests on the following period. The out-of-sample IC and IC IR results are as follows.

| Period | OOS IC | IC IR |
|--------|--------|-------|
| 2021 | $-0.028$ | $-0.16$ |
| 2022 | $+0.043$ | $+0.45$ |
| 2023 | $+0.034$ | $+0.29$ |
| 2024 | $+0.052$ | $+0.74$ |
| 2025 H1 | $+0.037$ | $+0.12$ |
| **Average** | **$+0.028$** | — |

Four of five folds produce positive out-of-sample IC. The average IC of $+0.028$ is modest but consistent with the range expected from a secondary combination layer operating on top of already-refined signals. The 2024 fold is the strongest, posting an IC IR of 0.74. The 2025 half-year fold weakens, which may reflect reduced training data or genuine signal degradation in recent periods.

The 2021 fold is the anomaly. It is the first evaluation window in the sequence, meaning the model trained on the least data — roughly two to three years of history — before making predictions on a period that included both a continued low-volatility bull market and early 2021 retail-driven dislocation events. Negative IC in this fold is operationally important. It signals that the model is capable of producing directionally incorrect predictions in market conditions that differ from its training distribution.

## The Blend and Its Sharpe

A 70% linear / 30% XGBoost blend was constructed as a conservative hedge against the model's known instability. The linear component provides a stable baseline with well-understood decay properties. The XGBoost component provides incremental nonlinear structure when the regime supports it. The blended portfolio produced a Sharpe ratio of 0.95 in full-sample backtest.

Examined in isolation, the XGBoost portfolio produced a Sharpe of 1.17. The linear IC-weighted portfolio produced a Sharpe of $-0.26$ over the same period. The delta between the two is $+1.42$.

This number is the central diagnostic. A performance differential of 1.42 Sharpe units between two combination methods operating on the same 29 alpha inputs is not a signal of superior nonlinear structure. It is a red flag.

## What Overfitting Means in This Context

The term "overfitting" in machine learning conventionally refers to a model that performs well on training data and poorly on held-out test data. Walk-forward validation is designed to detect exactly this. Four of five folds produce positive IC, which suggests the model is not simply memorizing training data in the classical sense.

The overfitting concern flagged by the risk validation protocol is more subtle. It concerns the optimization path of the research process itself — what Marcos Lopez de Prado terms "backtest overfitting" through repeated trials. The combination model was designed, failed (v1), redesigned (v2), and then evaluated. Each design decision — the rank transform, the neutral-fill at 0.5, the regularization parameters, the 70/30 blend ratio — was made with some awareness of the data generating the performance signal. Even when each individual decision appears methodologically justified, the cumulative degrees of freedom consumed in arriving at a working specification constitute an implicit form of in-sample fitting that walk-forward IC alone cannot detect.

Concretely: if 20 different blend ratios were considered before settling on 70/30, the effective number of trials on the backtest data is not 1 — it is 20. The reported Sharpe of 0.95 needs to be deflated accordingly. Lopez de Prado's Deflated Sharpe Ratio (DSR) framework formalizes this correction, adjusting the observed Sharpe by the expected maximum Sharpe from $N$ independent trials under the null hypothesis of zero true alpha. With a delta of $+1.42$ between the ML and linear portfolios and no systematic record of prior trials, the validation protocol cannot determine how much of the ML outperformance reflects genuine nonlinearity and how much reflects selection pressure on model specification.

The dispersed feature importance compounds this concern. When a tree ensemble assigns roughly equal weight to all 29 input alphas, it suggests the model has not identified a coherent conditional relationship — the kind of economic structure that would justify confidence in out-of-sample generalization. A well-identified nonlinear interaction would produce concentrated feature importance in a small subset of signals. Diffuse importance is consistent with a model that has fit an idiosyncratic pattern in the training data rather than a stable structural one.

## What the Validator Required

The risk validation protocol imposed two hard criteria that the v2 model failed. The first is the Sharpe differential threshold: a performance gap larger than approximately 1.0 Sharpe units between the ML model and the linear baseline triggers a CRITICAL overfitting flag, regardless of walk-forward IC. The 1.42 delta exceeded this threshold. The second failure item concerns the operational specification: no retrain schedule was defined, meaning the production behavior of the model — how often it updates its tree structure as new data arrives, under what conditions a retrained model replaces the deployed version — was unspecified. A model with undefined retraining logic cannot be risk-managed, because the live model gradually diverges from the backtest without a principled mechanism for synchronization.

The 70/30 blend was constructed precisely to limit exposure to these risks. It did not resolve them. The validation protocol treats a model with CRITICAL flags as a non-deployable research artifact, regardless of how it is blended.

## The Value of a Rejected Model

The v2 XGBoost combination model fails deployment criteria. It remains a productive research outcome.

It establishes that rank transformation is a necessary condition for stable IC in tree-based alpha combination. Raw return prediction is not a viable formulation for this problem class. That finding applies to any subsequent nonlinear combination research and eliminates an entire class of specification error from future iterations.

It establishes that out-of-sample IC is achievable — the positive results in 4 of 5 folds are not noise — but that positive IC is insufficient for deployment when the Sharpe differential between methods is large and unexplained. The constraint is not mathematical; it is epistemological. We do not know which part of the $+1.42$ gap is real.

The path forward is narrower than the initial question suggested. Demonstrating that XGBoost can beat linear IC-weighting on OOS IC is relatively straightforward. Demonstrating that the margin of outperformance is stable, economically motivated, and not an artifact of the research process is a materially harder problem. The risk validator did not answer the original question negatively. It answered a more precise question: not "does the model work?" but "do we know why it works, and will it continue to?"

That distinction is worth preserving.
