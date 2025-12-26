import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'TGT Holdings - 글로벌 투자 인텔리전스 플랫폼';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            TGT
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          TGT Holdings
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          글로벌 통화 지표, 환율, 금리 및 투자 시그널을 실시간으로 분석
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 48,
          }}
        >
          {['환율', '금리', '주식', '경제지표'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 9999,
                padding: '12px 24px',
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
