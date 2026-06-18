import { TIKTOK_PROMO_PERCENT } from '../../lib/tiktok-promo';
import { TikTokFloatingHearts } from './TikTokFloatingHearts';

interface TikTokPromoHeroProps {
  celebrate?: boolean;
}

export function TikTokPromoHero({ celebrate = false }: TikTokPromoHeroProps) {
  return (
    <div
      className={`tiktok-promo-hero mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-black via-neutral-950 to-emerald-950/25 px-6 py-8 sm:px-8 sm:py-10 ${
        celebrate ? 'tiktok-promo-hero--celebrate' : ''
      }`}
    >
      <TikTokFloatingHearts />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="rounded-2xl bg-black/50 p-4 ring-1 ring-white/10 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
          <img
            src="/images/tiktok-logo.png"
            alt="TikTok"
            width={112}
            height={112}
            className="h-20 w-20 object-contain sm:h-28 sm:w-28"
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400/90">
          Special offer
        </p>

        <h2 className="mt-3 text-4xl font-bold tracking-tight text-emerald-400 drop-shadow-[0_0_24px_rgba(52,211,153,0.35)] sm:text-5xl">
          Save {TIKTOK_PROMO_PERCENT}%
        </h2>
        <p className="mt-2 text-lg font-medium text-white/90 sm:text-xl">
          with a quick TikTok share
        </p>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55">
          Love your detail? Share a short clip after your appointment and we&apos;ll take{' '}
          {TIKTOK_PROMO_PERCENT}% off today. The day after your visit, we&apos;ll email you a
          friendly reminder to post.
        </p>

        <p className="mt-4 text-sm text-white/50">
          Tag <span className="font-semibold text-white/85">@drive.clean.li</span> — no posting
          required before you book.
        </p>
      </div>
    </div>
  );
}
