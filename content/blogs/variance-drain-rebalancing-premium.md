---
title: "Variance Drain and the Rebalancing Premium"
date: "2026-03-04"
category: "Research"
summary: "Geometric returns are not arithmetic returns. The gap is exploitable."
slug: "variance-drain-rebalancing-premium"
---

## The Arithmetic-Geometric Gap

Every portfolio manager encounters the same inconvenient truth: arithmetic mean returns overstate realized wealth. A 50% gain followed by a 50% loss does not return to par. It returns to 75%. The missing 25% is variance drain.

The geometric return $g$ relates to the arithmetic return $\mu$ through the approximation:

$$g \approx \mu - \frac{\sigma^2}{2}$$

where $\sigma^2$ is the variance of returns. This is not a rounding error. For volatile assets, the drain is substantial. A strategy with 20% arithmetic return and 30% volatility compounds at roughly 15.5% — a 450 basis point haircut extracted by variance alone.

## Rebalancing as a Source of Return

Shannon's demon illustrates the principle. Consider a coin-flip asset that doubles or halves each period. Its arithmetic return is 25%. Its geometric return is zero. Buy and hold produces nothing.

But a portfolio rebalanced daily between this asset and cash generates positive geometric growth. The rebalancing premium arises because selling winners and buying losers systematically harvests the variance that would otherwise drain the portfolio.

The magnitude of this premium depends on three quantities:

- **Variance** of the individual assets ($\sigma_i^2$)
- **Correlation** between assets ($\rho_{ij}$)
- **Rebalancing frequency** relative to mean-reversion timescale

## Quantifying the Premium

For a two-asset equal-weight portfolio, the rebalancing premium $R$ can be approximated as:

$$R \approx \frac{1}{4}(\sigma_1^2 + \sigma_2^2 - 2\rho\sigma_1\sigma_2)$$

This is maximized when correlation is low and individual variances are high. In practice, monthly rebalancing of a diversified equity-commodity portfolio captures 30–80 basis points annually from this effect alone.

The premium is not arbitrage. It requires bearing variance. But it is a structural edge — a mechanical consequence of portfolio geometry that persists regardless of market regime.

## Implementation Considerations

Naive rebalancing ignores transaction costs. The optimal rebalancing bandwidth is a function of the variance-to-cost ratio. Leland (1999) provides the foundational framework: rebalance when drift exceeds a threshold proportional to $(\text{cost} \cdot \sigma)^{1/3}$.

```python
import numpy as np

def leland_bandwidth(cost: float, sigma: float, gamma: float = 1.0) -> float:
    """Optimal no-trade zone half-width (Leland 1999)."""
    return (3 * cost * sigma / (2 * gamma)) ** (1/3)
```

In multi-asset settings, the problem becomes a convex optimization over trade-off between tracking error and transaction costs. We solve this daily.

## The Deeper Implication

Variance drain means that volatility is not merely risk. It is a structural cost. Strategies that reduce variance without proportionally reducing return generate excess geometric growth. This reframes diversification from a defensive measure to an offensive one.

The rebalancing premium is small, persistent, and orthogonal to directional views. For a systematic firm, these are the properties that compound.
