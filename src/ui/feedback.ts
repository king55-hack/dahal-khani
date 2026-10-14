// Feedback form (for players) and the creator's inbox, plus the calls to the server.
import { FEEDBACK_CONTACT_MAX, FEEDBACK_KINDS, FEEDBACK_MESSAGE_MAX, type FeedbackEntry, type FeedbackKind, type FeedbackRequest } from '../online/feedback';
import { escapeHtml } from './html';
import type { Strings } from './i18n';

// ---------- server calls ----------

export async function sendFeedback(server: string, req: FeedbackRequest): Promise<'ok' | 'too_many' | 'error'> {
  try {
    const res = await fetch(`${server}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return res.ok ? 'ok' : res.status === 429 ? 'too_many' : 'error';
  } catch {
    return 'error';
  }
}

export type Inbox = { unread: number; items: FeedbackEntry[] };

export async function fetchInbox(server: string, key: string): Promise<Inbox | 'unauthorized' | 'error'> {
  try {
    const res = await fetch(`${server}/api/feedback`, { headers: { Authorization: `Bearer ${key}` } });
    if (res.status === 401) return 'unauthorized';
    if (!res.ok) return 'error';
    return (await res.json()) as Inbox;
  } catch {
    return 'error';
  }
}

export async function updateInbox(server: string, key: string, ids: string[], action: 'read' | 'delete') {
  try {
    await fetch(`${server}/api/feedback/update`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action }),
    });
  } catch {
    /* the inbox is reloaded afterwards anyway */
  }
}

// ---------- the admin key lives only on the creator's own device ----------

const ADMIN_KEY = 'dahal-khani:admin';
export function loadAdminKey(): string {
  try {
    return localStorage.getItem(ADMIN_KEY) ?? '';
  } catch {
    return '';
  }
}
export function saveAdminKey(key: string) {
  try {
    if (key) localStorage.setItem(ADMIN_KEY, key);
    else localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}

// ---------- HTML ----------

export interface FeedbackForm {
  kind: FeedbackKind;
  message: string;
  contact: string;
  includeInfo: boolean;
  sending: boolean;
  sent: boolean;
  error: string;
}

const shell = (inner: string, cls: string, label: string) => `<div class="overlay dialog" data-m="backdrop">
  <div class="modal sheet ${cls}" role="dialog" aria-modal="true" aria-label="${label}">
    <button class="close" data-m="close" aria-label="Close">×</button>
    ${inner}
  </div>
</div>`;

export function feedbackHtml(t: Strings, f: FeedbackForm, creator: string): string {
  if (f.sent) {
    return shell(
      `<div class="fb-sent"><div class="fb-sent-icon">💌</div><h2>${t.feedbackSent}</h2>
        <button class="primary" data-m="close">OK</button></div>`,
      'feedback-modal',
      t.feedbackTitle,
    );
  }
  const kinds = FEEDBACK_KINDS.map(
    (k) => `<button class="${f.kind === k ? 'on' : ''}" data-fb-kind="${k}">${t.feedbackKinds[k]}</button>`,
  ).join('');
  return shell(
    `<h2>${t.feedbackTitle}</h2>
    <div class="seg fb-kinds">${kinds}</div>
    ${f.error ? `<div class="online-error" role="alert">${f.error}</div>` : ''}
    <textarea id="fb-message" maxlength="${FEEDBACK_MESSAGE_MAX}" rows="5"
      placeholder="${escapeHtml(t.feedbackPlaceholder[f.kind])}">${escapeHtml(f.message)}</textarea>
    <div class="fb-count"><span id="fb-count">${[...f.message].length}</span> / ${FEEDBACK_MESSAGE_MAX}</div>
    <label class="field">${t.feedbackContact}
      <input id="fb-contact" maxlength="${FEEDBACK_CONTACT_MAX}" autocomplete="email" value="${escapeHtml(f.contact)}" />
    </label>
    <label class="fb-check"><input type="checkbox" id="fb-info" ${f.includeInfo ? 'checked' : ''} /> ${t.feedbackIncludeInfo}</label>
    <p class="muted">🔒 ${escapeHtml(t.feedbackPrivacy(creator))}</p>
    <button class="primary" data-m="fb-send" ${f.sending ? 'disabled' : ''}>${f.sending ? '⏳' : t.feedbackSend}</button>`,
    'feedback-modal',
    t.feedbackTitle,
  );
}

const KIND_ICON: Record<FeedbackKind, string> = { problem: '🐞', idea: '💡', thanks: '🙏' };

/** The creator's inbox (text is for Rajan, so Nepali Roman + English). */
export function inboxHtml(state: { key: string; inbox: Inbox | null; loading: boolean; error: string }): string {
  if (!state.key || state.error === 'unauthorized') {
    return shell(
      `<h2>📬 Feedback inbox</h2>
      <p class="muted">Admin key haalnus (yo device ma matra save hunchha). / Enter the admin key.</p>
      ${state.error === 'unauthorized' ? '<div class="online-error">Key milena. / Wrong key.</div>' : ''}
      <input id="admin-key" type="password" autocomplete="off" class="admin-key" />
      <button class="primary" data-m="inbox-login">Kholnus / Open</button>`,
      'inbox-modal',
      'Inbox',
    );
  }
  const items = state.inbox?.items ?? [];
  const list = items.length
    ? items
        .map((f) => {
          const meta = Object.entries(f.meta ?? {})
            .map(([k, v]) => `${k}: ${escapeHtml(v)}`)
            .join(' · ');
          return `<div class="fb-item ${f.read ? '' : 'unread'}">
            <div class="fb-head"><b>${KIND_ICON[f.kind]} ${f.kind}</b><small>${new Date(f.at).toLocaleString()}</small></div>
            <div class="fb-msg">${escapeHtml(f.message)}</div>
            ${f.contact ? `<div class="fb-contact">✉ ${escapeHtml(f.contact)}</div>` : ''}
            ${meta ? `<div class="fb-meta">${meta}</div>` : ''}
            <div class="fb-actions">
              ${f.read ? '' : `<button class="ghost" data-fb-read="${escapeHtml(f.id)}">✓ Padhe</button>`}
              <button class="ghost danger-text" data-fb-delete="${escapeHtml(f.id)}">🗑</button>
            </div>
          </div>`;
        })
        .join('')
    : '<p class="muted">Ahile kunai sandesh chhaina. / No messages yet.</p>';
  return shell(
    `<h2>📬 Feedback inbox ${state.inbox?.unread ? `<span class="badge">${state.inbox.unread}</span>` : ''}</h2>
    ${state.error ? `<div class="online-error">${escapeHtml(state.error)}</div>` : ''}
    <div class="inbox-tools">
      <button class="ghost" data-m="inbox-refresh">${state.loading ? '⏳' : '↻'} Refresh</button>
      ${state.inbox?.unread ? '<button class="ghost" data-m="inbox-read-all">✓ Sabai padhe</button>' : ''}
      <button class="ghost" data-m="inbox-logout">Key hataunus</button>
    </div>
    <div class="fb-list">${list}</div>`,
    'inbox-modal',
    'Inbox',
  );
}
