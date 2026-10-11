// All on-screen text in 4 languages. Add a language by adding one more entry to STRINGS.
import type { PointValues, TrumpMode } from '../engine';
import type { BackgroundId, ThemeId } from './themes';

export type Lang = 'ne' | 'neRom' | 'en' | 'ja';
export const LANGS: readonly Lang[] = ['ne', 'neRom', 'en', 'ja'];

export interface CoinValues {
  normal: number;
  kot: number;
  baunne: number;
}

export interface Strings {
  langName: string;
  htmlLang: string;
  names: [string, string, string, string];
  partner: string;
  us: string;
  them: string;
  teamUs: string;
  teamThem: string;
  round: (n: number) => string;
  trump: string;
  dahal: string;
  haat: string;
  dealer: string;
  chooseTrump: string;
  chooseTrumpSub: string;
  chooseTrumpHidden: string;
  chooseTrumpHiddenSub: string;
  waitingTrump: (name: string) => string;
  yourTurnChooseTrump: string;
  trickWonBy: (name: string) => string;
  turnOf: (name: string) => string;
  yourTurnLead: string;
  yourTurnFollow: (suit: string) => string;
  yourTurnVoid: (suit: string) => string;
  yourTurnVoidBand: (suit: string) => string;
  yourTurnVoidCut: (suit: string) => string;
  toastTrumpChosen: (name: string, suit: string) => string;
  toastTrumpHidden: (name: string) => string;
  toastReveal: (suit: string) => string;
  toastCut: (name: string, suit: string) => string;
  toastDahal: (name: string, n: number) => string;
  win: string;
  lose: string;
  kot: string;
  baunne: string;
  roundWonBy: (team: string, points: number) => string;
  whyBaunne: string;
  whyKot: string;
  whyTens: (n: number) => string;
  whyTricks: (n: number) => string;
  totalScore: string;
  nextRound: string;
  coinsEarned: (n: number) => string;
  confirmReset: string;
  settings: string;
  language: string;
  cardDesign: string;
  gameMode: string;
  sound: string;
  on: string;
  off: string;
  coins: string;
  unlockFor: (n: number) => string;
  notEnoughCoins: (n: number) => string;
  newGame: string;
  modes: Record<TrumpMode, { name: string; desc: string }>;
  modeNextRound: string;
  modeNow: string;
  themes: Record<ThemeId, string>;
  background: string;
  backgrounds: Record<BackgroundId, string>;
  installApp: string;
  installButton: string;
  installHint: string;
  installed: string;
  howToPlay: string;
  credits: string;
  close: string;
  info: string;
  creditsBy: string;
  creditsText: string;
  chooseLanguage: string;
  rulesHtml: (p: PointValues, c: CoinValues) => string;
}

const ne: Strings = {
  langName: 'नेपाली',
  htmlLang: 'ne',
  names: ['तपाईं', 'गजेन्द्र', 'सीता', 'रञ्जना'],
  partner: '(साथी)',
  us: 'हामी',
  them: 'उनीहरू',
  teamUs: 'हाम्रो टिम',
  teamThem: 'उनीहरू',
  round: (n) => `राउन्ड ${n}`,
  trump: 'तुरुप',
  dahal: 'दहल',
  haat: 'हात',
  dealer: 'डिलर',
  chooseTrump: 'तुरुप छान्नुहोस्',
  chooseTrumpSub: 'आफ्ना ५ पत्ती हेरेर रङ छान्नुहोस्',
  chooseTrumpHidden: 'लुकेको तुरुप छान्नुहोस् 🔒',
  chooseTrumpHiddenSub: 'अरूले देख्दैनन् — कसैसँग रङ नभएपछि खुल्छ',
  waitingTrump: (n) => `${n} तुरुप छान्दै…`,
  yourTurnChooseTrump: 'तपाईंको पालो: तुरुप छान्नुहोस्',
  trickWonBy: (n) => `${n}ले हात जिते`,
  turnOf: (n) => `${n}को पालो…`,
  yourTurnLead: 'तपाईंको पालो — जुनसुकै पत्ती खेल्न मिल्छ',
  yourTurnFollow: (s) => `तपाईंको पालो — ${s} खेल्नुपर्छ`,
  yourTurnVoid: (s) => `तपाईंको पालो — ${s} छैन, तुरुप वा जुनसुकै`,
  yourTurnVoidBand: (s) => `${s} छैन — तपाईंले खेल्दा लुकेको तुरुप खुल्छ!`,
  yourTurnVoidCut: (s) => `${s} छैन — तपाईंले खेलेको पत्तीको रङ नै तुरुप बन्छ!`,
  toastTrumpChosen: (n, s) => `${n}ले तुरुप छाने: ${s}`,
  toastTrumpHidden: (n) => `${n}ले तुरुप लुकाएर राखे 🔒`,
  toastReveal: (s) => `हुकुम खुल्यो! तुरुप: ${s}`,
  toastCut: (n, s) => `${n}ले काटे! तुरुप: ${s}`,
  toastDahal: (n, k) => `${n}ले ${k} दहल जिते!`,
  win: 'जित्यो!',
  lose: 'हार्यो',
  kot: 'कोट!',
  baunne: 'बाउन्ने! (५२)',
  roundWonBy: (t, p) => `${t}ले राउन्ड जित्यो (+${p})`,
  whyBaunne: 'सबै १३ हात जित्यो!',
  whyKot: 'चारै दहल (१०) जित्यो!',
  whyTens: (n) => `${n} वटा दहल जित्यो`,
  whyTricks: (n) => `२–२ दहल, धेरै हात (${n}) जित्यो`,
  totalScore: 'जम्मा स्कोर',
  nextRound: 'अर्को राउन्ड ▶',
  coinsEarned: (n) => `+${n} सिक्का 🪙`,
  confirmReset: 'नयाँ खेल सुरु गर्ने? स्कोर ० हुन्छ।',
  settings: 'सेटिङ',
  language: 'भाषा',
  cardDesign: 'पत्तीको डिजाइन',
  gameMode: 'खेल्ने तरिका (मोड)',
  sound: 'आवाज',
  on: 'खुला',
  off: 'बन्द',
  coins: 'सिक्का',
  unlockFor: (n) => `${n} 🪙 मा खोल्नुहोस्`,
  notEnoughCoins: (n) => `अझै ${n} सिक्का चाहिन्छ`,
  newGame: 'नयाँ खेल',
  modes: {
    open: { name: 'साधारण (खुला तुरुप)', desc: 'डिलरपछिको खेलाडीले ५ पत्ती हेरेर तुरुप छान्छ र सबैले देख्छन्।' },
    bandHukum: { name: 'बन्द हुकुम', desc: 'तुरुप लुकाएर छानिन्छ। पहिलो पटक कसैसँग रङ नभएपछि मात्र खुल्छ।' },
    cutHukum: { name: 'कट हुकुम', desc: 'कसैले तुरुप छान्दैन। रङ नभएर पहिलो पटक खेलिएको पत्तीको रङ नै तुरुप हुन्छ।' },
  },
  modeNextRound: 'नयाँ मोड अर्को राउन्डदेखि लागू हुन्छ',
  modeNow: 'नयाँ मोडमा पत्ती फेरि बाँडियो',
  themes: { classic: 'क्लासिक', blue: 'निलो', dhaka: 'ढाका', neon: 'नियोन', gold: 'शाही सुनौलो' },
  background: 'पृष्ठभूमि (टेबल)',
  backgrounds: { normal: 'साधारण', gundri: 'गुन्द्री (परालको)', galaicha: 'गलैंचा' },
  installApp: 'फोनमा एप जस्तै राख्नुहोस्',
  installButton: '📲 एप इन्स्टल गर्नुहोस्',
  installHint: 'Android Chrome: ⋮ मेनु → "Add to Home screen"। iPhone Safari: Share ⬆ → "Add to Home Screen"।',
  installed: '✔ एप इन्स्टल भइसक्यो',
  howToPlay: 'कसरी खेल्ने',
  credits: 'बनाउने',
  close: 'बन्द',
  info: 'जानकारी',
  creditsBy: 'यो खेल बनाउने',
  creditsText:
    'दहल खानी (दहल मारा) नेपालको परम्परागत तास खेल हो, भारतको मेन्डीकोट / देहला पकड जस्तै। यो ब्राउजर प्रोटोटाइप हो — तपाईं ३ वटा कम्प्युटर बोटसँग खेल्नुहुन्छ।',
  chooseLanguage: 'भाषा छान्नुहोस्',
  rulesHtml: (p, c) => `
    <h2>कसरी खेल्ने?</h2>
    <p><b>४ जना, २ टिम।</b> तपाईं तल, तपाईंको साथी (सीता) माथि। गजेन्द्र र रञ्जना अर्को टिम।</p>
    <h3>१. पत्ती बाँड्ने र तुरुप</h3>
    <ul>
      <li>५२ पत्ती, जोकर छैन। ठूलोदेखि सानो: A K Q J 10 9 … 2।</li>
      <li>सुरुमा सबैलाई ५ पत्ती। डिलरपछिको खेलाडीले ५ पत्ती हेरेर <b>तुरुप</b> (रङ) छान्छ।</li>
      <li>त्यसपछि ४ + ४ पत्ती थपेर सबैको १३ पत्ती हुन्छ। डिलर हरेक राउन्ड घुम्छ।</li>
    </ul>
    <h3>२. खेल्ने नियम</h3>
    <ul>
      <li>तुरुप छान्नेले पहिलो <b>हात</b> सुरु गर्छ।</li>
      <li>सुरु गरेको रङ छ भने त्यही खेल्नैपर्छ। छैन भने जुनसुकै — तुरुपले काट्न सकिन्छ।</li>
      <li>सबैभन्दा ठूलो तुरुपले हात जित्छ। तुरुप छैन भने सुरुको रङको ठूलो पत्तीले।</li>
      <li>हात जित्नेले अर्को हात सुरु गर्छ। एक राउन्डमा १३ हात।</li>
    </ul>
    <h3>३. दहल (१०) नै मुख्य!</h3>
    <ul>
      <li>चार वटा १० लाई <b>दहल</b> भनिन्छ। दहल भएको हात जित्ने टिमले त्यो दहल पाउँछ।</li>
      <li>३ वा ४ दहल लिने टिमले राउन्ड जित्छ। २–२ भए धेरै हात जित्नेले जित्छ।</li>
    </ul>
    <h3>४. स्कोर र सिक्का</h3>
    <ul>
      <li>साधारण जित: <b>${p.normal}</b> अंक · <b>कोट</b> (चारै दहल): <b>${p.kot}</b> · <b>बाउन्ने</b> (सबै १३ हात): <b>${p.baunne}</b></li>
      <li>तपाईंको टिम जित्दा सिक्का 🪙: साधारण +${c.normal}, कोट +${c.kot}, बाउन्ने +${c.baunne}। सिक्काले नयाँ पत्ती डिजाइन खोल्न सकिन्छ।</li>
    </ul>
    <h3>५. तीन मोड (सेटिङ ⚙ मा)</h3>
    <ul>
      <li><b>साधारण:</b> तुरुप खुला छानिन्छ।</li>
      <li><b>बन्द हुकुम:</b> तुरुप लुकाइन्छ; कसैसँग रङ नभएपछि खुल्छ।</li>
      <li><b>कट हुकुम:</b> कसैले छान्दैन; रङ नभएर पहिलो खेलिएको पत्तीको रङ नै तुरुप।</li>
    </ul>
    <h3>स्क्रिनमा</h3>
    <ul>
      <li>पहेँलो किनारा भएका पत्ती मात्र खेल्न मिल्छ — थिच्नुहोस्।</li>
      <li>⚙ सेटिङ: भाषा, पत्ती डिजाइन, मोड, आवाज, नयाँ खेल।</li>
    </ul>`,
};

const neRom: Strings = {
  langName: 'Nepali (Roman)',
  htmlLang: 'ne-Latn',
  names: ['Tapaai', 'Gajendra', 'Sita', 'Ranjana'],
  partner: '(Saathi)',
  us: 'Hami',
  them: 'Uniharu',
  teamUs: 'Hamro team',
  teamThem: 'Uniharu',
  round: (n) => `Round ${n}`,
  trump: 'TURUP',
  dahal: 'Dahal',
  haat: 'Haat',
  dealer: 'Dealer',
  chooseTrump: 'TURUP chunnus',
  chooseTrumpSub: 'Tapaaiko 5 patti herera rang chunnus',
  chooseTrumpHidden: 'Lukeko TURUP chunnus 🔒',
  chooseTrumpHiddenSub: 'Aru le dekhdainan — kasaisanga rang nabhayepachhi khulchha',
  waitingTrump: (n) => `${n} TURUP chundai chha…`,
  yourTurnChooseTrump: 'Tapaaiko paalo: TURUP chunnus',
  trickWonBy: (n) => `${n} le haat jityo`,
  turnOf: (n) => `${n} ko paalo…`,
  yourTurnLead: 'Tapaaiko paalo — jun patti pani khelna milchha',
  yourTurnFollow: (s) => `Tapaaiko paalo — ${s} khelnu parchha`,
  yourTurnVoid: (s) => `Tapaaiko paalo — ${s} chhaina, TURUP ya jun sukai`,
  yourTurnVoidBand: (s) => `${s} chhaina — tapaai khelda lukeko TURUP khulchha!`,
  yourTurnVoidCut: (s) => `${s} chhaina — tapaaile kheleko patti ko rang nai TURUP banchha!`,
  toastTrumpChosen: (n, s) => `${n} le TURUP chunyo: ${s}`,
  toastTrumpHidden: (n) => `${n} le TURUP lukayera rakhyo 🔒`,
  toastReveal: (s) => `Hukum khulyo! TURUP: ${s}`,
  toastCut: (n, s) => `${n} le kaatyo! TURUP: ${s}`,
  toastDahal: (n, k) => `${n} le ${k} Dahal jityo!`,
  win: 'Jityo!',
  lose: 'Haryo',
  kot: 'KOT!',
  baunne: 'BAUNNE! (52)',
  roundWonBy: (t, p) => `${t} le round jityo (+${p})`,
  whyBaunne: 'Sabai 13 haat jityo!',
  whyKot: 'Chaarai Dahal (10) jityo!',
  whyTens: (n) => `${n} ota Dahal jityo`,
  whyTricks: (n) => `2–2 Dahal, dherai haat (${n}) jityo`,
  totalScore: 'Jamma score',
  nextRound: 'Arko round ▶',
  coinsEarned: (n) => `+${n} coin 🪙`,
  confirmReset: 'Naya khel suru garne? Score 0 hunchha.',
  settings: 'Setting',
  language: 'Bhasa',
  cardDesign: 'Patti ko design',
  gameMode: 'Khelne tarika (mode)',
  sound: 'Aawaj',
  on: 'Khulla',
  off: 'Banda',
  coins: 'Coin',
  unlockFor: (n) => `${n} 🪙 ma kholnus`,
  notEnoughCoins: (n) => `Ajhai ${n} coin chahinchha`,
  newGame: 'Naya khel',
  modes: {
    open: { name: 'Normal (khulla TURUP)', desc: 'Dealer pachhiko khelaadi le 5 patti herera TURUP chunchha, sabaile dekhchhan.' },
    bandHukum: { name: 'Band hukum', desc: 'TURUP lukayera chuninchha. Pahilo patak kasaisanga rang nabhayepachhi matra khulchha.' },
    cutHukum: { name: 'Cut hukum', desc: 'Kasaile TURUP chundaina. Rang nabhayera pahilo patak kheleko patti ko rang nai TURUP hunchha.' },
  },
  modeNextRound: 'Naya mode arko round dekhi laagu hunchha',
  modeNow: 'Naya mode ma patti pheri baadiyo',
  themes: { classic: 'Classic', blue: 'Nilo', dhaka: 'Dhaka', neon: 'Neon', gold: 'Shahi sunaulo' },
  background: 'Background (table)',
  backgrounds: { normal: 'Normal', gundri: 'Gundri (paral ko)', galaicha: 'Galaicha' },
  installApp: 'Phone ma app jastai raakhnus',
  installButton: '📲 App install garnus',
  installHint: 'Android Chrome: ⋮ menu → "Add to Home screen". iPhone Safari: Share ⬆ → "Add to Home Screen".',
  installed: '✔ App install bhaisakyo',
  howToPlay: 'Kasari khelne',
  credits: 'Banaune',
  close: 'Banda',
  info: 'Jaankari',
  creditsBy: 'Yo game banaune',
  creditsText:
    'Dahal Khani (Dahal Mara) Nepal ko paramparaagat taas khel ho, Bharat ko Mendikot / Dehla Pakad jastai. Yo browser prototype ho — tapaai 3 ota computer bot sanga khelnuhunchha.',
  chooseLanguage: 'Bhasa chunnus',
  rulesHtml: (p, c) => `
    <h2>Kasari khelne?</h2>
    <p><b>4 jana, 2 team.</b> Tapaai tala, tapaaiko saathi (Sita) maathi. Gajendra ra Ranjana arko team.</p>
    <h3>1. Patti baadne ra TURUP</h3>
    <ul>
      <li>52 patti, joker chhaina. Thulo dekhi saano: A K Q J 10 9 … 2.</li>
      <li>Suruma sabailai 5 patti. Dealer pachhiko khelaadi le 5 patti herera <b>TURUP</b> (rang) chunchha.</li>
      <li>Tyaspachhi 4 + 4 patti thapera sabaiko 13 patti hunchha. Dealer har round ghumchha.</li>
    </ul>
    <h3>2. Khelne niyam</h3>
    <ul>
      <li>TURUP chunne le pahilo <b>Haat</b> suru garchha.</li>
      <li>Suru gareko rang chha bhane tyahi khelnai parchha. Chhaina bhane jun sukai — TURUP le kaatna sakinchha.</li>
      <li>Sabai bhanda thulo TURUP le haat jitchha. TURUP chhaina bhane suru ko rang ko thulo patti le.</li>
      <li>Haat jitne le arko haat suru garchha. Ek round ma 13 haat.</li>
    </ul>
    <h3>3. Dahal (10) nai mukhya!</h3>
    <ul>
      <li>Chaar ota 10 lai <b>Dahal</b> bhaninchha. Dahal bhayeko haat jitne team le tyo Dahal paauchha.</li>
      <li>3 ya 4 Dahal line team le round jitchha. 2–2 bhaye dherai haat jitne le jitchha.</li>
    </ul>
    <h3>4. Score ra coin</h3>
    <ul>
      <li>Saadharan jit: <b>${p.normal}</b> point · <b>Kot</b> (chaarai Dahal): <b>${p.kot}</b> · <b>Baunne</b> (sabai 13 haat): <b>${p.baunne}</b></li>
      <li>Tapaaiko team jitda coin 🪙: normal +${c.normal}, Kot +${c.kot}, Baunne +${c.baunne}. Coin le naya patti design kholna sakinchha.</li>
    </ul>
    <h3>5. Tin ota mode (Setting ⚙ ma)</h3>
    <ul>
      <li><b>Normal:</b> TURUP khulla chuninchha.</li>
      <li><b>Band hukum:</b> TURUP lukaainchha; kasaisanga rang nabhayepachhi khulchha.</li>
      <li><b>Cut hukum:</b> kasaile chundaina; rang nabhayera pahilo kheleko patti ko rang nai TURUP.</li>
    </ul>
    <h3>Screen ma</h3>
    <ul>
      <li>Pahelo kinara bhayeko patti matra khelna milchha — thichnus.</li>
      <li>⚙ Setting: bhasa, patti design, mode, aawaj, naya khel.</li>
    </ul>`,
};

const en: Strings = {
  langName: 'English',
  htmlLang: 'en',
  names: ['You', 'Gajendra', 'Sita', 'Ranjana'],
  partner: '(Partner)',
  us: 'Us',
  them: 'Them',
  teamUs: 'Our team',
  teamThem: 'Opponents',
  round: (n) => `Round ${n}`,
  trump: 'TRUMP',
  dahal: 'Tens',
  haat: 'Tricks',
  dealer: 'Dealer',
  chooseTrump: 'Choose TRUMP',
  chooseTrumpSub: 'Look at your 5 cards and pick a suit',
  chooseTrumpHidden: 'Choose a secret TRUMP 🔒',
  chooseTrumpHiddenSub: 'Nobody else sees it — it is revealed when someone cannot follow suit',
  waitingTrump: (n) => `${n} is choosing trump…`,
  yourTurnChooseTrump: 'Your turn: choose TRUMP',
  trickWonBy: (n) => `${n} won the trick`,
  turnOf: (n) => `${n}'s turn…`,
  yourTurnLead: 'Your turn — play any card',
  yourTurnFollow: (s) => `Your turn — you must play ${s}`,
  yourTurnVoid: (s) => `Your turn — no ${s}, play trump or anything`,
  yourTurnVoidBand: (s) => `No ${s} — your card will reveal the secret trump!`,
  yourTurnVoidCut: (s) => `No ${s} — the suit you play becomes TRUMP!`,
  toastTrumpChosen: (n, s) => `${n} chose TRUMP: ${s}`,
  toastTrumpHidden: (n) => `${n} placed a secret trump 🔒`,
  toastReveal: (s) => `Trump revealed! TRUMP: ${s}`,
  toastCut: (n, s) => `${n} cut! TRUMP: ${s}`,
  toastDahal: (n, k) => `${n} captured ${k} ten${k > 1 ? 's' : ''} (Dahal)!`,
  win: 'You win!',
  lose: 'You lose',
  kot: 'KOT!',
  baunne: 'BAUNNE! (52)',
  roundWonBy: (t, p) => `${t} won the round (+${p})`,
  whyBaunne: 'Won all 13 tricks!',
  whyKot: 'Captured all four 10s!',
  whyTens: (n) => `Captured ${n} tens`,
  whyTricks: (n) => `Tens 2–2, more tricks (${n})`,
  totalScore: 'Total score',
  nextRound: 'Next round ▶',
  coinsEarned: (n) => `+${n} coins 🪙`,
  confirmReset: 'Start a new game? The score goes back to 0.',
  settings: 'Settings',
  language: 'Language',
  cardDesign: 'Card design',
  gameMode: 'Game mode',
  sound: 'Sound',
  on: 'On',
  off: 'Off',
  coins: 'Coins',
  unlockFor: (n) => `Unlock for ${n} 🪙`,
  notEnoughCoins: (n) => `You need ${n} more coins`,
  newGame: 'New game',
  modes: {
    open: { name: 'Normal (open trump)', desc: 'The player after the dealer looks at 5 cards and picks trump; everyone sees it.' },
    bandHukum: { name: 'Band hukum (hidden trump)', desc: 'Trump is chosen secretly and revealed the first time someone cannot follow suit.' },
    cutHukum: { name: 'Cut hukum', desc: 'Nobody picks trump. The first card played by someone who cannot follow suit sets the trump.' },
  },
  modeNextRound: 'The new mode starts next round',
  modeNow: 'Cards re-dealt in the new mode',
  themes: { classic: 'Classic', blue: 'Blue', dhaka: 'Dhaka', neon: 'Neon', gold: 'Royal gold' },
  background: 'Table background',
  backgrounds: { normal: 'Normal', gundri: 'Gundri (straw mat)', galaicha: 'Galaicha (carpet)' },
  installApp: 'Install as an app',
  installButton: '📲 Install app',
  installHint: 'Android Chrome: ⋮ menu → "Add to Home screen". iPhone Safari: Share ⬆ → "Add to Home Screen".',
  installed: '✔ App installed',
  howToPlay: 'How to play',
  credits: 'Credits',
  close: 'Close',
  info: 'Info',
  creditsBy: 'Game created by',
  creditsText:
    'Dahal Khani (Dahal Mara) is a traditional Nepali card game, similar to Mendikot / Dehla Pakad in India. This is a browser prototype — you play against 3 computer bots.',
  chooseLanguage: 'Choose language',
  rulesHtml: (p, c) => `
    <h2>How to play</h2>
    <p><b>4 players, 2 teams.</b> You sit at the bottom, your partner (Sita) at the top. Gajendra and Ranjana are the other team.</p>
    <h3>1. Dealing and TRUMP</h3>
    <ul>
      <li>52 cards, no jokers. High to low: A K Q J 10 9 … 2.</li>
      <li>Everyone gets 5 cards. The player after the dealer looks at them and picks the <b>TRUMP</b> suit.</li>
      <li>Then 4 + 4 more cards each, so everyone has 13. The dealer rotates every round.</li>
    </ul>
    <h3>2. Playing</h3>
    <ul>
      <li>The trump chooser leads the first trick.</li>
      <li>You must follow the suit that was led if you can. If not, play anything — a trump can cut.</li>
      <li>The highest trump wins the trick; with no trump, the highest card of the led suit.</li>
      <li>The trick winner leads next. 13 tricks per round.</li>
    </ul>
    <h3>3. The 10s (Dahal) matter most!</h3>
    <ul>
      <li>Win a trick containing a 10 and your team captures that <b>Dahal</b>.</li>
      <li>Capture 3 or 4 tens to win the round. At 2–2, the team with more tricks wins.</li>
    </ul>
    <h3>4. Score and coins</h3>
    <ul>
      <li>Normal win: <b>${p.normal}</b> point · <b>Kot</b> (all four 10s): <b>${p.kot}</b> · <b>Baunne</b> (all 13 tricks): <b>${p.baunne}</b></li>
      <li>When your team wins you earn coins 🪙: normal +${c.normal}, Kot +${c.kot}, Baunne +${c.baunne}. Spend coins to unlock card designs.</li>
    </ul>
    <h3>5. Three modes (in Settings ⚙)</h3>
    <ul>
      <li><b>Normal:</b> trump is chosen openly.</li>
      <li><b>Band hukum:</b> trump is hidden until someone cannot follow suit.</li>
      <li><b>Cut hukum:</b> nobody chooses; the first off-suit card played sets the trump.</li>
    </ul>
    <h3>On screen</h3>
    <ul>
      <li>Only cards with a yellow edge can be played — tap one.</li>
      <li>⚙ Settings: language, card design, mode, sound, new game.</li>
    </ul>`,
};

const ja: Strings = {
  langName: '日本語',
  htmlLang: 'ja',
  names: ['あなた', 'ガジェンドラ', 'シータ', 'ランジャナ'],
  partner: '(パートナー)',
  us: '味方',
  them: '相手',
  teamUs: '味方チーム',
  teamThem: '相手チーム',
  round: (n) => `ラウンド ${n}`,
  trump: '切り札',
  dahal: 'ダハル',
  haat: 'トリック',
  dealer: 'ディーラー',
  chooseTrump: '切り札を選んでください',
  chooseTrumpSub: '最初の5枚を見てスートを選びます',
  chooseTrumpHidden: '秘密の切り札を選ぶ 🔒',
  chooseTrumpHiddenSub: '他の人には見えません。誰かがスートを出せなくなった時に公開されます',
  waitingTrump: (n) => `${n}が切り札を選んでいます…`,
  yourTurnChooseTrump: 'あなたの番：切り札を選んでください',
  trickWonBy: (n) => `${n}がトリックを獲得`,
  turnOf: (n) => `${n}の番…`,
  yourTurnLead: 'あなたの番 — どのカードでも出せます',
  yourTurnFollow: (s) => `あなたの番 — ${s}を出してください`,
  yourTurnVoid: (s) => `あなたの番 — ${s}がないので切り札か任意のカード`,
  yourTurnVoidBand: (s) => `${s}がありません — 出すと秘密の切り札が公開されます！`,
  yourTurnVoidCut: (s) => `${s}がありません — 出したカードのスートが切り札になります！`,
  toastTrumpChosen: (n, s) => `${n}が切り札を選択：${s}`,
  toastTrumpHidden: (n) => `${n}が切り札を伏せました 🔒`,
  toastReveal: (s) => `切り札公開！ 切り札：${s}`,
  toastCut: (n, s) => `${n}がカット！ 切り札：${s}`,
  toastDahal: (n, k) => `${n}がダハル(10)を${k}枚獲得！`,
  win: '勝利！',
  lose: '敗北',
  kot: 'コット！',
  baunne: 'バウンネ！ (52)',
  roundWonBy: (t, p) => `${t}がラウンドに勝利 (+${p})`,
  whyBaunne: '13トリックすべて獲得！',
  whyKot: '4枚のダハル(10)をすべて獲得！',
  whyTens: (n) => `ダハルを${n}枚獲得`,
  whyTricks: (n) => `ダハル2対2、トリック数(${n})で勝利`,
  totalScore: '合計スコア',
  nextRound: '次のラウンド ▶',
  coinsEarned: (n) => `+${n} コイン 🪙`,
  confirmReset: '新しいゲームを始めますか？スコアは0に戻ります。',
  settings: '設定',
  language: '言語',
  cardDesign: 'カードデザイン',
  gameMode: 'ゲームモード',
  sound: 'サウンド',
  on: 'オン',
  off: 'オフ',
  coins: 'コイン',
  unlockFor: (n) => `${n} 🪙 で解放`,
  notEnoughCoins: (n) => `あと${n}コイン必要です`,
  newGame: '新しいゲーム',
  modes: {
    open: { name: 'ノーマル（公開切り札）', desc: 'ディーラーの次の人が最初の5枚を見て切り札を選び、全員に公開します。' },
    bandHukum: { name: 'バンド・フクム（秘密の切り札）', desc: '切り札は伏せて選ばれ、誰かが初めてスートを出せなくなった時に公開されます。' },
    cutHukum: { name: 'カット・フクム', desc: '誰も切り札を選びません。スートを出せない人が最初に出したカードのスートが切り札になります。' },
  },
  modeNextRound: '新しいモードは次のラウンドから適用されます',
  modeNow: '新しいモードで配り直しました',
  themes: { classic: 'クラシック', blue: 'ブルー', dhaka: 'ダカ', neon: 'ネオン', gold: 'ロイヤルゴールド' },
  background: 'テーブルの背景',
  backgrounds: { normal: 'ノーマル', gundri: 'グンドリ（わらのマット）', galaicha: 'ガライチャ（じゅうたん）' },
  installApp: 'アプリとしてインストール',
  installButton: '📲 アプリをインストール',
  installHint: 'Android Chrome：⋮ メニュー →「ホーム画面に追加」。iPhone Safari：共有 ⬆ →「ホーム画面に追加」。',
  installed: '✔ インストール済み',
  howToPlay: '遊び方',
  credits: 'クレジット',
  close: '閉じる',
  info: '情報',
  creditsBy: 'このゲームの作者',
  creditsText:
    'ダハル・カニ（ダハル・マラ）はネパールの伝統的なトランプゲームで、インドのメンディコート／デーラ・パカドに似ています。これはブラウザ版のプロトタイプで、3体のコンピューターと対戦します。',
  chooseLanguage: '言語を選択',
  rulesHtml: (p, c) => `
    <h2>遊び方</h2>
    <p><b>4人・2チーム。</b>あなたは下、パートナー（シータ）は上。ガジェンドラとランジャナが相手チームです。</p>
    <h3>1. 配札と切り札</h3>
    <ul>
      <li>ジョーカーなしの52枚。強い順：A K Q J 10 9 … 2。</li>
      <li>まず全員に5枚。ディーラーの次の人がその5枚を見て<b>切り札</b>（トゥルップ）のスートを選びます。</li>
      <li>その後4枚＋4枚を配り、全員13枚になります。ディーラーは毎ラウンド交代します。</li>
    </ul>
    <h3>2. 遊び方</h3>
    <ul>
      <li>切り札を選んだ人が最初のトリックをリードします。</li>
      <li>出されたスートを持っていれば必ず出します。なければ何でも出せます（切り札で切れます）。</li>
      <li>一番強い切り札がトリックを取ります。切り札がなければリードされたスートの最強カード。</li>
      <li>トリックを取った人が次をリード。1ラウンド13トリックです。</li>
    </ul>
    <h3>3. 10（ダハル）が一番大事！</h3>
    <ul>
      <li>10を含むトリックを取ると、そのチームが<b>ダハル</b>を獲得します。</li>
      <li>ダハルを3枚か4枚取ったチームの勝ち。2対2ならトリック数が多いチームの勝ちです。</li>
    </ul>
    <h3>4. スコアとコイン</h3>
    <ul>
      <li>通常の勝ち：<b>${p.normal}</b>点 · <b>コット</b>（10を4枚全部）：<b>${p.kot}</b>点 · <b>バウンネ</b>（13トリック全部）：<b>${p.baunne}</b>点</li>
      <li>味方チームが勝つとコイン 🪙 獲得：通常 +${c.normal}、コット +${c.kot}、バウンネ +${c.baunne}。コインで新しいカードデザインを解放できます。</li>
    </ul>
    <h3>5. 3つのモード（設定 ⚙）</h3>
    <ul>
      <li><b>ノーマル：</b>切り札を公開で選びます。</li>
      <li><b>バンド・フクム：</b>切り札は秘密。誰かがスートを出せなくなった時に公開。</li>
      <li><b>カット・フクム：</b>誰も選ばず、最初に出されたスート違いのカードが切り札を決めます。</li>
    </ul>
    <h3>画面</h3>
    <ul>
      <li>黄色い枠のカードだけ出せます。タップしてください。</li>
      <li>⚙ 設定：言語、カードデザイン、モード、サウンド、新しいゲーム。</li>
    </ul>`,
};

export const STRINGS: Record<Lang, Strings> = { ne, neRom, en, ja };
