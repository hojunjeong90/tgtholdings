# Market Regime Report — 2026-03-03

## Snapshot
- Regime: Transition
- Why: 레이어별 점수가 혼재
- Regime shift: 전일 대비 Mean Reversion -> Transition; 전주 대비 Stock Picking -> Transition
- Composite score: -0.58
- Universe: 3959 symbols with usable daily bars
- Sector metadata coverage: 0 symbols (0.0%)
- Correlation sample: 3959 symbols over 60 trading days
- Clustering sample: 400 liquid symbols (target 400)

## Regime Change Detection
- Previous snapshot date: 2026-03-02
- 레짐 변화: Mean Reversion -> Transition
- Composite score 변화: -2.00
- Breadth: Mixed -> Weak (score -2.00)
- Weekly snapshot date: 2026-02-24
- 레짐 변화: Stock Picking -> Transition
- Composite score 변화: -7.00
- Trend: Neutral -> Neutral (score -1.00)
- Breadth: Mixed -> Weak (score -3.00)
- Volatility: Normal -> Stressed (score -2.50)
- Liquidity: Normal -> Thin (score -1.00)

## Changed Layers
- Day-over-day changes:
- Breadth: Mixed -> Weak (score -2.00)
- Week-over-week changes:
- Breadth: Mixed -> Weak (score -3.00)
- Volatility: Normal -> Stressed (score -2.50)
- Liquidity: Normal -> Thin (score -1.00)
- Trend: Neutral -> Neutral (score -1.00)

## Core 5
- Trend: SPY=Bear, QQQ=Bear, IWM=Bull
- Breadth: advance ratio 25.6%, above 50DMA 46.4%
- Volatility: VIX 23.57, realized vol 52.7%
- Correlation: avg pairwise corr 0.112
- Dispersion: cross-sectional 1D std 3.5%

## Layer Scores
- Trend: Neutral (score 1.67) — 지수별 추세 신호가 엇갈림
- Breadth: Weak (score -2.00) — breadth가 약하고 내부 확산이 부족
- Volatility: Stressed (score -2.00) — VIX 또는 단기 변동성 확장이 risk-off 신호
- Liquidity: Thin (score -1.00) — 거래량 둔화 또는 gap 빈도 상승
- Correlation/Dispersion: Stock Picking (score 3.00) — 낮은 상관관계로 종목 선택 환경 우세

## Index Trend
- SPY: Bear (score 1/4), 20D -2.2%, 60D -0.5%, >50DMA False, >200DMA True, 20D slope -0.6%
- QQQ: Bear (score 1/4), 20D -3.9%, 60D -3.5%, >50DMA False, >200DMA True, 20D slope -2.6%
- IWM: Bull (score 3/4), 20D -1.1%, 60D 3.8%, >50DMA False, >200DMA True, 20D slope 0.3%

## Volatility Regime
- VIX / VVIX / VIX9D: 23.57 / 116.02 / 24.55
- VIX level regime: Normal Vol
- Term structure (VIX9D / VIX): 1.042 (Backwardation)

## Breadth & Cross-Section
- 1D advance ratio: 25.6%
- 5D advance ratio: 39.5%
- 20D advance ratio: 45.4%
- 1D mean / median return: -1.5% / -1.2%
- 5D mean return: -0.6%
- Above 20DMA / 50DMA / 200DMA: 37.7% / 46.4% / 57.8%
- New 20D highs / lows: 6.0% / 17.6%
- New high ratio among extremes: 25.3%

## Correlation, Volatility, Volume
- Average pairwise correlation: 0.112
- Median pairwise correlation: 0.104
- Correlation interpretation: Stock-picking dominant
- Cross-sectional dispersion 1D / 5D / 20D: 3.5% / 15.0% / 39.0%
- Mean / median 20D volatility: 52.7% / 43.0%
- Mean / median vol expansion (5D / 20D): 0.95 / 0.91
- Mean / median volume ratio: 1.07 / 0.94
- High-volume share (>=1.5x 20D avg): 13.7%
- Aggregate / median dollar volume (20D avg): 838671540076 / 26663820
- Gap frequency (|open-prev close| >= 2%): 56.7%
- Top 10 positive-return share: 14.2%
- Top 10 positive dollar-share: 31.7%
- Top 10 absolute return share: 3.2%

## Leading Sectors (5D average return)
- Sector metadata unavailable in fundamentals cache; sector ranking skipped.

## Weak Sectors (5D average return)
- Sector metadata unavailable in fundamentals cache; sector weakness table skipped.

## Cluster Structure
- Cluster count: 15
- Silhouette score: 0.1319
- Cluster interpretation: 높은 내부 상관일수록 같은 테마/리스크 버킷으로 묶였을 가능성이 큽니다. dominant group은 sector가 없으면 거래소 기준 fallback입니다.
- C14: 109 symbols, dominant group Exchange:NASDAQ (55.0%), avg internal corr 0.336, avg daily return 0.1%
- C12: 83 symbols, dominant group Exchange:NASDAQ (51.8%), avg internal corr 0.328, avg daily return -0.3%
- C13: 82 symbols, dominant group Exchange:NYSE (75.6%), avg internal corr 0.282, avg daily return 0.0%
- C06: 31 symbols, dominant group Exchange:NYSE (54.8%), avg internal corr 0.257, avg daily return 0.1%
- C01: 24 symbols, dominant group Exchange:NYSE (87.5%), avg internal corr 0.442, avg daily return 0.3%
- C04: 16 symbols, dominant group Exchange:NYSE (68.8%), avg internal corr 0.286, avg daily return 0.1%
- C02: 11 symbols, dominant group Exchange:NYSE (54.5%), avg internal corr 0.310, avg daily return 0.1%
- C05: 10 symbols, dominant group Exchange:NASDAQ (50.0%), avg internal corr 0.259, avg daily return 0.3%

## Strongest Symbols (5D)
- PPBT: 5D 779.6%, 1D 4.7%, volume ratio 0.28
- SABR: 5D 120.2%, 1D 11.8%, volume ratio 1.46
- AAOI: 5D 69.4%, 1D -7.0%, volume ratio 2.30
- RXT: 5D 68.5%, 1D 10.8%, volume ratio 0.62
- SVRN: 5D 63.6%, 1D 47.1%, volume ratio 16.63
- CRCL: 5D 62.3%, 1D 3.6%, volume ratio 1.89
- PRAA: 5D 56.7%, 1D 1.3%, volume ratio 1.10
- ZD: 5D 56.5%, 1D 48.1%, volume ratio 7.29
- FIGS: 5D 54.7%, 1D -1.0%, volume ratio 1.06
- PMVP: 5D 52.8%, 1D -10.0%, volume ratio 1.11

## Weakest Symbols (5D)
- QURE: 5D -62.4%, 1D -14.0%, volume ratio 2.42
- ODD: 5D -57.4%, 1D 0.3%, volume ratio 0.80
- EOSE: 5D -47.2%, 1D 2.7%, volume ratio 1.11
- MNKD: 5D -47.2%, 1D -3.6%, volume ratio 0.78
- RUN: 5D -42.6%, 1D -7.8%, volume ratio 1.47
- XPOF: 5D -40.5%, 1D 5.8%, volume ratio 1.94
- FLGT: 5D -40.3%, 1D -2.9%, volume ratio 2.35
- CLPT: 5D -39.3%, 1D -9.8%, volume ratio 2.26
- TRNR: 5D -36.5%, 1D -8.2%, volume ratio 0.01
- ERII: 5D -36.4%, 1D -0.4%, volume ratio 2.59

## Actionable Implications
- 레이어 신호가 혼재되어 있으므로 포지션 크기를 중립 이하로 유지하고 확인 신호를 기다립니다.
- 전략 다변화는 유지하되 단일 레짐 가정에 강하게 베팅하지 않는 편이 낫습니다.
- 갭 빈도가 높아 overnight risk 관리와 진입 가격 슬리피지 가정이 중요합니다.
- dispersion이 높아 alpha 생성 여지가 큰 반면, 종목 선택 오류의 페널티도 커집니다.