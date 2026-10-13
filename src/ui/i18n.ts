// All on-screen text in 4 languages. Add a language by adding one more entry to STRINGS.
import type { PointValues, TrumpMode } from '../engine';
import type { QUICK_MESSAGES } from '../online/protocol';
import type { FatalReason } from './online';
import type { BackgroundId, ThemeId } from './themes';

export type Lang = 'ne' | 'neRom' | 'en' | 'ja';
export const LANGS: readonly Lang[] = ['ne', 'neRom', 'en', 'ja'];

export interface CoinValues {
  lostWithTwoTens: number;
  winOnTricks: number;
  winThreeTens: number;
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
  kotAgainst: string;
  baunneAgainst: string;
  whyKotAgainst: string;
  whyBaunneAgainst: string;
  flawless: string;
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
  allRules: string;
  say: Record<(typeof QUICK_MESSAGES)[number], string>;
  sayTitle: string;
  animations: string;
  animationsHint: string;
  online: string;
  playOnline: string;
  onlineIntro: string;
  yourName: string;
  createRoom: string;
  orJoin: string;
  roomCode: string;
  join: string;
  lobbyTitle: string;
  shareInvite: string;
  copied: string;
  inviteText: (code: string) => string;
  invitePassword: (password: string) => string;
  createSection: string;
  joinSection: string;
  roomName: string;
  roomNamePlaceholder: (name: string) => string;
  password: string;
  passwordOptional: string;
  publicHint: string;
  roomNumber: string;
  openRooms: string;
  refresh: string;
  noRooms: string;
  playersCount: (n: number, free: number) => string;
  inGame: string;
  inLobby: string;
  enterPasswordFor: (room: string) => string;
  publicTag: string;
  privateTag: string;
  teamA: string;
  teamB: string;
  emptySeat: string;
  sitHere: string;
  hostTag: string;
  botTag: string;
  youTag: string;
  awayTag: string;
  botsFill: string;
  startGame: string;
  waitingHost: string;
  leaveRoom: string;
  connecting: string;
  reconnecting: string;
  onlineUnavailable: string;
  modeHostOnly: string;
  onlineErrors: Record<FatalReason | 'illegal' | 'bad_request' | 'not_host' | 'started' | 'rate_limited', string>;
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
  kot: 'कोट लगाइयो! 🎉',
  baunne: 'बाउन्ने! (५२)',
  roundWonBy: (t, p) => `${t}ले राउन्ड जित्यो (+${p})`,
  whyBaunne: 'सबै १३ हात जित्यो!',
  whyKot: 'चारै दहल हाम्रो कब्जामा! 💪',
  kotAgainst: 'कोट लाग्यो! 😱',
  baunneAgainst: 'बाउन्ने लाग्यो! 😵',
  whyKotAgainst: 'उनीहरूले चारै दहल लगे…',
  whyBaunneAgainst: 'उनीहरूले सबै ५२ पत्ती लगे…',
  flawless: 'शानदार! पूर्ण विजय! 👑',
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
  allRules: 'सबै नियम',
  say: {
    fast: 'छिटो खेल्नुहोस्! ⏩',
    nicePlay: 'कस्तो राम्रो चाल! 👏',
    good: 'राम्रो!',
    interesting: 'रोचक! 🤔',
    wellDone: 'स्याबास साथी!',
    lucky: 'भाग्यले साथ दियो! 🍀',
    thanks: 'धन्यवाद! 🙏',
    sorry: 'माफ गर्नुहोस्!',
    gg: 'राम्रो खेल भयो! 🤝',
    again: 'अर्को राउन्ड! 🔁',
  },
  sayTitle: 'प्रतिक्रिया र सन्देश',
  animations: 'एनिमेसन',
  animationsHint: 'पत्ती बाँडेको, फालेको र हात उठाएको एनिमेसन',
  online: 'अनलाइन',
  playOnline: '🌐 साथीसँग अनलाइन खेल्नुहोस्',
  onlineIntro: 'खुला रुममा जानुहोस्, वा आफ्नै रुम (पासवर्ड सहित वा बिना) बनाएर नम्बर साथीलाई पठाउनुहोस्। खाली सिटमा बोट खेल्छ।',
  yourName: 'तपाईंको नाम',
  createRoom: 'नयाँ रुम बनाउनुहोस्',
  orJoin: 'वा साथीको रुममा जानुहोस्',
  roomCode: 'रुम नम्बर',
  join: 'जोडिनुहोस्',
  lobbyTitle: 'रुम',
  shareInvite: '📤 साथीलाई लिंक पठाउनुहोस्',
  copied: 'लिंक कपी भयो!',
  inviteText: (code) => `दहल खानी खेल्न आऊ! रुम नम्बर: ${code}`,
  invitePassword: (pw) => `पासवर्ड: ${pw}`,
  createSection: 'नयाँ रुम बनाउनुहोस्',
  joinSection: 'रुम नम्बर र पासवर्डले जानुहोस्',
  roomName: 'रुमको नाम',
  roomNamePlaceholder: (n) => `${n}को रुम`,
  password: 'पासवर्ड',
  passwordOptional: 'पासवर्ड (चाहिए मात्र)',
  publicHint: 'पासवर्ड नराखे पब्लिक रुम हुन्छ — जो पनि आउन सक्छ।',
  roomNumber: 'रुम नम्बर',
  openRooms: 'खुला रुमहरू',
  refresh: '↻ फेरि हेर्नुहोस्',
  noRooms: 'अहिले कुनै खुला रुम छैन। आफैं बनाउनुहोस्!',
  playersCount: (n, f) => `${n} जना · ${f} सिट खाली`,
  inGame: 'खेल चल्दै',
  inLobby: 'पर्खँदै',
  enterPasswordFor: (r) => `"${r}" को पासवर्ड हाल्नुहोस्`,
  publicTag: 'पब्लिक',
  privateTag: '🔒 पासवर्ड',
  teamA: 'टिम क',
  teamB: 'टिम ख',
  emptySeat: 'खाली',
  sitHere: 'यहाँ बस्नुहोस्',
  hostTag: 'होस्ट',
  botTag: 'बोट',
  youTag: 'तपाईं',
  awayTag: 'बाहिर',
  botsFill: 'खाली सिटमा बोट खेल्छ।',
  startGame: '▶ खेल सुरु गर्नुहोस्',
  waitingHost: 'होस्टले खेल सुरु गर्ने प्रतीक्षा…',
  leaveRoom: '🚪 रुम छोड्नुहोस्',
  connecting: 'जोडिँदै…',
  reconnecting: 'फेरि जोडिँदै…',
  onlineUnavailable: 'अनलाइन सर्भर अहिले उपलब्ध छैन।',
  modeHostOnly: 'अनलाइनमा होस्टले रुममै मोड छान्छ।',
  onlineErrors: {
    not_found: 'रुम भेटिएन। कोड जाँच्नुहोस्।',
    room_full: 'रुम भरिसक्यो।',
    wrong_password: 'पासवर्ड मिलेन।',
    too_many_attempts: 'धेरै पटक गलत पासवर्ड। १० मिनेटपछि फेरि प्रयास गर्नुहोस्।',
    network: 'सर्भरसँग जोड्न सकिएन। इन्टरनेट जाँच्नुहोस्।',
    replaced: 'यो सिट अर्को ट्याब वा फोनमा खोलियो।',
    illegal: 'यो चाल मिलेन।',
    bad_request: 'केही गडबड भयो।',
    not_host: 'होस्टले मात्र गर्न मिल्छ।',
    started: 'खेल सुरु भइसक्यो।',
    rate_limited: 'धेरै छिटो! अलि पर्खनुहोस्।',
  },
  howToPlay: 'कसरी खेल्ने',
  credits: 'बनाउने',
  close: 'बन्द',
  info: 'जानकारी',
  creditsBy: 'यो खेल बनाउने',
  creditsText:
    'दहल खानी (दहल मारा, दहल जित) नेपालको परम्परागत तास खेल हो, भारतको मेन्डीकोट / देहला पकड जस्तै। अफलाइनमा ३ वटा बोटसँग, वा अनलाइनमा साथीहरूसँग खेल्नुहोस् — खाली सिटमा बोट बस्छ।',
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
      <li>सिक्का 🪙: हात धेरै लिएर जित +${c.winOnTricks}, ३ दहल लिएर जित +${c.winThreeTens}, कोट +${c.kot}, बाउन्ने (५२ पत्ती) +${c.baunne}। २ दहल लिएर हारे पनि +${c.lostWithTwoTens}; अरू हारमा ०। सिक्काले नयाँ पत्ती डिजाइन खोल्न सकिन्छ।</li>
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
  kot: 'KOT LAGAAYO! 🎉',
  baunne: 'BAUNNE! (52)',
  roundWonBy: (t, p) => `${t} le round jityo (+${p})`,
  whyBaunne: 'Sabai 13 haat jityo!',
  whyKot: 'Chaarai Dahal hamro kabja ma! 💪',
  kotAgainst: 'KOT LAGYO! 😱',
  baunneAgainst: 'BAUNNE LAGYO! 😵',
  whyKotAgainst: 'Uniharu le chaarai Dahal lage…',
  whyBaunneAgainst: 'Uniharu le sabai 52 patti lage…',
  flawless: 'SHAANDAAR! PURNA BIJAY! 👑',
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
  allRules: 'Sabai niyam',
  say: {
    fast: 'Chhito khelnus! ⏩',
    nicePlay: 'Kasto ramro chaal! 👏',
    good: 'Ramro!',
    interesting: 'Rochak! 🤔',
    wellDone: 'Syaabaas saathi!',
    lucky: 'Bhagya le saath diyo! 🍀',
    thanks: 'Dhanyabad! 🙏',
    sorry: 'Maaf garnus!',
    gg: 'Ramro khel bhayo! 🤝',
    again: 'Arko round! 🔁',
  },
  sayTitle: 'Reaction ra message',
  animations: 'Animation',
  animationsHint: 'Patti baadeko, phaaleko ra haat uthaaeko animation',
  online: 'Online',
  playOnline: '🌐 Saathi sanga online khelnus',
  onlineIntro: 'Khulla room ma jaanus, wa aafnai room (password sahit wa bina) banayera number saathi lai pathaunus. Khaali seat ma bot khelchha.',
  yourName: 'Tapaaiko naam',
  createRoom: 'Naya room banaunus',
  orJoin: 'Wa saathi ko room ma jaanus',
  roomCode: 'Room number',
  join: 'Jodinus',
  lobbyTitle: 'Room',
  shareInvite: '📤 Saathi lai link pathaunus',
  copied: 'Link copy bhayo!',
  inviteText: (code) => `Dahal Khani khelna aau! Room number: ${code}`,
  invitePassword: (pw) => `Password: ${pw}`,
  createSection: 'Naya room banaunus',
  joinSection: 'Room number ra password le jaanus',
  roomName: 'Room ko naam',
  roomNamePlaceholder: (n) => `${n} ko room`,
  password: 'Password',
  passwordOptional: 'Password (chahiye bhane matra)',
  publicHint: 'Password narakhe public room hunchha — jo pani aauna sakchha.',
  roomNumber: 'Room number',
  openRooms: 'Khulla room haru',
  refresh: '↻ Pheri hernus',
  noRooms: 'Ahile kunai khulla room chhaina. Aafai banaunus!',
  playersCount: (n, f) => `${n} jana · ${f} seat khaali`,
  inGame: 'Khel chaldai',
  inLobby: 'Parkhindai',
  enterPasswordFor: (r) => `"${r}" ko password haalnus`,
  publicTag: 'Public',
  privateTag: '🔒 Password',
  teamA: 'Team A',
  teamB: 'Team B',
  emptySeat: 'Khaali',
  sitHere: 'Yaha basnus',
  hostTag: 'Host',
  botTag: 'Bot',
  youTag: 'Tapaai',
  awayTag: 'Bahira',
  botsFill: 'Khaali seat ma bot khelchha.',
  startGame: '▶ Khel suru garnus',
  waitingHost: 'Host le khel suru garne parkhai…',
  leaveRoom: '🚪 Room chhodnus',
  connecting: 'Jodindai…',
  reconnecting: 'Pheri jodindai…',
  onlineUnavailable: 'Online server ahile chhaina.',
  modeHostOnly: 'Online ma host le room mai mode chhanchha.',
  onlineErrors: {
    not_found: 'Room bhetiyena. Code check garnus.',
    room_full: 'Room bharisakyo.',
    wrong_password: 'Password milena.',
    too_many_attempts: 'Dherai patak galat password. 10 minute pachhi pheri garnus.',
    network: 'Server sanga jodna sakiyena. Internet check garnus.',
    replaced: 'Yo seat arko tab wa phone ma kholiyo.',
    illegal: 'Yo chaal milena.',
    bad_request: 'Kehi gadbad bhayo.',
    not_host: 'Host le matra garna milchha.',
    started: 'Khel suru bhaisakyo.',
    rate_limited: 'Dherai chhito! Ali parkhanus.',
  },
  howToPlay: 'Kasari khelne',
  credits: 'Banaune',
  close: 'Banda',
  info: 'Jaankari',
  creditsBy: 'Yo game banaune',
  creditsText:
    'Dahal Khani (Dahal Mara, Dahal Jeet) Nepal ko paramparaagat taas khel ho, Bharat ko Mendikot / Dehla Pakad jastai. Offline ma 3 ota bot sanga, wa online ma saathi haru sanga khelnus — khaali seat ma bot baschha.',
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
      <li>Coin 🪙: haat badhi khaayera jit +${c.winOnTricks}, 3 Dahal khaayera jit +${c.winThreeTens}, Kot +${c.kot}, Baunne (52 patti) +${c.baunne}. 2 Dahal khaayera hare pani +${c.lostWithTwoTens}; aru haar ma 0. Coin le naya patti design kholna sakinchha.</li>
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
  kot: 'KOT! 🎉',
  baunne: 'BAUNNE! (52)',
  roundWonBy: (t, p) => `${t} won the round (+${p})`,
  whyBaunne: 'Won all 13 tricks!',
  whyKot: 'All four 10s are ours! 💪',
  kotAgainst: 'KOT AGAINST YOU! 😱',
  baunneAgainst: 'BAUNNE AGAINST YOU! 😵',
  whyKotAgainst: 'They took all four 10s…',
  whyBaunneAgainst: 'They took all 52 cards…',
  flawless: 'FLAWLESS VICTORY! 👑',
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
  allRules: 'All rules',
  say: {
    fast: 'Play faster! ⏩',
    nicePlay: 'Nice play! 👏',
    good: 'Good!',
    interesting: 'Interesting! 🤔',
    wellDone: 'Well done, partner!',
    lucky: 'Lucky! 🍀',
    thanks: 'Thanks! 🙏',
    sorry: 'Sorry!',
    gg: 'Good game! 🤝',
    again: 'One more round! 🔁',
  },
  sayTitle: 'Reactions & messages',
  animations: 'Animations',
  animationsHint: 'Dealing, card throws and trick pick-up',
  online: 'Online',
  playOnline: '🌐 Play online with friends',
  onlineIntro: 'Join an open room, or create your own (with or without a password) and send the number to friends. Bots fill empty seats.',
  yourName: 'Your name',
  createRoom: 'Create a room',
  orJoin: "Or join a friend's room",
  roomCode: 'Room number',
  join: 'Join',
  lobbyTitle: 'Room',
  shareInvite: '📤 Send link to friends',
  copied: 'Link copied!',
  inviteText: (code) => `Come play Dahal Khani! Room number: ${code}`,
  invitePassword: (pw) => `Password: ${pw}`,
  createSection: 'Create a room',
  joinSection: 'Join with room number and password',
  roomName: 'Room name',
  roomNamePlaceholder: (n) => `${n}'s room`,
  password: 'Password',
  passwordOptional: 'Password (optional)',
  publicHint: 'Without a password the room is public — anyone can join.',
  roomNumber: 'Room number',
  openRooms: 'Open rooms',
  refresh: '↻ Refresh',
  noRooms: 'No open rooms right now. Create one!',
  playersCount: (n, f) => `${n} playing · ${f} seat${f === 1 ? '' : 's'} free`,
  inGame: 'In game',
  inLobby: 'Waiting',
  enterPasswordFor: (r) => `Enter the password for "${r}"`,
  publicTag: 'Public',
  privateTag: '🔒 Password',
  teamA: 'Team A',
  teamB: 'Team B',
  emptySeat: 'Empty',
  sitHere: 'Sit here',
  hostTag: 'Host',
  botTag: 'Bot',
  youTag: 'You',
  awayTag: 'Away',
  botsFill: 'Bots play in empty seats.',
  startGame: '▶ Start game',
  waitingHost: 'Waiting for the host to start…',
  leaveRoom: '🚪 Leave room',
  connecting: 'Connecting…',
  reconnecting: 'Reconnecting…',
  onlineUnavailable: 'The online server is not available right now.',
  modeHostOnly: 'Online, the host picks the mode in the room.',
  onlineErrors: {
    not_found: 'Room not found. Check the code.',
    room_full: 'The room is full.',
    wrong_password: 'Wrong password.',
    too_many_attempts: 'Too many wrong passwords. Try again in 10 minutes.',
    network: 'Could not reach the server. Check your internet.',
    replaced: 'This seat was opened in another tab or phone.',
    illegal: "That move isn't allowed.",
    bad_request: 'Something went wrong.',
    not_host: 'Only the host can do that.',
    started: 'The game has already started.',
    rate_limited: 'Too fast! Please wait a moment.',
  },
  howToPlay: 'How to play',
  credits: 'Credits',
  close: 'Close',
  info: 'Info',
  creditsBy: 'Game created by',
  creditsText:
    'Dahal Khani (also Dahal Mara or Dahal Jeet) is a traditional Nepali card game, similar to Mendikot / Dehla Pakad in India. Play offline against 3 bots, or online with friends — bots fill any empty seats.',
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
      <li>Coins 🪙: win on tricks +${c.winOnTricks}, win with 3 tens +${c.winThreeTens}, Kot +${c.kot}, Baunne (all 52 cards) +${c.baunne}. Losing with 2 tens still gives +${c.lostWithTwoTens}; other losses 0. Spend coins to unlock card designs.</li>
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
  kot: 'コット達成！ 🎉',
  baunne: 'バウンネ！ (52)',
  roundWonBy: (t, p) => `${t}がラウンドに勝利 (+${p})`,
  whyBaunne: '13トリックすべて獲得！',
  whyKot: '10を4枚すべて手に入れた！ 💪',
  kotAgainst: 'コットされた！ 😱',
  baunneAgainst: 'バウンネされた！ 😵',
  whyKotAgainst: '10を4枚すべて取られた…',
  whyBaunneAgainst: '52枚すべて取られた…',
  flawless: '完全勝利！ 👑',
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
  allRules: '全ルール',
  say: {
    fast: '早く出して！ ⏩',
    nicePlay: 'ナイスプレイ！ 👏',
    good: 'いいね！',
    interesting: '面白い！ 🤔',
    wellDone: 'さすがパートナー！',
    lucky: 'ラッキー！ 🍀',
    thanks: 'ありがとう！ 🙏',
    sorry: 'ごめん！',
    gg: 'いい試合だった！ 🤝',
    again: 'もう1ラウンド！ 🔁',
  },
  sayTitle: 'リアクションとメッセージ',
  animations: 'アニメーション',
  animationsHint: '配札・カードを出す・トリックを取る動き',
  online: 'オンライン',
  playOnline: '🌐 友達とオンライン対戦',
  onlineIntro: '公開中のルームに参加するか、自分のルーム（パスワードあり・なし）を作って番号を友達に送ってください。空いた席はボットが担当します。',
  yourName: 'あなたの名前',
  createRoom: 'ルームを作成',
  orJoin: '友達のルームに参加',
  roomCode: 'ルーム番号',
  join: '参加',
  lobbyTitle: 'ルーム',
  shareInvite: '📤 友達にリンクを送る',
  copied: 'リンクをコピーしました！',
  inviteText: (code) => `ダハル・カニで遊ぼう！ ルーム番号：${code}`,
  invitePassword: (pw) => `パスワード：${pw}`,
  createSection: 'ルームを作成',
  joinSection: 'ルーム番号とパスワードで参加',
  roomName: 'ルーム名',
  roomNamePlaceholder: (n) => `${n}のルーム`,
  password: 'パスワード',
  passwordOptional: 'パスワード（任意）',
  publicHint: 'パスワードなしなら公開ルームになり、誰でも参加できます。',
  roomNumber: 'ルーム番号',
  openRooms: '公開中のルーム',
  refresh: '↻ 更新',
  noRooms: '今は公開中のルームがありません。作ってみましょう！',
  playersCount: (n, f) => `${n}人プレイ中 · 空席${f}`,
  inGame: 'ゲーム中',
  inLobby: '待機中',
  enterPasswordFor: (r) => `「${r}」のパスワードを入力`,
  publicTag: '公開',
  privateTag: '🔒 パスワード',
  teamA: 'チームA',
  teamB: 'チームB',
  emptySeat: '空席',
  sitHere: 'ここに座る',
  hostTag: 'ホスト',
  botTag: 'ボット',
  youTag: 'あなた',
  awayTag: '離席',
  botsFill: '空席はボットがプレイします。',
  startGame: '▶ ゲーム開始',
  waitingHost: 'ホストの開始を待っています…',
  leaveRoom: '🚪 ルームを出る',
  connecting: '接続中…',
  reconnecting: '再接続中…',
  onlineUnavailable: 'オンラインサーバーは現在利用できません。',
  modeHostOnly: 'オンラインではホストがルームでモードを選びます。',
  onlineErrors: {
    not_found: 'ルームが見つかりません。コードを確認してください。',
    room_full: 'ルームは満員です。',
    wrong_password: 'パスワードが違います。',
    too_many_attempts: 'パスワードの間違いが多すぎます。10分後にもう一度お試しください。',
    network: 'サーバーに接続できません。インターネットを確認してください。',
    replaced: 'この席は別のタブまたはスマホで開かれました。',
    illegal: 'その手は出せません。',
    bad_request: '問題が発生しました。',
    not_host: 'ホストだけが操作できます。',
    started: 'ゲームはすでに始まっています。',
    rate_limited: '速すぎます！少し待ってください。',
  },
  howToPlay: '遊び方',
  credits: 'クレジット',
  close: '閉じる',
  info: '情報',
  creditsBy: 'このゲームの作者',
  creditsText:
    'ダハル・カニ（ダハル・マラ、ダハル・ジート）はネパールの伝統的なトランプゲームで、インドのメンディコート／デーラ・パカドに似ています。オフラインではボット3体と、オンラインでは友達と遊べます（空席はボットが担当）。',
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
      <li>コイン 🪙：トリック数で勝ち +${c.winOnTricks}、ダハル3枚で勝ち +${c.winThreeTens}、コット +${c.kot}、バウンネ（52枚すべて）+${c.baunne}。ダハル2枚で負けても +${c.lostWithTwoTens}、その他の負けは0。コインでカードデザインを解放できます。</li>
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
