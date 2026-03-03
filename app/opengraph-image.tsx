import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'TGT Quant — Systematic Intelligence. Compounded.';
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
          background: 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #0c1a2e 100%)',
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
              width: 96,
              height: 96,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.02em',
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
            letterSpacing: '-0.03em',
          }}
        >
          TGT Quant
        </div>
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255, 255, 255, 0.55)',
            textAlign: 'center',
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          Systematic Intelligence. Compounded.
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 48,
          }}
        >
          {['Quantitative Research', 'Systematic Trading', 'Risk Management', 'Global Markets'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 9999,
                padding: '10px 20px',
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.6)',
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
