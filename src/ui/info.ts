// The ⓘ dialog: how to play + who made the game. Rendered into its own root so
// game re-renders never reset its scroll position.
import { CREATOR_NAME, GAME_SETTINGS } from '../settings';

export type InfoTab = 'rules' | 'credits';

const P = GAME_SETTINGS.points;

const RULES_HTML = `
  <h2>Kasari khelne? (How to play)</h2>
  <p><b>4 jana khelaadi, 2 team.</b> Tapaai talako, tapaaiko saathi (Sita) maathi. Hari ra Gopal
  arko team.</p>

  <h3>1. Patti baadne ra TURUP</h3>
  <ul>
    <li>52 patti, joker chhaina. Thulo dekhi saano: A K Q J 10 9 … 2.</li>
    <li>Suruma sabailai 5 patti. Dealer pachhiko khelaadi le 5 patti herera <b>TURUP</b> (Rang) chunchha.</li>
    <li>Tyaspachhi 4 + 4 patti thapera sabaiko 13 patti hunchha. Dealer har round ghumchha.</li>
  </ul>

  <h3>2. Khelne niyam</h3>
  <ul>
    <li>TURUP chunne le pahilo <b>Haat</b> (trick) suru garchha.</li>
    <li>Suru gareko rang (suit) chha bhane tyahi khelnai parchha.</li>
    <li>Tyo rang chhaina bhane jun patti pani khelna milchha — TURUP le kaatna sakinchha.</li>
    <li>Sabai bhanda thulo TURUP le haat jitchha. TURUP chhaina bhane suru gareko rang ko thulo patti le.</li>
    <li>Haat jitne le arko haat suru garchha. Ek round ma 13 haat.</li>
  </ul>

  <h3>3. Dahal (10) nai mukhya!</h3>
  <ul>
    <li>Chaar ota 10 lai <b>Dahal</b> bhaninchha. Dahal bhayeko haat jitepachhi tyo Dahal tapaaiko team ko.</li>
    <li>3 ya 4 Dahal line team le round jitchha.</li>
    <li>2–2 Dahal bhayo bhane dherai haat jitne team le jitchha.</li>
  </ul>

  <h3>4. Score</h3>
  <ul>
    <li>Saadharan jit: <b>${P.normal}</b> point</li>
    <li><b>Kot</b> — chaarai Dahal: <b>${P.kot}</b> point</li>
    <li><b>Baunne</b> (52) — sabai 13 haat: <b>${P.baunne}</b> point</li>
  </ul>

  <h3>Screen ma</h3>
  <ul>
    <li>Pahelo kinara bhayeko patti matra khelna milchha — thichnus.</li>
    <li>Maathi: score, TURUP, ani dubai team ko Dahal ●●○○ ra Haat.</li>
    <li>↺ thichda naya khel suru hunchha (score 0).</li>
  </ul>
`;

const CREDITS_HTML = `
  <h2>Banaune (Created by)</h2>
  <div class="credit-card">
    <div class="by">Yo game banaune</div>
    <div class="who"></div>
    <div class="sub">Dahal Khani · Dahal Mara</div>
    <div class="suits-line">♠ ♥ ♣ ♦</div>
  </div>
  <p>Dahal Khani (Dahal Mara) Nepal ko paramparaagat taas khel ho, Bharat ko Mendikot / Dehla Pakad
  jastai. Yo browser prototype ho — tapaai 3 ota computer bot sanga khelnuhunchha.</p>
`;

export function renderInfo(root: HTMLElement, tab: InfoTab | null) {
  if (!tab) {
    root.innerHTML = '';
    return;
  }
  root.innerHTML = `
    <div class="overlay info" data-info="backdrop">
      <div class="modal info-modal" role="dialog" aria-modal="true" aria-label="Game info">
        <button class="close" data-info="close" aria-label="Banda garnus">×</button>
        <div class="tabs">
          <button data-info="rules" class="${tab === 'rules' ? 'on' : ''}">Kasari khelne</button>
          <button data-info="credits" class="${tab === 'credits' ? 'on' : ''}">Banaune</button>
        </div>
        ${tab === 'rules' ? RULES_HTML : CREDITS_HTML}
      </div>
    </div>`;
  // name set via textContent, never parsed as HTML
  const who = root.querySelector('.who');
  if (who) who.textContent = CREATOR_NAME;
}
