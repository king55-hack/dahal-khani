// ⓘ → "Online" tab: a step-by-step guide to playing with friends, in every language.
import { PASSWORD_TRIES, TIMING } from '../online/room';
import type { Lang } from './i18n';

const AFK = TIMING.afk / 1000;
const IDLE_H = TIMING.idleExpiry / 3_600_000;
const LOCK_MIN = TIMING.passwordWindow / 60_000;

const neRom = `
  <h2>🌐 Online kasari khelne</h2>
  <h3>1. Room banaaune</h3>
  <ol>
    <li>Mathi ko <b>🌐</b> thichnus.</li>
    <li><b>Room ko naam</b> lekhnus (jastai "Rajan ko ghar").</li>
    <li>Chahiye bhane <b>password</b> haalnus. Password haale 🔒 <b>private</b> — password thaha bhayeko le matra aauna sakchha. Nahaale <b>public</b> — sabai le list ma dekhchhan.</li>
    <li><b>Naya room banaunus</b> thichnus. Tapaailai <b>6 ank ko room number</b> (jastai 482913) milchha, ra tapaai <b>Host 👑</b> hunuhunchha.</li>
  </ol>
  <h3>2. Saathi bolaaune</h3>
  <ul>
    <li>Room bhitra <b>📤 Saathi lai link pathaunus</b> thichnus — WhatsApp, Viber, Messenger jaha pani pathauna milchha.</li>
    <li>Sandesh ma link, room number ra (password bhaye) password pani hunchha.</li>
  </ul>
  <h3>3. Saathi ko room ma jaane (3 tarika)</h3>
  <ul>
    <li><b>Link thichnus</b> — room number afai bharinchha. Naam lekhera <b>Jodinus</b>.</li>
    <li><b>Room number + password</b> — 🌐 ma haalera Jodinus.</li>
    <li><b>Khulla room haru</b> ko list bata thichnus (🔒 bhaye password sodhchha).</li>
  </ul>
  <h3>4. Team ra seat</h3>
  <ul>
    <li>Pahila aaune <b>dui jana eutai team</b> (saathi) hunchhan.</li>
    <li>Arko team ma basna khaali seat thichnus.</li>
    <li>Khaali seat ma 🤖 <b>bot</b> khelchha — 2 jana matra bhaye pani khelna milchha.</li>
  </ul>
  <h3>5. Khel suru</h3>
  <ul>
    <li>Host le <b>mode</b> (Normal / Band hukum / Cut hukum) chhanera <b>▶ Khel suru garnus</b> thichchha.</li>
    <li>Khel bich ma aaune saathi le bot ko seat linchha.</li>
  </ul>
  <h3>6. Khel chaldai garda</h3>
  <ul>
    <li><b>💬</b> thichera 👍 😂 jasta reaction ra "Ramro chaal!" jasta sandesh pathauna milchha (type garna mildaina).</li>
    <li>Internet gayo bhane tapaaiko paalo bot le khelchha. Pharkepachhi — page reload garda pani — <b>aafnai seat</b> ma jodinuhunchha.</li>
    <li>${AFK} second samma nakhele afai chaal chalinchha.</li>
  </ul>
  <h3>7. Host ko adhikaar 👑</h3>
  <ul>
    <li><b>✕ Nikaalnus</b> — kunai player lai room bata hataaune (khel chaldai bhaye usko thaau bot linchha).</li>
    <li><b>🗑 Room band garnus</b> — sabai lai baahira pathaayera room mettaaune.</li>
    <li>Host baahira gaye arko player Host hunchha.</li>
  </ul>
  <h3>8. Room chhodne ra mettine</h3>
  <ul>
    <li><b>🚪 Room chhodnus</b> — khel suru hunu aghi chhode seat khaali hunchha; khel bich ma chhode bot le khelchha.</li>
    <li>Room ma ${IDLE_H} ghanta samma kehi bhayena bhane room afai metinchha.</li>
    <li>List ma manchhe bhayeko ra seat khaali bhayeko room matra dekhinchha.</li>
  </ul>
  <h3>Samasya bhaye</h3>
  <ul>
    <li><b>"Room bhetiyena"</b> — number milaaunus, wa room metisakyo.</li>
    <li><b>"Password milena"</b> — host lai sodhnus. ${PASSWORD_TRIES} patak galat bhaye ${LOCK_MIN} minute parkhanu parchha.</li>
    <li><b>"Room bharisakyo"</b> — 4 jana nai chhan. Host le kasailai nikaalna sakchha.</li>
  </ul>`;

const ne = `
  <h2>🌐 अनलाइन कसरी खेल्ने</h2>
  <h3>१. रुम बनाउने</h3>
  <ol>
    <li>माथिको <b>🌐</b> थिच्नुहोस्।</li>
    <li><b>रुमको नाम</b> लेख्नुहोस् (जस्तै "राजनको घर")।</li>
    <li>चाहिए <b>पासवर्ड</b> हाल्नुहोस्। पासवर्ड हाले 🔒 <b>प्राइभेट</b> — पासवर्ड थाहा भएकाले मात्र आउन सक्छ। नहाले <b>पब्लिक</b> — सबैले सूचीमा देख्छन्।</li>
    <li><b>नयाँ रुम बनाउनुहोस्</b> थिच्नुहोस्। तपाईंलाई <b>६ अंकको रुम नम्बर</b> मिल्छ र तपाईं <b>होस्ट 👑</b> हुनुहुन्छ।</li>
  </ol>
  <h3>२. साथी बोलाउने</h3>
  <ul>
    <li>रुमभित्र <b>📤 साथीलाई लिंक पठाउनुहोस्</b> थिच्नुहोस् — WhatsApp, Viber, Messenger जहाँ पनि।</li>
    <li>सन्देशमा लिंक, रुम नम्बर र (भए) पासवर्ड पनि हुन्छ।</li>
  </ul>
  <h3>३. साथीको रुममा जाने (३ तरिका)</h3>
  <ul>
    <li><b>लिंक थिच्नुहोस्</b> — रुम नम्बर आफैं भरिन्छ। नाम लेखेर <b>जोडिनुहोस्</b>।</li>
    <li><b>रुम नम्बर + पासवर्ड</b> — 🌐 मा हालेर जोडिनुहोस्।</li>
    <li><b>खुला रुमहरू</b> को सूचीबाट थिच्नुहोस् (🔒 भए पासवर्ड सोध्छ)।</li>
  </ul>
  <h3>४. टिम र सिट</h3>
  <ul>
    <li>पहिला आउने <b>दुई जना एउटै टिम</b> (साथी) हुन्छन्।</li>
    <li>अर्को टिममा बस्न खाली सिट थिच्नुहोस्।</li>
    <li>खाली सिटमा 🤖 <b>बोट</b> खेल्छ — २ जना मात्र भए पनि खेल्न मिल्छ।</li>
  </ul>
  <h3>५. खेल सुरु</h3>
  <ul>
    <li>होस्टले <b>मोड</b> (साधारण / बन्द हुकुम / कट हुकुम) छानेर <b>▶ खेल सुरु गर्नुहोस्</b> थिच्छ।</li>
    <li>खेलको बीचमा आउने साथीले बोटको सिट लिन्छ।</li>
  </ul>
  <h3>६. खेल चल्दा</h3>
  <ul>
    <li><b>💬</b> थिचेर 👍 😂 जस्ता प्रतिक्रिया र "कस्तो राम्रो चाल!" जस्ता सन्देश पठाउन मिल्छ (टाइप गर्न मिल्दैन)।</li>
    <li>इन्टरनेट गयो भने तपाईंको पालो बोटले खेल्छ। फर्केपछि — पेज रिलोड गर्दा पनि — <b>आफ्नै सिट</b>मा जोडिनुहुन्छ।</li>
    <li>${AFK} सेकेन्डसम्म नखेले आफैं चाल चलिन्छ।</li>
  </ul>
  <h3>७. होस्टको अधिकार 👑</h3>
  <ul>
    <li><b>✕ निकाल्नुहोस्</b> — कुनै खेलाडीलाई रुमबाट हटाउने (खेल चल्दै भए उसको ठाउँ बोटले लिन्छ)।</li>
    <li><b>🗑 रुम बन्द गर्नुहोस्</b> — सबैलाई बाहिर पठाएर रुम मेटाउने।</li>
    <li>होस्ट बाहिर गए अर्को खेलाडी होस्ट हुन्छ।</li>
  </ul>
  <h3>८. रुम छोड्ने र मेटिने</h3>
  <ul>
    <li><b>🚪 रुम छोड्नुहोस्</b> — खेल सुरु हुनुअघि छोडे सिट खाली हुन्छ; खेलको बीचमा छोडे बोटले खेल्छ।</li>
    <li>रुममा ${IDLE_H} घण्टासम्म केही भएन भने रुम आफैं मेटिन्छ।</li>
    <li>सूचीमा मान्छे भएका र सिट खाली भएका रुम मात्र देखिन्छन्।</li>
  </ul>
  <h3>समस्या भए</h3>
  <ul>
    <li><b>"रुम भेटिएन"</b> — नम्बर मिलाउनुहोस्, वा रुम मेटिइसक्यो।</li>
    <li><b>"पासवर्ड मिलेन"</b> — होस्टलाई सोध्नुहोस्। ${PASSWORD_TRIES} पटक गलत भए ${LOCK_MIN} मिनेट पर्खनुपर्छ।</li>
    <li><b>"रुम भरिसक्यो"</b> — ४ जना नै छन्। होस्टले कसैलाई निकाल्न सक्छ।</li>
  </ul>`;

const en = `
  <h2>🌐 How to play online</h2>
  <h3>1. Create a room</h3>
  <ol>
    <li>Tap <b>🌐</b> at the top.</li>
    <li>Type a <b>room name</b> (e.g. "Rajan's house").</li>
    <li>Add a <b>password</b> if you like. With a password the room is 🔒 <b>private</b> — only people who know it can join. Without one it is <b>public</b> — everyone sees it in the list.</li>
    <li>Tap <b>Create a room</b>. You get a <b>6-digit room number</b> (e.g. 482913) and you are the <b>host 👑</b>.</li>
  </ol>
  <h3>2. Invite friends</h3>
  <ul>
    <li>In the room, tap <b>📤 Send link to friends</b> — WhatsApp, Viber, Messenger, anything.</li>
    <li>The message contains the link, the room number and (if set) the password.</li>
  </ul>
  <h3>3. Join a friend's room (3 ways)</h3>
  <ul>
    <li><b>Open the link</b> — the room number is filled in. Type your name and tap <b>Join</b>.</li>
    <li><b>Room number + password</b> — enter them under 🌐 and tap Join.</li>
    <li>Tap a room in the <b>Open rooms</b> list (🔒 rooms ask for the password).</li>
  </ul>
  <h3>4. Teams and seats</h3>
  <ul>
    <li>The <b>first two players are partners</b> (same team).</li>
    <li>Tap an empty seat to move to the other team.</li>
    <li>🤖 <b>Bots</b> play empty seats — two people are enough to play.</li>
  </ul>
  <h3>5. Start</h3>
  <ul>
    <li>The host picks the <b>mode</b> (Normal / Band hukum / Cut hukum) and taps <b>▶ Start game</b>.</li>
    <li>A friend who arrives mid-game takes over a bot's seat.</li>
  </ul>
  <h3>6. While playing</h3>
  <ul>
    <li>Tap <b>💬</b> to send reactions like 👍 😂 or messages like "Nice play!" (no typing).</li>
    <li>If your internet drops, a bot plays your turns. When you're back — even after reloading the page — you rejoin <b>your own seat</b>.</li>
    <li>If you don't move for ${AFK} seconds, a move is made for you.</li>
  </ul>
  <h3>7. Host controls 👑</h3>
  <ul>
    <li><b>✕ Remove</b> — take a player out of the room (during a game a bot takes their place).</li>
    <li><b>🗑 Close room</b> — send everyone out and delete the room.</li>
    <li>If the host leaves, another player becomes host.</li>
  </ul>
  <h3>8. Leaving, and when rooms disappear</h3>
  <ul>
    <li><b>🚪 Leave room</b> — before the game starts your seat becomes free; during a game a bot plays it.</li>
    <li>A room with no activity for ${IDLE_H} hours is deleted automatically.</li>
    <li>The list only shows rooms with someone in them and a free seat.</li>
  </ul>
  <h3>If something goes wrong</h3>
  <ul>
    <li><b>"Room not found"</b> — check the number, or the room was deleted.</li>
    <li><b>"Wrong password"</b> — ask the host. After ${PASSWORD_TRIES} wrong tries, wait ${LOCK_MIN} minutes.</li>
    <li><b>"The room is full"</b> — 4 people are in it. The host can remove someone.</li>
  </ul>`;

const ja = `
  <h2>🌐 オンラインの遊び方</h2>
  <h3>1. ルームを作る</h3>
  <ol>
    <li>上の <b>🌐</b> をタップ。</li>
    <li><b>ルーム名</b>を入力（例：「ラジャンの家」）。</li>
    <li>必要なら<b>パスワード</b>を設定。あれば 🔒 <b>非公開</b>（知っている人だけ参加可）、なければ<b>公開</b>（一覧に表示）。</li>
    <li><b>ルームを作成</b>をタップ。<b>6桁のルーム番号</b>（例：482913）がもらえ、あなたが<b>ホスト 👑</b>になります。</li>
  </ol>
  <h3>2. 友達を招待</h3>
  <ul>
    <li>ルーム内で <b>📤 友達にリンクを送る</b> をタップ — LINE、WhatsApp、Messenger など何でもOK。</li>
    <li>メッセージにはリンク、ルーム番号、（設定していれば）パスワードが入ります。</li>
  </ul>
  <h3>3. 友達のルームに参加（3つの方法）</h3>
  <ul>
    <li><b>リンクを開く</b> — ルーム番号が自動入力されます。名前を入れて<b>参加</b>。</li>
    <li><b>ルーム番号＋パスワード</b> — 🌐 で入力して参加。</li>
    <li><b>公開中のルーム</b>一覧からタップ（🔒 はパスワードが必要）。</li>
  </ul>
  <h3>4. チームと席</h3>
  <ul>
    <li><b>最初の2人がパートナー</b>（同じチーム）です。</li>
    <li>相手チームに座るには空席をタップ。</li>
    <li>空席は 🤖 <b>ボット</b>が担当 — 2人だけでも遊べます。</li>
  </ul>
  <h3>5. 開始</h3>
  <ul>
    <li>ホストが<b>モード</b>（ノーマル／バンド・フクム／カット・フクム）を選んで <b>▶ ゲーム開始</b>。</li>
    <li>途中から来た友達はボットの席を引き継ぎます。</li>
  </ul>
  <h3>6. プレイ中</h3>
  <ul>
    <li><b>💬</b> で 👍 😂 などのリアクションや「ナイスプレイ！」などのメッセージを送れます（文字入力なし）。</li>
    <li>回線が切れたらボットが代わりにプレイ。戻ると（ページを再読み込みしても）<b>自分の席</b>に戻れます。</li>
    <li>${AFK}秒間何もしないと自動で手が進みます。</li>
  </ul>
  <h3>7. ホストの操作 👑</h3>
  <ul>
    <li><b>✕ 退出させる</b> — プレイヤーをルームから外す（ゲーム中ならボットが代わる）。</li>
    <li><b>🗑 ルームを閉じる</b> — 全員を退出させてルームを削除。</li>
    <li>ホストが抜けると、他のプレイヤーがホストになります。</li>
  </ul>
  <h3>8. 退出とルームの削除</h3>
  <ul>
    <li><b>🚪 ルームを出る</b> — 開始前なら席が空き、ゲーム中ならボットがプレイします。</li>
    <li>${IDLE_H}時間動きのないルームは自動で削除されます。</li>
    <li>一覧には、人がいて空席のあるルームだけが表示されます。</li>
  </ul>
  <h3>困ったときは</h3>
  <ul>
    <li><b>「ルームが見つかりません」</b> — 番号を確認。またはルームが削除済み。</li>
    <li><b>「パスワードが違います」</b> — ホストに確認。${PASSWORD_TRIES}回間違えると${LOCK_MIN}分待つ必要があります。</li>
    <li><b>「ルームは満員です」</b> — 4人います。ホストが誰かを退出させられます。</li>
  </ul>`;

export const ONLINE_GUIDE: Record<Lang, string> = { ne, neRom, en, ja };
