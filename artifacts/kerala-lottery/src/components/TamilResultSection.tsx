import type { Lottery, Result } from '../types';
import { getFirstPrizeNumber } from '../data';

interface Props {
  lottery: Lottery;
  result: Result;
}

// Tamil names for lotteries
const TAMIL_NAMES: Record<string, string> = {
  karunya:        'கருண்யா',
  'karunya-plus': 'கருண்யா பிளஸ்',
  'sthree-sakthi':'ஸ்ரீ சக்தி',
  dhanalekshmi:   'தனலட்சுமி',
  'karunya-plus': 'கருண்யா பிளஸ்',
  bhagyathara:    'பாக்யதாரா',
  samrudhi:       'சம்ருத்தி',
  'suvarna-keralam': 'சுவர்ண கேரளம்',
  bumper:         'பம்பர்',
};

const TAMIL_DAYS: Record<string, string> = {
  Monday: 'திங்கள்கிழமை', Tuesday: 'செவ்வாய்கிழமை', Wednesday: 'புதன்கிழமை',
  Thursday: 'வியாழன்கிழமை', Friday: 'வெள்ளிக்கிழமை', Saturday: 'சனிக்கிழமை', Sunday: 'ஞாயிற்றுக்கிழமை',
};

export function TamilResultSection({ lottery, result }: Props) {
  const tamilName = TAMIL_NAMES[lottery.slug] ?? lottery.name;
  const tamilDay = TAMIL_DAYS[lottery.drawDay] ?? lottery.drawDay;
  const firstPrize = getFirstPrizeNumber(result);
  const isPending = result.status === 'pending';

  return (
    <section className="content-card tamil-section" lang="ta" dir="ltr">
      <h2>
        <span style={{ marginRight: 8 }}>🇮🇳</span>
        {tamilName} லாட்டரி முடிவு — தமிழில்
      </h2>
      <p>
        <strong>கேரளா {tamilName} லாட்டரி</strong> ஒவ்வொரு {tamilDay}யும் மதியம் 3:00 மணிக்கு நடத்தப்படுகிறது.
        {' '}
        {isPending
          ? 'இன்றைய முடிவு இன்னும் வெளியிடப்படவில்லை. மதியம் 3 மணிக்கு பிறகு திரும்பவும் பாருங்கள்.'
          : `இன்றைய முதல் பரிசு எண்: ${firstPrize}. கீழே உள்ள பரிசு அட்டவணையில் முழு முடிவையும் பாருங்கள்.`
        }
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted-fg, #6b7280)', marginTop: 8 }}>
        ⚠️ இந்த தளம் கேரளா அரசின் அதிகாரப்பூர்வ தளம் அல்ல. பரிசு கோர முன்பு எப்போதும் கேரளா அரசு அதிகாரப்பூர்வ அரசிதழை சரிபார்க்கவும்.
      </p>
    </section>
  );
}
