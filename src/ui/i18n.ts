// All on-screen text in 4 languages. Add a language by adding one more entry to STRINGS.
import type { PointValues, TrumpMode } from '../engine';
import { COIN_PENALTIES } from '../settings';
import type { QUICK_MESSAGES } from '../online/protocol';
import type { FatalReason } from './online';
import type { TourStepId } from './tour';
import type { FeedbackKind } from '../online/feedback';
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
  coinsLost: (n: number) => string;
  botLevel: string;
  botLevelHint: string;
  botLevelOnline: string;
  levels: Record<'easy' | 'medium' | 'hard', { name: string; desc: string }>;
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
  feedbackSection: string;
  feedbackOpen: string;
  feedbackTitle: string;
  feedbackKinds: Record<FeedbackKind, string>;
  feedbackPlaceholder: Record<FeedbackKind, string>;
  feedbackContact: string;
  feedbackIncludeInfo: string;
  feedbackPrivacy: (creator: string) => string;
  feedbackSend: string;
  feedbackSent: string;
  feedbackEmpty: string;
  feedbackTooMany: string;
  feedbackFailed: string;
  onlineTab: string;
  kick: string;
  kickConfirm: (name: string) => string;
  closeRoom: string;
  closeRoomConfirm: string;
  liveTitle: (n: number) => string;
  nameTitle: string;
  nameHint: string;
  namePlaceholder: string;
  nameRequired: string;
  continueBtn: string;
  tourSkip: string;
  tourNext: string;
  tourBack: string;
  tourStart: string;
  replayGuide: string;
  tour: Record<TourStepId, { title: string; body: string }>;
  say: Record<(typeof QUICK_MESSAGES)[number], string>;
  sayTitle: string;
  /** button that shows only the previous trick, for a few seconds */
  lastTrick: string;
  /** status line while the previous trick is shown: who won it and with which card */
  peekStatus: (name: string, card: string) => string;
  /** tooltip on the AI tag of a computer player */
  aiBot: string;
  /** tooltip on the temporary AI tag of someone whose connection dropped */
  aiStandIn: string;
  /** tooltip on the green dot of a connected player */
  onlineNow: string;
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
  waitingTrump: (n) => `${n} तुरुप छान्दै हुनुहुन्छ…`,
  yourTurnChooseTrump: 'तपाईंको पालो: तुरुप छान्नुहोस्',
  trickWonBy: (n) => `${n}ले हात जित्नुभयो`,
  turnOf: (n) => `${n}को पालो…`,
  yourTurnLead: 'तपाईंको पालो — जुनसुकै पत्ती खेल्न मिल्छ',
  yourTurnFollow: (s) => `तपाईंको पालो — ${s} खेल्नुपर्छ`,
  yourTurnVoid: (s) => `तपाईंको पालो — ${s} छैन, तुरुप वा जुनसुकै`,
  yourTurnVoidBand: (s) => `${s} छैन — तपाईंले खेल्दा लुकेको तुरुप खुल्छ!`,
  yourTurnVoidCut: (s) => `${s} छैन — तपाईंले खेलेको पत्तीको रङ नै तुरुप बन्छ!`,
  toastTrumpChosen: (n, s) => `${n}ले तुरुप छान्नुभयो: ${s}`,
  toastTrumpHidden: (n) => `${n}ले तुरुप लुकाएर राख्नुभयो 🔒`,
  toastReveal: (s) => `हुकुम खुल्यो! तुरुप: ${s}`,
  toastCut: (n, s) => `${n}ले काट्नुभयो! तुरुप: ${s}`,
  toastDahal: (n, k) => `${n}ले ${k} दहल जित्नुभयो!`,
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
  coinsLost: (n) => `-${n} सिक्का 🪙 (कट/बाउन्ने खाएकोले)`,
  botLevel: 'बोटको स्तर',
  botLevelHint: 'बोटहरू कति तेज खेल्छन् — अफलाइन खेलमा लागू हुन्छ।',
  botLevelOnline: 'अनलाइन कोठामा बोटको स्तर कोठाको होस्टले छान्छ।',
  levels: {
    easy: { name: 'सजिलो', desc: 'पुरानै जस्तो सरल खेल। नयाँ खेलाडीका लागि राम्रो।' },
    medium: { name: 'मध्यम', desc: 'को कुन पत्ती राख्यो भनी अनुमान लगाउँछ, तर पछिल्ला ३ हात मात्र सम्झन्छ।' },
    hard: { name: 'कठिन', desc: 'खेलिएका सबै पत्ती सम्झन्छ, कसको रङ सकियो थाहा पाउँछ र बाँकी पत्ती कसँग छ भनी अनुमान गरेर खेल्छ।' },
  },
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
  feedbackSection: '💌 समस्या, सुझाव वा धन्यवाद',
  feedbackOpen: '📝 खेल बनाउनेलाई लेख्नुहोस्',
  feedbackTitle: '💌 हामीलाई लेख्नुहोस्',
  feedbackKinds: { problem: '🐞 समस्या', idea: '💡 सुझाव', thanks: '🙏 धन्यवाद' },
  feedbackPlaceholder: {
    problem: 'के भयो? कहिले भयो? (जस्तै: "कोटपछि पत्ती अड्कियो")',
    idea: 'के थप्दा राम्रो हुन्छ? आफ्नो सुझाव लेख्नुहोस्…',
    thanks: 'राम्रो लागेको कुरा लेख्नुहोस्… 😊',
  },
  feedbackContact: 'इमेल वा फोन (जवाफ चाहिए मात्र)',
  feedbackIncludeInfo: 'फोन र खेलको जानकारी पनि पठाउने (समस्या बुझ्न सजिलो हुन्छ)',
  feedbackPrivacy: (c) => `यो सन्देश खेल बनाउने ${c}ले मात्र पढ्नुहुन्छ। अरू खेलाडीले देख्दैनन्।`,
  feedbackSend: '📨 पठाउनुहोस्',
  feedbackSent: 'धन्यवाद! 🙏 तपाईंको सन्देश पुग्यो।',
  feedbackEmpty: 'कृपया केही लेख्नुहोस्।',
  feedbackTooMany: 'धेरै सन्देश पठाइसक्नुभयो। अलि पछि फेरि गर्नुहोस्।',
  feedbackFailed: 'पठाउन सकिएन। इन्टरनेट जाँचेर फेरि गर्नुहोस्।',
  onlineTab: 'अनलाइन',
  kick: 'निकाल्नुहोस्',
  kickConfirm: (n) => `${n}लाई रुमबाट निकाल्ने?`,
  closeRoom: 'रुम बन्द गर्नुहोस्',
  closeRoomConfirm: 'रुम बन्द गर्ने? सबै जना बाहिर जान्छन् र रुम मेटिन्छ।',
  liveTitle: (n) => `${n} जना अहिले अनलाइन`,
  nameTitle: 'तपाईंको नाम के हो?',
  nameHint: 'अनलाइन खेल्दा साथीहरूले यही नाम देख्छन्। छोटो नाम (क, ख, a, b) पनि हुन्छ।',
  namePlaceholder: 'नाम लेख्नुहोस्',
  nameRequired: 'कृपया नाम लेख्नुहोस् — केही न केही लेख्नैपर्छ।',
  continueBtn: 'अगाडि बढ्नुहोस् ▶',
  tourSkip: 'छोड्नुहोस्',
  tourNext: 'अर्को ▶',
  tourBack: '◀ पछाडि',
  tourStart: 'खेल सुरु गरौं! 🎉',
  replayGuide: '🎓 गाइड फेरि हेर्नुहोस्',
  tour: {
    welcome: {
      title: 'दहल खानीमा स्वागत छ! 🙏',
      body: '४ जना, २ टिम। तपाईं तल, तपाईंको साथी माथि — एउटै टिम। लक्ष्य: <b>१० (दहल)</b> हरू जित्ने। ३ वा ४ दहल लिने टिमले राउन्ड जित्छ।',
    },
    hand: {
      title: '🃏 तपाईंका पत्ती',
      body: '<b>पहेँलो किनारा</b> भएका पत्ती मात्र खेल्न मिल्छ — थिच्नुहोस्। पत्तीमाथिको पहेँलो लेखले कसको पालो र के खेल्नुपर्छ भन्छ।',
    },
    score: {
      title: '📊 स्कोर',
      body: '<b>दहल ●●○○</b> ले कति वटा १० लियो, <b>हात</b> ले कति हात जित्यो देखाउँछ। बायाँ: हाम्रो टिम · दायाँ: उनीहरू।',
    },
    trump: {
      title: '♠ तुरुप',
      body: 'तुरुपको रङ सबैभन्दा बलियो। चालिएको रङ छैन भने तुरुपले काट्न सकिन्छ।',
    },
    coins: {
      title: '🪙 सिक्का',
      body: 'हरेक राउन्डपछि सिक्का पाइन्छ:<br>• हारे पनि २ दहल: <b>+५</b><br>• हात धेरैले जित: <b>+१०</b><br>• ३ दहलले जित: <b>+२०</b><br>• कोट: <b>+३०</b> · बाउन्ने (५२ पत्ती): <b>+४०</b><br>सिक्काले ⚙ सेटिङमा नयाँ पत्ती डिजाइन, टेबल ब्याकग्राउन्ड र बन्द/कट हुकुम मोड खोल्न मिल्छ।',
    },
    online: {
      title: '🌐 अनलाइन',
      body: 'साथीसँग खेल्न: <b>रुम बनाउनुहोस्</b> (पासवर्ड राख्न मिल्छ) वा <b>रुम नम्बर</b> हालेर जानुहोस्। खुला रुमको सूची पनि छ। खाली सिटमा बोट खेल्छ।<br>🌐 छेउको हरियो <b>●</b> र नम्बरले अहिले कति जना खेल खोलेर बसेका छन् भन्छ।',
    },
    chat: {
      title: '💬 प्रतिक्रिया र सन्देश',
      body: 'अनलाइन खेल्दा पत्तीको दायाँ 💬 थिचेर 👍 😂 😢 🙌 वा "कस्तो राम्रो चाल!" जस्ता सन्देश पठाउन मिल्छ। चिट नहोस् भनेर टाइप गर्न मिल्दैन। <b>बोटसँग खेल्दा यो हुँदैन।</b>',
    },
    info: {
      title: 'ⓘ जानकारी',
      body: 'कसरी खेल्ने, सबै नियम र खेल बनाउनेको नाम यहाँ छ। यो गाइड फेरि हेर्न पनि यहीँबाट मिल्छ।',
    },
    settings: {
      title: '⚙ सेटिङ',
      body: 'भाषा, आवाज, एनिमेसन, खेलको मोड (साधारण / बन्द हुकुम / कट हुकुम), पत्ती डिजाइन, टेबल पृष्ठभूमि, एप इन्स्टल र नयाँ खेल — सबै यहाँ।',
    },
    done: {
      title: 'तयार! 🎉',
      body: 'राम्रो खेल! पहिलो राउन्डमा तुरुप तपाईं आफैं छान्नुहुन्छ।',
    },
  },
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
  lastTrick: 'पछिल्लो हात',
  peekStatus: (n, c) => `🕘 पछिल्लो हात: ${n}ले ${c} खेलेर जित्नुभयो`,
  aiBot: 'कम्प्युटर (AI) खेलाडी',
  aiStandIn: 'नेट गयो — अहिले AI ले खेल्दैछ',
  onlineNow: 'अनलाइन छ',
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
    room_closed: 'होस्टले रुम बन्द गर्नुभयो।',
    kicked: 'होस्टले तपाईंलाई रुमबाट निकाल्नुभयो।',
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
      <li><b>तुरुप भनेको?</b> त्यो राउन्डको सबैभन्दा बलियो रङ — तुरुपको सानो २ ले पनि अरू रङको A लाई काट्छ। अङ्ग्रेजीमा <b>trump</b>; कतै <b>हुकुम</b> वा <b>रङ</b> पनि भनिन्छ।</li>
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
      <li>सिक्का 🪙: हात धेरै लिएर जित +${c.winOnTricks}, ३ दहल लिएर जित +${c.winThreeTens}, कोट +${c.kot}, बाउन्ने (५२ पत्ती) +${c.baunne}। २ दहल लिएर हारे पनि +${c.lostWithTwoTens}; अरू हारमा ०। ${COIN_PENALTIES.minCoins}+ सिक्का हुँदा कोटले हारे −${COIN_PENALTIES.kot}, बाउन्नेले हारे −${COIN_PENALTIES.baunne}। सिक्काले नयाँ पत्ती डिजाइन, ब्याकग्राउन्ड र बन्द हुकुम (१०) / कट हुकुम (२०) मोड खोल्न सकिन्छ।</li>
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
  waitingTrump: (n) => `${n} TURUP chundai hunuhunchha…`,
  yourTurnChooseTrump: 'Tapaaiko paalo: TURUP chunnus',
  trickWonBy: (n) => `${n} le haat jitnu bhayo`,
  turnOf: (n) => `${n} ko paalo…`,
  yourTurnLead: 'Tapaaiko paalo — jun patti pani khelna milchha',
  yourTurnFollow: (s) => `Tapaaiko paalo — ${s} khelnu parchha`,
  yourTurnVoid: (s) => `Tapaaiko paalo — ${s} chhaina, TURUP ya jun sukai`,
  yourTurnVoidBand: (s) => `${s} chhaina — tapaai khelda lukeko TURUP khulchha!`,
  yourTurnVoidCut: (s) => `${s} chhaina — tapaaile kheleko patti ko rang nai TURUP banchha!`,
  toastTrumpChosen: (n, s) => `${n} le TURUP chunnu bhayo: ${s}`,
  toastTrumpHidden: (n) => `${n} le TURUP lukayera raakhnu bhayo 🔒`,
  toastReveal: (s) => `Hukum khulyo! TURUP: ${s}`,
  toastCut: (n, s) => `${n} le kaatnu bhayo! TURUP: ${s}`,
  toastDahal: (n, k) => `${n} le ${k} Dahal jitnu bhayo!`,
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
  coinsLost: (n) => `-${n} coin 🪙 (kot/baunne khayera)`,
  botLevel: 'Bot ko star',
  botLevelHint: 'Botharu kati tez khelchhan — offline khel ma laagu hunchha.',
  botLevelOnline: 'Online kotha ma bot ko star kotha ko host le chunchha.',
  levels: {
    easy: { name: 'Sajilo', desc: 'Purano jastai saral khel. Naya khelaadi ko lagi ramro.' },
    medium: { name: 'Madhyam', desc: 'Ko ko sanga kun patti chha anuman garchhan, tara pachhillo 3 haat matra samjhanchhan.' },
    hard: { name: 'Kathin', desc: 'Khelieka sabai patti samjhanchhan, kasko rang sakiyo thaha paunchhan ra baaki patti kasanga chha anuman garera khelchhan.' },
  },
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
  feedbackSection: '💌 Problem, sujhaab wa dhanyabad',
  feedbackOpen: '📝 Game banaune lai lekhnus',
  feedbackTitle: '💌 Hamilai lekhnus',
  feedbackKinds: { problem: '🐞 Problem', idea: '💡 Sujhaab', thanks: '🙏 Dhanyabad' },
  feedbackPlaceholder: {
    problem: 'Ke bhayo? Kahile bhayo? (jastai: "Kot pachhi patti atkiyo")',
    idea: 'Ke thapda ramro hunchha? Aafno sujhaab lekhnus…',
    thanks: 'Ramro laageko kura lekhnus… 😊',
  },
  feedbackContact: 'Email wa phone (jawaf chahiye bhane matra)',
  feedbackIncludeInfo: 'Phone ra game ko jaankari pani pathaaune (problem bujhna sajilo hunchha)',
  feedbackPrivacy: (c) => `Yo sandesh game banaune ${c} le matra padhnuhunchha. Aru player le dekhdainan.`,
  feedbackSend: '📨 Pathaunus',
  feedbackSent: 'Dhanyabad! 🙏 Tapaaiko sandesh pugyo.',
  feedbackEmpty: 'Kripaya kehi lekhnus.',
  feedbackTooMany: 'Dherai sandesh pathaisaknubhayo. Ali pachhi pheri garnus.',
  feedbackFailed: 'Pathauna sakiyena. Internet check garera pheri garnus.',
  onlineTab: 'Online',
  kick: 'Nikaalnus',
  kickConfirm: (n) => `${n} lai room bata nikaalne?`,
  closeRoom: 'Room band garnus',
  closeRoomConfirm: 'Room band garne? Sabai jana baahira jaanchhan ra room metinchha.',
  liveTitle: (n) => `${n} jana ahile online`,
  nameTitle: 'Tapaaiko naam ke ho?',
  nameHint: 'Online khelda saathi haru le yahi naam dekhchhan. Chhoto naam (a, b, c) pani hunchha.',
  namePlaceholder: 'Naam lekhnus',
  nameRequired: 'Kripaya naam lekhnus — kehi na kehi lekhnai parchha.',
  continueBtn: 'Agaadi badhnus ▶',
  tourSkip: 'Skip',
  tourNext: 'Arko ▶',
  tourBack: '◀ Pachhi',
  tourStart: 'Khel suru garaun! 🎉',
  replayGuide: '🎓 Guide pheri hernus',
  tour: {
    welcome: {
      title: 'Dahal Khani ma swagat chha! 🙏',
      body: '4 jana, 2 team. Tapaai tala, tapaaiko saathi maathi — eutai team. Lakshya: <b>10 (Dahal)</b> haru jitne. 3 ya 4 Dahal line team le round jitchha.',
    },
    hand: {
      title: '🃏 Tapaaika patti',
      body: '<b>Pahelo kinara</b> bhayeko patti matra khelna milchha — thichnus. Patti mathi ko pahelo lekh le kasko paalo ho ra ke khelnu parchha bhanchha.',
    },
    score: {
      title: '📊 Score',
      body: '<b>Dahal ●●○○</b> le kati ota 10 liyo, <b>Haat</b> le kati haat jityo dekhaauchha. Baayaa: hamro team · Daayaa: uniharu.',
    },
    trump: {
      title: '♠ TURUP',
      body: 'TURUP ko rang sabai bhanda baliyo. Chaaleko rang chhaina bhane TURUP le kaatna sakinchha.',
    },
    coins: {
      title: '🪙 Coin',
      body: 'Har round pachhi coin paainchha:<br>• Hare pani 2 Dahal: <b>+5</b><br>• Haat badhi le jit: <b>+10</b><br>• 3 Dahal le jit: <b>+20</b><br>• Kot: <b>+30</b> · Baunne (52 patti): <b>+40</b><br>Coin le ⚙ Setting ma naya patti design, table background ra Band/Cut hukum mode kholna milchha.',
    },
    online: {
      title: '🌐 Online',
      body: 'Saathi sanga khelna: <b>room banaunus</b> (password rakhna milchha) wa <b>room number</b> haalera jaanus. Khulla room ko list pani chha. Khaali seat ma bot khelchha.<br>🌐 chheu ko hariyo <b>●</b> ra number le ahile kati jana game kholera baseka chhan bhanchha.',
    },
    chat: {
      title: '💬 Reaction ra sandesh',
      body: 'Online khelda patti ko daayaa 💬 thichera 👍 😂 😢 🙌 wa "Kasto ramro chaal!" jasta sandesh pathauna milchha. Cheat nahos bhanera type garna mildaina. <b>Bot sanga khelda yo hudaina.</b>',
    },
    info: {
      title: 'ⓘ Jaankari',
      body: 'Kasari khelne, sabai niyam ra game banaune ko naam yaha chha. Yo guide pheri herna pani yahi bata milchha.',
    },
    settings: {
      title: '⚙ Setting',
      body: 'Bhasa, aawaj, animation, khel ko mode (Normal / Band hukum / Cut hukum), patti design, table background, app install ra naya khel — sabai yaha.',
    },
    done: {
      title: 'Tayar! 🎉',
      body: 'Ramro khel! Pahilo round ma TURUP tapaaile nai chunnuhunchha.',
    },
  },
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
  lastTrick: 'Pachhillo haat',
  peekStatus: (n, c) => `🕘 Pachhillo haat: ${n} le ${c} khelera jitnu bhayo`,
  aiBot: 'Computer (AI) khelaadi',
  aiStandIn: 'Net gayo — ahile AI le kheldai chha',
  onlineNow: 'Online chha',
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
    room_closed: 'Host le room band garnubhayo.',
    kicked: 'Host le tapaailai room bata nikaalnubhayo.',
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
      <li><b>TURUP bhaneko?</b> Tyo round ko sabai bhanda baliyo rang — TURUP ko saano 2 le pani aru rang ko A lai kaatchha. English ma <b>trump</b>; katai <b>hukum</b> wa <b>rang</b> pani bhaninchha.</li>
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
      <li>Coin 🪙: haat badhi khaayera jit +${c.winOnTricks}, 3 Dahal khaayera jit +${c.winThreeTens}, Kot +${c.kot}, Baunne (52 patti) +${c.baunne}. 2 Dahal khaayera hare pani +${c.lostWithTwoTens}; aru haar ma 0. ${COIN_PENALTIES.minCoins}+ coin huda Kot le hare −${COIN_PENALTIES.kot}, Baunne le hare −${COIN_PENALTIES.baunne}. Coin le naya patti design, background ra Band hukum (10) / Cut hukum (20) mode kholna sakinchha.</li>
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
  coinsLost: (n) => `-${n} coins 🪙 (lost a Kot / Baunne)`,
  botLevel: 'Bot level',
  botLevelHint: 'How well the bots play — applies to offline games.',
  botLevelOnline: 'In online rooms the host picks the bot level.',
  levels: {
    easy: { name: 'Easy', desc: 'Simple rules of thumb, like before. Good for learning.' },
    medium: { name: 'Medium', desc: 'Guesses who holds which cards, but only remembers the last 3 tricks.' },
    hard: { name: 'Hard', desc: 'Remembers every card played, notices who ran out of a suit and guesses the hidden hands before each move.' },
  },
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
  feedbackSection: '💌 Problems, ideas or thanks',
  feedbackOpen: '📝 Write to the creator',
  feedbackTitle: '💌 Write to us',
  feedbackKinds: { problem: '🐞 Problem', idea: '💡 Idea', thanks: '🙏 Thanks' },
  feedbackPlaceholder: {
    problem: 'What happened, and when? (e.g. "cards got stuck after a Kot")',
    idea: 'What would make the game better? Share your idea…',
    thanks: 'Tell us what you enjoyed… 😊',
  },
  feedbackContact: 'Email or phone (only if you want a reply)',
  feedbackIncludeInfo: 'Include device and game details (helps fix problems)',
  feedbackPrivacy: (c) => `Only the creator, ${c}, reads this. Other players never see it.`,
  feedbackSend: '📨 Send',
  feedbackSent: 'Thank you! 🙏 Your message has arrived.',
  feedbackEmpty: 'Please write something.',
  feedbackTooMany: 'You have sent several messages already. Please try again a bit later.',
  feedbackFailed: 'Could not send. Check your internet and try again.',
  onlineTab: 'Online',
  kick: 'Remove',
  kickConfirm: (n) => `Remove ${n} from the room?`,
  closeRoom: 'Close room',
  closeRoomConfirm: 'Close the room? Everyone will be sent out and the room deleted.',
  liveTitle: (n) => `${n} online now`,
  nameTitle: "What's your name?",
  nameHint: 'Friends see this name when you play online. A short one (a, b, c) is fine.',
  namePlaceholder: 'Your name',
  nameRequired: 'Please enter a name — anything is fine, but it can’t be empty.',
  continueBtn: 'Continue ▶',
  tourSkip: 'Skip',
  tourNext: 'Next ▶',
  tourBack: '◀ Back',
  tourStart: "Let's play! 🎉",
  replayGuide: '🎓 Show the guide again',
  tour: {
    welcome: {
      title: 'Welcome to Dahal Khani! 🙏',
      body: '4 players, 2 teams. You sit at the bottom, your partner at the top. The goal: win the <b>10s (Dahal)</b>. The team that captures 3 or 4 tens wins the round.',
    },
    hand: {
      title: '🃏 Your cards',
      body: 'Only cards with a <b>yellow edge</b> can be played — tap one. The yellow line above your cards says whose turn it is and what you must play.',
    },
    score: {
      title: '📊 Score',
      body: '<b>Tens ●●○○</b> shows how many 10s each team has, <b>Tricks</b> how many tricks. Left: your team · Right: opponents.',
    },
    trump: {
      title: '♠ TRUMP',
      body: 'The trump suit beats every other suit. If you can’t follow the suit that was led, you may cut with a trump.',
    },
    coins: {
      title: '🪙 Coins',
      body: 'You earn coins after every round:<br>• Lost but took 2 tens: <b>+5</b><br>• Won on tricks: <b>+10</b><br>• Won with 3 tens: <b>+20</b><br>• Kot: <b>+30</b> · Baunne (all 52 cards): <b>+40</b><br>• With 50+ coins, losing to a Kot costs <b>−10</b>, to a Baunne <b>−20</b><br>Spend them in ⚙ Settings to unlock card designs, table backgrounds and the Band / Cut hukum modes.',
    },
    online: {
      title: '🌐 Online',
      body: 'Play with friends: <b>create a room</b> (optionally with a password) or join with a <b>room number</b>. There is also a list of open rooms. Bots fill empty seats.<br>The green <b>●</b> and number next to 🌐 show how many people have the game open right now.',
    },
    chat: {
      title: '💬 Reactions & messages',
      body: 'In online games, tap 💬 next to your cards to send 👍 😂 😢 🙌 or messages like "Nice play!". There is no typing, so nobody can cheat. <b>Not available when playing with bots.</b>',
    },
    info: {
      title: 'ⓘ Info',
      body: 'How to play, all the rules, and who made the game. You can open this guide again from here too.',
    },
    settings: {
      title: '⚙ Settings',
      body: 'Language, sound, animations, game mode (Normal / Band hukum / Cut hukum), card designs, table background, install as an app, and new game.',
    },
    done: {
      title: "You're ready! 🎉",
      body: 'Have a good game! In the first round you choose the trump.',
    },
  },
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
  lastTrick: 'Last trick',
  peekStatus: (n, c) => `🕘 Last trick — ${n} won it with ${c}`,
  aiBot: 'Computer (AI) player',
  aiStandIn: 'Disconnected — the AI is playing for now',
  onlineNow: 'Online',
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
    room_closed: 'The host closed the room.',
    kicked: 'The host removed you from the room.',
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
      <li><b>What is “Turup”?</b> The Nepali word for <b>trump</b>: the strongest suit for that round — even a trump 2 beats an Ace of any other suit. Some places also call it <b>hukum</b> or <b>rang</b>.</li>
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
      <li>Coins 🪙: win on tricks +${c.winOnTricks}, win with 3 tens +${c.winThreeTens}, Kot +${c.kot}, Baunne (all 52 cards) +${c.baunne}. Losing with 2 tens still gives +${c.lostWithTwoTens}; other losses 0. With ${COIN_PENALTIES.minCoins}+ coins, losing to a Kot costs −${COIN_PENALTIES.kot} and to a Baunne −${COIN_PENALTIES.baunne}. Spend coins to unlock card designs, backgrounds and the Band hukum (10) / Cut hukum (20) modes.</li>
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
  coinsLost: (n) => `-${n}コイン 🪙 (コット/バウンネで負け)`,
  botLevel: 'ボットのレベル',
  botLevelHint: 'ボットの強さ。オフライン対戦に適用されます。',
  botLevelOnline: 'オンラインのルームでは、ホストがボットのレベルを選びます。',
  levels: {
    easy: { name: 'かんたん', desc: 'これまで通りのシンプルな打ち方。練習向き。' },
    medium: { name: 'ふつう', desc: '誰がどのカードを持つか推測しますが、直近3トリックしか覚えていません。' },
    hard: { name: 'むずかしい', desc: '出たカードをすべて覚え、スートが切れた人を見抜き、見えない手札を推測して打ちます。' },
  },
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
  feedbackSection: '💌 不具合・提案・お礼',
  feedbackOpen: '📝 作者にメッセージを送る',
  feedbackTitle: '💌 メッセージを送る',
  feedbackKinds: { problem: '🐞 不具合', idea: '💡 提案', thanks: '🙏 お礼' },
  feedbackPlaceholder: {
    problem: '何が、いつ起きましたか？（例：「コットの後にカードが止まった」）',
    idea: 'どうすればもっと良くなりますか？アイデアを書いてください…',
    thanks: '楽しかったことを教えてください… 😊',
  },
  feedbackContact: 'メールまたは電話（返信が必要な場合のみ）',
  feedbackIncludeInfo: '端末とゲームの情報も送る（不具合の調査に役立ちます）',
  feedbackPrivacy: (c) => `このメッセージは作者の${c}だけが読みます。他のプレイヤーには見えません。`,
  feedbackSend: '📨 送信',
  feedbackSent: 'ありがとうございます！ 🙏 メッセージが届きました。',
  feedbackEmpty: '何か書いてください。',
  feedbackTooMany: 'すでに何件か送信済みです。少し時間をおいてからお試しください。',
  feedbackFailed: '送信できませんでした。インターネットを確認してもう一度お試しください。',
  onlineTab: 'オンライン',
  kick: '退出させる',
  kickConfirm: (n) => `${n}をルームから退出させますか？`,
  closeRoom: 'ルームを閉じる',
  closeRoomConfirm: 'ルームを閉じますか？全員が退出し、ルームは削除されます。',
  liveTitle: (n) => `現在${n}人がオンライン`,
  nameTitle: 'お名前は？',
  nameHint: 'オンライン対戦で友達に表示される名前です。短い名前（a、b など）でもOK。',
  namePlaceholder: '名前を入力',
  nameRequired: '名前を入力してください（何か1文字以上）。',
  continueBtn: '次へ ▶',
  tourSkip: 'スキップ',
  tourNext: '次へ ▶',
  tourBack: '◀ 戻る',
  tourStart: 'さあ遊ぼう！ 🎉',
  replayGuide: '🎓 ガイドをもう一度見る',
  tour: {
    welcome: {
      title: 'ダハル・カニへようこそ！ 🙏',
      body: '4人・2チーム。あなたは下、パートナーは上で同じチームです。目標は<b>10（ダハル）</b>を取ること。3枚か4枚取ったチームがラウンドに勝ちます。',
    },
    hand: {
      title: '🃏 あなたの手札',
      body: '<b>黄色い枠</b>のカードだけ出せます。タップしてください。手札の上の黄色い文字が、誰の番か・何を出すべきかを教えてくれます。',
    },
    score: {
      title: '📊 スコア',
      body: '<b>ダハル ●●○○</b> は取った10の数、<b>トリック</b> は取ったトリック数です。左：味方チーム · 右：相手チーム。',
    },
    trump: {
      title: '♠ 切り札',
      body: '切り札のスートは他のどのスートより強いです。リードされたスートがなければ切り札で切れます。',
    },
    coins: {
      title: '🪙 コイン',
      body: '毎ラウンド後にコインがもらえます：<br>• 負けてもダハル2枚：<b>+5</b><br>• トリック数で勝ち：<b>+10</b><br>• ダハル3枚で勝ち：<b>+20</b><br>• コット：<b>+30</b> · バウンネ（52枚すべて）：<b>+40</b><br>⚙ 設定でカードデザイン、テーブル背景、バンド／カット・フクムモードの解放に使えます。',
    },
    online: {
      title: '🌐 オンライン',
      body: '友達と遊ぶには<b>ルームを作成</b>（パスワードも設定可）するか、<b>ルーム番号</b>で参加します。公開ルームの一覧もあります。空席はボットが担当します。<br>🌐 の横の緑の <b>●</b> と数字は、今ゲームを開いている人数です。',
    },
    chat: {
      title: '💬 リアクションとメッセージ',
      body: 'オンライン対戦中は手札の右の 💬 から 👍 😂 😢 🙌 や「ナイスプレイ！」などを送れます。不正防止のため文字入力はできません。<b>ボットとの対戦では使えません。</b>',
    },
    info: {
      title: 'ⓘ 情報',
      body: '遊び方、全ルール、作者の名前はここにあります。このガイドもここからもう一度見られます。',
    },
    settings: {
      title: '⚙ 設定',
      body: '言語、サウンド、アニメーション、ゲームモード（ノーマル／バンド・フクム／カット・フクム）、カードデザイン、テーブル背景、アプリのインストール、新しいゲーム。',
    },
    done: {
      title: '準備完了！ 🎉',
      body: 'いいゲームを！最初のラウンドではあなたが切り札を選びます。',
    },
  },
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
  lastTrick: '直前のトリック',
  peekStatus: (n, c) => `🕘 直前のトリック — ${n}が${c}で獲得`,
  aiBot: 'コンピューター（AI）プレイヤー',
  aiStandIn: '接続が切れました — 今はAIがプレイ中',
  onlineNow: 'オンライン',
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
    room_closed: 'ホストがルームを閉じました。',
    kicked: 'ホストによってルームから退出させられました。',
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
      <li><b>「トゥルップ」とは？</b>ネパール語で<b>切り札</b>（英語の trump）のこと。そのラウンドで一番強いスートで、切り札の2でも他のスートのAに勝ちます。地域によっては<b>フクム</b>や<b>ラング</b>とも呼ばれます。（日本語の「トランプ」はカード一式の意味なので注意！）</li>
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
      <li>コイン 🪙：トリック数で勝ち +${c.winOnTricks}、ダハル3枚で勝ち +${c.winThreeTens}、コット +${c.kot}、バウンネ（52枚すべて）+${c.baunne}。ダハル2枚で負けても +${c.lostWithTwoTens}、その他の負けは0。コインが${COIN_PENALTIES.minCoins}枚以上のとき、コットで負けると −${COIN_PENALTIES.kot}、バウンネで負けると −${COIN_PENALTIES.baunne}。コインでカードデザイン、背景、バンド・フクム（10）／カット・フクム（20）モードを解放できます。</li>
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
