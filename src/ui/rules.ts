// Complete rules ("Sabai niyam") shown in the ⓘ dialog, in every language.
import type { PointValues } from '../engine';
import { TIMING } from '../online/room';
import type { CoinValues, Lang } from './i18n';

const AFK = TIMING.afk / 1000;

type RulesFn = (p: PointValues, c: CoinValues) => string;

const ne: RulesFn = (p, c) => `
  <h2>सबै नियम</h2>
  <h3>१. नाम</h3>
  <p><b>दहल खानी</b> — यसलाई <b>दहल मारा</b> र <b>दहल जित</b> पनि भनिन्छ। भारतको मेन्डीकोट / देहला पकड जस्तै खेल।</p>
  <h3>२. खेलाडी र टिम</h3>
  <ul>
    <li>४ जना, २ टिम। साथी आमनेसामने बस्छन्।</li>
    <li>पालो घडीको उल्टो दिशामा घुम्छ (तपाईंपछि दायाँको खेलाडी)।</li>
  </ul>
  <h3>३. पत्ती</h3>
  <ul>
    <li>५२ पत्ती, जोकर छैन। ठूलोदेखि सानो: A K Q J 10 9 8 7 6 5 4 3 2।</li>
    <li>चारै रङ बराबर — तुरुप मात्र अरूभन्दा बलियो।</li>
  </ul>
  <h3>४. बाँड्ने</h3>
  <ul>
    <li>डिलरपछिको खेलाडीबाट सुरु गरेर सबैलाई ५ पत्ती।</li>
    <li>तुरुप तय भएपछि ४ र फेरि ४ पत्ती — सबैको १३।</li>
    <li>हरेक राउन्डमा डिलर एक सिट अगाडि सर्छ।</li>
  </ul>
  <h3>५. तुरुप (तीन मोड)</h3>
  <p><b>तुरुप भनेको:</b> त्यो राउन्डको सबैभन्दा बलियो रङ। तुरुपको जुनसुकै पत्ती (२ पनि) ले अरू रङको जुनसुकै पत्ती (A पनि) लाई काट्छ। अङ्ग्रेजीमा <b>trump</b>; ठाउँअनुसार <b>हुकुम</b> वा <b>रङ</b> पनि भनिन्छ।</p>
  <ul>
    <li><b>साधारण:</b> डिलरपछिको खेलाडीले आफ्ना ५ पत्ती हेरेर तुरुप छान्छ; सबैले देख्छन्।</li>
    <li><b>बन्द हुकुम:</b> त्यही खेलाडीले तुरुप लुकाएर छान्छ। पहिलो पटक कसैसँग चालिएको रङ नभएपछि तुरुप खुल्छ र त्यहीबाट तुरुपले काम गर्छ। खुल्नुअघिका हात साधारण रूपमा गनिन्छन्।</li>
    <li><b>कट हुकुम:</b> कसैले छान्दैन; सुरुमै १३ पत्ती बाँडिन्छ। चालिएको रङ नभएर पहिलो पटक खेलिएको पत्तीको रङ नै तुरुप हुन्छ (त्यो पत्ती पनि तुरुप गनिन्छ)।</li>
  </ul>
  <h3>६. खेल्ने</h3>
  <ul>
    <li>पहिलो हात तुरुप छान्नेले सुरु गर्छ (कट हुकुममा डिलरपछिको खेलाडीले)।</li>
    <li>चालिएको रङ छ भने त्यही खेल्नैपर्छ।</li>
    <li>छैन भने जुनसुकै पत्ती — तुरुपले काट्न वा अरू फाल्न सकिन्छ।</li>
    <li>हात जित्ने: सबैभन्दा ठूलो तुरुप; तुरुप नभए चालिएको रङको सबैभन्दा ठूलो पत्ती।</li>
    <li>हात जित्नेले अर्को हात चाल्छ। एक राउन्डमा १३ हात।</li>
  </ul>
  <h3>७. दहल (१०) र राउन्ड जित</h3>
  <ul>
    <li>चार वटा १० = दहल। दहल भएको हात जित्ने टिमले दहल लिन्छ।</li>
    <li>३ वा ४ दहल लिने टिमले राउन्ड जित्छ।</li>
    <li>२–२ भयो भने धेरै हात (७ वा बढी) जित्ने टिमले जित्छ। १३ बिजोर भएकाले बराबरी हुँदैन।</li>
  </ul>
  <h3>८. कोट, बाउन्ने र अंक</h3>
  <ul>
    <li>साधारण जित: <b>${p.normal}</b> अंक।</li>
    <li><b>कोट</b> — एउटै टिमले चारै दहल: <b>${p.kot}</b> अंक।</li>
    <li><b>बाउन्ने</b> (५२) — एउटै टिमले सबै १३ हात: <b>${p.baunne}</b> अंक।</li>
    <li>अंक राउन्डैपिच्छे जोडिँदै जान्छ; जति मन लाग्छ खेल्नुहोस्।</li>
  </ul>
  <h3>९. सिक्का (यो एपमा)</h3>
  <ul>
    <li>हारे पनि २ दहल लिएको भए (हात थोरै भएर हारेको): +${c.lostWithTwoTens}। अरू हारमा ०।</li>
    <li>हात धेरै लिएर जित: +${c.winOnTricks} · ३ दहल लिएर जित: +${c.winThreeTens}</li>
    <li>कोट लगाएर जित: +${c.kot} · बाउन्ने (सबै ५२ पत्ती): +${c.baunne} — सबैभन्दा धेरै, "पूर्ण विजय" उत्सवसहित!</li>
    <li>सिक्काले नयाँ पत्ती डिजाइन, टेबल ब्याकग्राउन्ड र बन्द हुकुम (१०) / कट हुकुम (२०) मोड खोल्न सकिन्छ। नयाँ खेलाडी साधारण मोडबाट सुरु गर्छन्। सिक्का यही ब्राउजरमा सेभ हुन्छ।</li>
  </ul>
  <h3>१०. अनलाइन खेल</h3>
  <ul>
    <li>रुम बनाएर कोड वा लिंक साथीलाई पठाउनुहोस्। पहिलो दुई जना साथी (एउटै टिम) हुन्छन्।</li>
    <li>खाली सिटमा बोट खेल्छ। होस्टले मोड छान्छ र खेल सुरु गर्छ।</li>
    <li>खेल चल्दै गर्दा नयाँ साथी आए बोटको ठाउँ लिन्छ।</li>
    <li>इन्टरनेट गयो भने तपाईंको पालो बोटले खेल्छ; फर्केपछि आफ्नै सिटमा जोडिनुहुन्छ।</li>
    <li>${AFK} सेकेन्डसम्म नखेले आफैं चाल चलिन्छ।</li>
  </ul>
  <p class="muted">ठाउँअनुसार नियम अलि फरक हुन सक्छ — यो एपले माथिका नियम मान्छ।</p>`;

const neRom: RulesFn = (p, c) => `
  <h2>Sabai niyam</h2>
  <h3>1. Naam</h3>
  <p><b>Dahal Khani</b> — yaslai <b>Dahal Mara</b> ra <b>Dahal Jeet</b> pani bhaninchha. Bharat ko Mendikot / Dehla Pakad jastai khel.</p>
  <h3>2. Khelaadi ra team</h3>
  <ul>
    <li>4 jana, 2 team. Saathi aamne-saamne baschhan.</li>
    <li>Paalo ghadi ko ulto disha ma ghumchha (tapaai pachhi daayaa ko khelaadi).</li>
  </ul>
  <h3>3. Patti</h3>
  <ul>
    <li>52 patti, joker chhaina. Thulo dekhi saano: A K Q J 10 9 8 7 6 5 4 3 2.</li>
    <li>Chaarai rang baraabar — TURUP matra aru bhanda baliyo.</li>
  </ul>
  <h3>4. Baadne</h3>
  <ul>
    <li>Dealer pachhiko khelaadi bata suru garera sabailai 5 patti.</li>
    <li>TURUP tay bhayepachhi 4 ra pheri 4 patti — sabaiko 13.</li>
    <li>Har round ma dealer ek seat agaadi sarchha.</li>
  </ul>
  <h3>5. TURUP (tin mode)</h3>
  <p><b>TURUP bhaneko:</b> tyo round ko sabai bhanda baliyo rang. TURUP ko jun sukai patti (2 pani) le aru rang ko jun sukai patti (A pani) lai kaatchha. English ma <b>trump</b>; thaau anusaar <b>hukum</b> wa <b>rang</b> pani bhaninchha.</p>
  <ul>
    <li><b>Normal:</b> dealer pachhiko khelaadi le aafna 5 patti herera TURUP chunchha; sabaile dekhchhan.</li>
    <li><b>Band hukum:</b> tyahi khelaadi le TURUP lukayera chunchha. Pahilo patak kasaisanga chaaleko rang nabhayepachhi TURUP khulchha ra tyahi bata TURUP le kaam garchha. Khulnu aghi ka haat saadharan rup ma ganinchhan.</li>
    <li><b>Cut hukum:</b> kasaile chundaina; suru mai 13 patti baadinchha. Chaaleko rang nabhayera pahilo patak kheleko patti ko rang nai TURUP hunchha (tyo patti pani TURUP ganinchha).</li>
  </ul>
  <h3>6. Khelne</h3>
  <ul>
    <li>Pahilo haat TURUP chunne le suru garchha (cut hukum ma dealer pachhiko khelaadi le).</li>
    <li>Chaaleko rang chha bhane tyahi khelnai parchha.</li>
    <li>Chhaina bhane jun sukai patti — TURUP le kaatna wa aru phaalna sakinchha.</li>
    <li>Haat jitne: sabai bhanda thulo TURUP; TURUP nabhaye chaaleko rang ko sabai bhanda thulo patti.</li>
    <li>Haat jitne le arko haat chaalchha. Ek round ma 13 haat.</li>
  </ul>
  <h3>7. Dahal (10) ra round jit</h3>
  <ul>
    <li>Chaar ota 10 = Dahal. Dahal bhayeko haat jitne team le Dahal linchha.</li>
    <li>3 ya 4 Dahal line team le round jitchha.</li>
    <li>2–2 bhayo bhane dherai haat (7 ya badhi) jitne team le jitchha. 13 bijor bhayekale baraabari hudaina.</li>
  </ul>
  <h3>8. Kot, Baunne ra point</h3>
  <ul>
    <li>Saadharan jit: <b>${p.normal}</b> point.</li>
    <li><b>Kot</b> — euta team le chaarai Dahal: <b>${p.kot}</b> point.</li>
    <li><b>Baunne</b> (52) — euta team le sabai 13 haat: <b>${p.baunne}</b> point.</li>
    <li>Point round pichhe jodindai jaanchha; jati man laagchha khelnus.</li>
  </ul>
  <h3>9. Coin (yo app ma)</h3>
  <ul>
    <li>Hare pani 2 Dahal khaayeko bhaye (haat thorai bhayera hareko): +${c.lostWithTwoTens}. Aru haar ma 0.</li>
    <li>Haat badhi khaayera jit: +${c.winOnTricks} · 3 Dahal khaayera jit: +${c.winThreeTens}</li>
    <li>Kot laayera jit: +${c.kot} · Baunne (sabai 52 patti): +${c.baunne} — sabai bhanda badhi, "Purna Bijay" utsav sahit!</li>
    <li>Coin le naya patti design, table background ra Band hukum (10) / Cut hukum (20) mode kholna sakinchha. Naya khelaadi Normal mode bata suru garchhan. Coin yahi browser ma save hunchha.</li>
  </ul>
  <h3>10. Online khel</h3>
  <ul>
    <li>Room banayera code wa link saathi lai pathaunus. Pahila dui jana saathi (euta team) hunchhan.</li>
    <li>Khaali seat ma bot khelchha. Host le mode chhanchha ra khel suru garchha.</li>
    <li>Khel chaldai garda naya saathi aaye bot ko thaau linchha.</li>
    <li>Internet gayo bhane tapaaiko paalo bot le khelchha; pharkepachhi aafnai seat ma jodinuhunchha.</li>
    <li>${AFK} second samma nakhele aafai chaal chalinchha.</li>
  </ul>
  <p class="muted">Thaau anusar niyam ali pharak huna sakchha — yo app le mathi ka niyam maanchha.</p>`;

const en: RulesFn = (p, c) => `
  <h2>All rules</h2>
  <h3>1. Names</h3>
  <p><b>Dahal Khani</b> — also called <b>Dahal Mara</b> and <b>Dahal Jeet</b>. Similar to Mendikot / Dehla Pakad in India.</p>
  <h3>2. Players and teams</h3>
  <ul>
    <li>4 players in 2 teams. Partners sit opposite each other.</li>
    <li>Play goes counter-clockwise (after you comes the player on your right).</li>
  </ul>
  <h3>3. Cards</h3>
  <ul>
    <li>52 cards, no jokers. High to low: A K Q J 10 9 8 7 6 5 4 3 2.</li>
    <li>All suits are equal — only the trump suit beats the others.</li>
  </ul>
  <h3>4. Dealing</h3>
  <ul>
    <li>Starting with the player after the dealer, everyone gets 5 cards.</li>
    <li>Once trump is settled, 4 more and then 4 more — 13 each.</li>
    <li>The dealer moves one seat on every round.</li>
  </ul>
  <h3>5. Trump (three modes)</h3>
  <p><b>“Turup”</b> is the Nepali word for <b>trump</b>: the strongest suit for that round. Any trump card (even a 2) beats any card of another suit (even an Ace). In some places it is also called <b>hukum</b> or <b>rang</b>.</p>
  <ul>
    <li><b>Normal:</b> the player after the dealer looks at their 5 cards and picks trump; everyone sees it.</li>
    <li><b>Band hukum:</b> the same player picks trump secretly. It is revealed the first time someone cannot follow the led suit, and counts from then on. Tricks before the reveal are decided normally.</li>
    <li><b>Cut hukum:</b> nobody picks; all 13 cards are dealt at once. The first card played by someone who cannot follow suit sets the trump (that card counts as trump too).</li>
  </ul>
  <h3>6. Playing</h3>
  <ul>
    <li>The trump chooser leads the first trick (in cut hukum, the player after the dealer).</li>
    <li>You must follow the led suit if you can.</li>
    <li>If you can't, play any card — cut with a trump or throw something else.</li>
    <li>The trick goes to the highest trump; with no trump, to the highest card of the led suit.</li>
    <li>The trick winner leads the next trick. 13 tricks per round.</li>
  </ul>
  <h3>7. Tens (Dahal) and winning a round</h3>
  <ul>
    <li>The four 10s are the Dahal. Winning a trick with a 10 in it captures that Dahal.</li>
    <li>The team that captures 3 or 4 tens wins the round.</li>
    <li>At 2–2, the team with more tricks (7 or more) wins. 13 is odd, so there is never a tie.</li>
  </ul>
  <h3>8. Kot, Baunne and points</h3>
  <ul>
    <li>Normal win: <b>${p.normal}</b> point.</li>
    <li><b>Kot</b> — one team captures all four tens: <b>${p.kot}</b> points.</li>
    <li><b>Baunne</b> (52) — one team wins all 13 tricks: <b>${p.baunne}</b> points.</li>
    <li>Points add up across rounds; play as long as you like.</li>
  </ul>
  <h3>9. Coins (in this app)</h3>
  <ul>
    <li>Lost but took 2 tens (lost only on tricks): +${c.lostWithTwoTens}. Other losses: 0.</li>
    <li>Won on more tricks: +${c.winOnTricks} · won with 3 tens: +${c.winThreeTens}</li>
    <li>Won with Kot: +${c.kot} · Baunne (all 52 cards): +${c.baunne} — the maximum, with a "Flawless Victory" celebration!</li>
    <li>Spend coins to unlock card designs, table backgrounds and the Band hukum (10) / Cut hukum (20) modes. New players start with Normal. Coins are saved in this browser.</li>
  </ul>
  <h3>10. Online games</h3>
  <ul>
    <li>Create a room and send the code or link. The first two players are partners.</li>
    <li>Bots fill empty seats. The host picks the mode and starts the game.</li>
    <li>A friend who arrives mid-game takes over a bot's seat.</li>
    <li>If your internet drops, a bot plays your turns; you rejoin your own seat when you're back.</li>
    <li>If you don't move for ${AFK} seconds, a move is made for you.</li>
  </ul>
  <p class="muted">House rules differ from place to place — this app follows the rules above.</p>`;

const ja: RulesFn = (p, c) => `
  <h2>全ルール</h2>
  <h3>1. 名前</h3>
  <p><b>ダハル・カニ</b> — <b>ダハル・マラ</b>、<b>ダハル・ジート</b>とも呼ばれます。インドのメンディコート／デーラ・パカドに似たゲームです。</p>
  <h3>2. プレイヤーとチーム</h3>
  <ul>
    <li>4人・2チーム。パートナーは向かい合って座ります。</li>
    <li>順番は反時計回り（あなたの次は右の人）。</li>
  </ul>
  <h3>3. カード</h3>
  <ul>
    <li>ジョーカーなしの52枚。強い順：A K Q J 10 9 8 7 6 5 4 3 2。</li>
    <li>4つのスートは対等で、切り札だけが他より強くなります。</li>
  </ul>
  <h3>4. 配札</h3>
  <ul>
    <li>ディーラーの次の人から、全員に5枚ずつ。</li>
    <li>切り札が決まったら4枚、さらに4枚 — 各13枚。</li>
    <li>ディーラーは毎ラウンド1席ずつ移ります。</li>
  </ul>
  <h3>5. 切り札（3つのモード）</h3>
  <p><b>「トゥルップ」</b>はネパール語で<b>切り札</b>（英語の trump）。そのラウンドで一番強いスートです。切り札なら2でも、他のスートのAに勝ちます。地域によっては<b>フクム</b>や<b>ラング</b>とも呼ばれます。（日本語の「トランプ」はカード一式のことなので別の意味です。）</p>
  <ul>
    <li><b>ノーマル：</b>ディーラーの次の人が5枚を見て切り札を選び、全員に公開します。</li>
    <li><b>バンド・フクム：</b>同じ人が切り札を秘密で選びます。誰かが初めてリードされたスートを出せなくなった時に公開され、その時から有効になります。公開前のトリックは通常どおり判定します。</li>
    <li><b>カット・フクム：</b>誰も選ばず、最初から13枚配ります。スートを出せない人が最初に出したカードのスートが切り札になります（そのカードも切り札として扱います）。</li>
  </ul>
  <h3>6. プレイ</h3>
  <ul>
    <li>最初のトリックは切り札を選んだ人がリードします（カット・フクムではディーラーの次の人）。</li>
    <li>リードされたスートを持っていれば必ず出します。</li>
    <li>持っていなければ何を出してもかまいません（切り札で切る、または捨てる）。</li>
    <li>一番強い切り札がトリックを取ります。切り札がなければリードされたスートの最強カード。</li>
    <li>トリックを取った人が次をリードします。1ラウンド13トリック。</li>
  </ul>
  <h3>7. ダハル（10）とラウンドの勝敗</h3>
  <ul>
    <li>4枚の10がダハルです。10を含むトリックを取るとそのダハルを獲得します。</li>
    <li>ダハルを3枚か4枚取ったチームがラウンドに勝ちます。</li>
    <li>2対2なら、トリック数が多い（7以上）チームの勝ち。13は奇数なので引き分けはありません。</li>
  </ul>
  <h3>8. コット、バウンネと得点</h3>
  <ul>
    <li>通常の勝ち：<b>${p.normal}</b>点。</li>
    <li><b>コット</b> — 1チームが10を4枚すべて獲得：<b>${p.kot}</b>点。</li>
    <li><b>バウンネ</b>（52）— 1チームが13トリックすべて獲得：<b>${p.baunne}</b>点。</li>
    <li>得点はラウンドごとに加算されます。好きなだけ遊べます。</li>
  </ul>
  <h3>9. コイン（このアプリ）</h3>
  <ul>
    <li>負けてもダハル2枚（トリック数で負け）：+${c.lostWithTwoTens}。その他の負けは0。</li>
    <li>トリック数で勝ち：+${c.winOnTricks} · ダハル3枚で勝ち：+${c.winThreeTens}</li>
    <li>コットで勝ち：+${c.kot} · バウンネ（52枚すべて）：+${c.baunne} — 最高額、「完全勝利」演出つき！</li>
    <li>コインでカードデザイン、テーブル背景、バンド・フクム（10）／カット・フクム（20）モードを解放できます。新しいプレイヤーはノーマルから始めます。コインはこのブラウザに保存されます。</li>
  </ul>
  <h3>10. オンライン対戦</h3>
  <ul>
    <li>ルームを作り、コードかリンクを送ります。最初の2人がパートナーです。</li>
    <li>空いた席はボットが担当します。ホストがモードを選んで開始します。</li>
    <li>途中から来た友達はボットの席を引き継ぎます。</li>
    <li>回線が切れたらボットが代わりにプレイし、戻ると自分の席に復帰します。</li>
    <li>${AFK}秒間プレイしないと自動で手が進みます。</li>
  </ul>
  <p class="muted">地域によってルールは少し異なります。このアプリは上記のルールに従います。</p>`;

export const FULL_RULES: Record<Lang, RulesFn> = { ne, neRom, en, ja };
