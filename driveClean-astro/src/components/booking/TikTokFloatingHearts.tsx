import type { CSSProperties } from 'react';

interface HeartConfig {
  left: string;
  delay: string;
  duration: string;
  drift: string;
  scale: string;
  rise: string;
  color: 'pink' | 'red' | 'white';
  size: number;
}

const HEARTS: HeartConfig[] = [
  { left: '72%', delay: '0s', duration: '2.2s', drift: '8px', scale: '1', rise: '130px', color: 'pink', size: 22 },
  { left: '78%', delay: '0.4s', duration: '2.6s', drift: '-14px', scale: '0.85', rise: '150px', color: 'red', size: 18 },
  { left: '85%', delay: '0.8s', duration: '2.4s', drift: '18px', scale: '1.1', rise: '160px', color: 'pink', size: 24 },
  { left: '68%', delay: '1.1s', duration: '2.8s', drift: '-10px', scale: '0.9', rise: '140px', color: 'white', size: 16 },
  { left: '90%', delay: '1.4s', duration: '2.3s', drift: '6px', scale: '1.05', rise: '170px', color: 'red', size: 20 },
  { left: '75%', delay: '1.8s', duration: '2.5s', drift: '-16px', scale: '0.95', rise: '145px', color: 'pink', size: 21 },
  { left: '82%', delay: '2.1s', duration: '2.7s', drift: '12px', scale: '1.15', rise: '155px', color: 'pink', size: 26 },
  { left: '88%', delay: '2.5s', duration: '2.2s', drift: '-8px', scale: '0.8', rise: '135px', color: 'white', size: 15 },
  { left: '70%', delay: '0.6s', duration: '2.9s', drift: '20px', scale: '1.2', rise: '165px', color: 'red', size: 28 },
  { left: '93%', delay: '1.6s', duration: '2.4s', drift: '-12px', scale: '0.88', rise: '148px', color: 'pink', size: 19 },
  { left: '77%', delay: '2.8s', duration: '2.6s', drift: '10px', scale: '1', rise: '152px', color: 'red', size: 22 },
  { left: '86%', delay: '3.1s', duration: '2.3s', drift: '-18px', scale: '1.08', rise: '158px', color: 'pink', size: 23 },
  { left: '74%', delay: '0.2s', duration: '2.5s', drift: '14px', scale: '0.92', rise: '142px', color: 'white', size: 17 },
  { left: '91%', delay: '2.0s', duration: '2.8s', drift: '-6px', scale: '1.12', rise: '168px', color: 'pink', size: 25 },
];

const FILL: Record<HeartConfig['color'], string> = {
  pink: '#fe2c55',
  red: '#ff0050',
  white: '#ffffff',
};

function HeartIcon({ size, fill }: { size: number; fill: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function TikTokFloatingHearts() {
  return (
    <div className="tiktok-hearts-layer" aria-hidden="true">
      {HEARTS.map((heart, index) => (
        <span
          key={index}
          className="tiktok-live-heart"
          style={
            {
              '--heart-left': heart.left,
              '--heart-delay': heart.delay,
              '--heart-duration': heart.duration,
              '--heart-drift': heart.drift,
              '--heart-scale': heart.scale,
              '--heart-rise': heart.rise,
            } as CSSProperties
          }
        >
          <HeartIcon size={heart.size} fill={FILL[heart.color]} />
        </span>
      ))}
    </div>
  );
}
