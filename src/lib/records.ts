import { randomBytes } from 'crypto';
import { query } from './db';
import { hashPassword } from './password';
import { asUserRole, type AuthUser, type Collaboration, type CollaborationKind, type CollaborationStatus, type Report, type ReportKind, type Testimonial, type UserRole, type Volunteer, type VolunteerRole, type VolunteerStatus } from './types';

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: Date;
};

function authUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    role: asUserRole(row.role),
    active: row.active,
    at: row.created_at.toISOString(),
    passwordHash: row.password_hash,
  };
}

const USER_SQL = `SELECT id, username, password_hash, display_name, email, role, active, created_at FROM users`;

export async function findUserByUsername(username: string) {
  const result = await query<UserRow>(`${USER_SQL} WHERE lower(username) = lower($1) LIMIT 1`, [username]);
  return result.rows[0] ? authUser(result.rows[0]) : null;
}

export async function findUserById(id: string) {
  const result = await query<UserRow>(`${USER_SQL} WHERE id = $1 LIMIT 1`, [id]);
  const user = result.rows[0] ? authUser(result.rows[0]) : null;
  return user?.active ? user : null;
}

export async function createUser(input: { username: string; password: string; displayName: string; email: string; role: UserRole }) {
  if (input.role === 'superAdmin') throw new Error('Use the super admin script to create this account.');
  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) throw new Error('Username must be 3–40 letters, numbers, dots, or dashes.');
  if (input.password.length < 8) throw new Error('Password must be at least 8 characters.');
  const existing = await findUserByUsername(username);
  if (existing) throw new Error('That username is already in use.');
  const id = `user_${randomBytes(4).toString('hex')}`;
  await query(
    `INSERT INTO users (id, username, password_hash, display_name, email, role, active) VALUES ($1,$2,$3,$4,$5,$6,TRUE)`,
    [id, username, hashPassword(input.password), input.displayName.trim() || username, input.email.trim(), input.role],
  );
  const user = await findUserById(id);
  if (!user) throw new Error('The user could not be saved.');
  const { passwordHash, ...safe } = user;
  void passwordHash;
  return safe;
}

async function activeAdmins() {
  const result = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM users WHERE role IN ('admin', 'superAdmin') AND active = TRUE`);
  return result.rows[0]?.n || 0;
}

export async function updateUser(id: string, actorId: string, input: { displayName?: string; email?: string; role?: UserRole; active?: boolean; password?: string }) {
  const current = await query<UserRow>(`${USER_SQL} WHERE id = $1`, [id]);
  const row = current.rows[0];
  if (!row) throw new Error('User not found.');
  const stored = asUserRole(row.role);
  if (stored === 'superAdmin' && ((input.role && input.role !== 'superAdmin') || input.active === false)) {
    throw new Error('Use the super admin script to change this account.');
  }
  const nextRole = stored === 'superAdmin' ? 'superAdmin' : (input.role || stored);
  const nextActive = input.active ?? row.active;
  const removesAdmin = stored !== 'editor' && row.active && (nextRole === 'editor' || !nextActive);
  if (removesAdmin && await activeAdmins() < 2) throw new Error('Keep at least one active administrator.');
  if (id === actorId && !nextActive) throw new Error('You cannot deactivate the account you are using.');
  if (input.password && input.password.length < 8) throw new Error('Password must be at least 8 characters.');
  const passwordHash = input.password ? hashPassword(input.password) : row.password_hash;
  await query(
    `UPDATE users SET display_name = $2, email = $3, role = $4, active = $5, password_hash = $6 WHERE id = $1`,
    [id, (input.displayName ?? row.display_name).trim(), (input.email ?? row.email).trim(), nextRole, nextActive, passwordHash],
  );
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) throw new Error('You cannot remove the account you are using.');
  const current = await query<UserRow>(`${USER_SQL} WHERE id = $1`, [id]);
  const row = current.rows[0];
  if (!row) throw new Error('User not found.');
  if (asUserRole(row.role) === 'superAdmin') throw new Error('Use the super admin script to change this account.');
  if (row.role === 'admin' && row.active && await activeAdmins() < 2) throw new Error('Keep at least one active administrator.');
  await query(`DELETE FROM users WHERE id = $1`, [id]);
}

export async function createVolunteer(input: Omit<Volunteer, 'id' | 'at'>) {
  if (!input.name.trim() || !input.phone.trim()) throw new Error('Name and phone are required.');
  const id = `vol_${randomBytes(4).toString('hex')}`;
  const result = await query<{ created_at: Date }>(
    `INSERT INTO volunteers (id, name, email, phone, city, skills, availability, role, title, image, status, featured, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING created_at`,
    [id, input.name.trim(), input.email.trim(), input.phone.trim(), input.city.trim(), input.skills.trim(), input.availability.trim(), input.role, input.title.trim(), input.image.trim(), input.status, input.featured, input.notes.trim()],
  );
  return {
    ...input,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    skills: input.skills.trim(),
    availability: input.availability.trim(),
    title: input.title.trim(),
    image: input.image.trim(),
    notes: input.notes.trim(),
    id,
    at: result.rows[0].created_at.toISOString(),
  };
}

export async function updateVolunteer(id: string, input: Omit<Volunteer, 'id' | 'at'>) {
  if (!input.name.trim() || !input.phone.trim()) throw new Error('Name and phone are required.');
  const result = await query(
    `UPDATE volunteers SET name=$2, email=$3, phone=$4, city=$5, skills=$6, availability=$7, role=$8, title=$9, image=$10, status=$11, featured=$12, notes=$13 WHERE id=$1`,
    [id, input.name.trim(), input.email.trim(), input.phone.trim(), input.city.trim(), input.skills.trim(), input.availability.trim(), input.role, input.title.trim(), input.image.trim(), input.status, input.featured, input.notes.trim()],
  );
  if (!result.rowCount) throw new Error('Volunteer not found.');
}

export async function deleteVolunteer(id: string) {
  await query(`DELETE FROM volunteers WHERE id = $1`, [id]);
}

export async function recordImage(input: { id: string; filename: string; url: string; alt: string; size: number; type: string; caption?: string; entityType: string; entityId?: string }) {
  await query(
    `INSERT INTO images (id, filename, url, alt_text, size_bytes, mime_type, caption, entity_type, entity_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (id) DO UPDATE SET
       filename = EXCLUDED.filename, url = EXCLUDED.url, alt_text = EXCLUDED.alt_text,
       size_bytes = EXCLUDED.size_bytes, mime_type = EXCLUDED.mime_type,
       caption = EXCLUDED.caption, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id`,
    [input.id, input.filename, input.url, input.alt, input.size, input.type, input.caption || '', input.entityType, input.entityId || ''],
  );
}

export async function updateImage(id: string, alt: string, caption: string) {
  const result = await query(`UPDATE images SET alt_text = $2, caption = $3 WHERE id = $1`, [id, alt, caption]);
  if (!result.rowCount) throw new Error('Image not found.');
}

export async function deleteImage(id: string) {
  await query(`DELETE FROM images WHERE id = $1`, [id]);
}

const REPORT_KINDS = new Set<ReportKind>(['overview', 'donations', 'donors', 'volunteers', 'events']);

export async function createReport(input: { title: string; kind: ReportKind; periodStart: string; periodEnd: string; createdBy: string }) {
  const kind = REPORT_KINDS.has(input.kind) ? input.kind : 'overview';
  const start = input.periodStart;
  const end = input.periodEnd;
  const [donations, donors, volunteers, events] = await Promise.all([
    query<{ status: string; amount: string; n: number }>(
      `SELECT status, COALESCE(SUM(amount), 0)::text AS amount, COUNT(*)::int AS n
       FROM donations
       WHERE ($1 = '' OR created_at::date >= NULLIF($1, '')::date) AND ($2 = '' OR created_at::date <= NULLIF($2, '')::date)
       GROUP BY status`,
      [start, end],
    ),
    query<{ n: number }>(
      `SELECT COUNT(DISTINCT donor_id)::int AS n FROM donations
       WHERE status = 'paid' AND donor_id IS NOT NULL
         AND ($1 = '' OR created_at::date >= NULLIF($1, '')::date) AND ($2 = '' OR created_at::date <= NULLIF($2, '')::date)`,
      [start, end],
    ),
    query<{ status: string; n: number }>(
      `SELECT status, COUNT(*)::int AS n FROM volunteers
       WHERE ($1 = '' OR created_at::date >= NULLIF($1, '')::date) AND ($2 = '' OR created_at::date <= NULLIF($2, '')::date)
       GROUP BY status`,
      [start, end],
    ),
    query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM posts
       WHERE kind = 'event' AND published = TRUE
         AND ($1 = '' OR post_date >= $1) AND ($2 = '' OR post_date <= $2)`,
      [start, end],
    ),
  ]);
  const byStatus = Object.fromEntries(donations.rows.map((row) => [row.status, row]));
  const paid = Number(byStatus.paid?.amount || 0);
  const paidCount = byStatus.paid?.n || 0;
  const volunteerCount = volunteers.rows.reduce((sum, row) => sum + row.n, 0);
  const payload: Record<string, number | string> = {
    paidDonations: paidCount,
    paidAmount: paid,
    failedDonations: byStatus.failed?.n || 0,
    openDonations: byStatus.created?.n || 0,
    donors: donors.rows[0]?.n || 0,
    volunteers: volunteerCount,
    activeVolunteers: volunteers.rows.find((row) => row.status === 'active')?.n || 0,
    events: events.rows[0]?.n || 0,
  };
  const summary = kind === 'donations'
    ? `${paidCount} paid gifts, ₹${paid.toLocaleString('en-IN')} received.`
    : kind === 'donors'
      ? `${payload.donors} donors with a confirmed gift.`
      : kind === 'volunteers'
        ? `${volunteerCount} volunteers, ${payload.activeVolunteers} active.`
        : kind === 'events'
          ? `${payload.events} published events in this period.`
          : `${paidCount} paid gifts, ${payload.donors} donors, ${volunteerCount} volunteers, ${payload.events} events.`;
  const title = input.title.trim() || `${kind[0].toUpperCase()}${kind.slice(1)} report`;
  const id = `rpt_${randomBytes(4).toString('hex')}`;
  const inserted = await query<{ created_at: Date }>(
    `INSERT INTO reports (id, title, kind, period_start, period_end, summary, payload, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,'draft',$8)
     RETURNING created_at`,
    [id, title, kind, start, end, summary, JSON.stringify(payload), input.createdBy || null],
  );
  const report: Report = {
    id,
    title,
    kind,
    periodStart: start,
    periodEnd: end,
    summary,
    payload,
    status: 'draft',
    at: inserted.rows[0].created_at.toISOString(),
  };
  return report;
}

export async function setReportStatus(id: string, status: 'draft' | 'published') {
  const result = await query(`UPDATE reports SET status = $2 WHERE id = $1`, [id, status]);
  if (!result.rowCount) throw new Error('Report not found.');
}

export async function deleteReport(id: string) {
  await query(`DELETE FROM reports WHERE id = $1`, [id]);
}

export function volunteerStatus(value: string): VolunteerStatus {
  return value === 'active' || value === 'inactive' ? value : 'applied';
}

export function volunteerRole(value: string): VolunteerRole {
  return value === 'support' || value === 'fundraiser' ? value : 'volunteer';
}

export async function createTestimonial(input: Omit<Testimonial, 'id' | 'at'>) {
  const name = input.name.trim();
  const quote = input.quote.trim();
  if (!name || !quote) throw new Error('Name and quote are required.');
  const id = `tst_${randomBytes(4).toString('hex')}`;
  const result = await query<{ created_at: Date }>(
    `INSERT INTO testimonials (id, name, role, quote, image, published, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6, (SELECT COALESCE(MIN(sort_order), 1) - 1 FROM testimonials))
     RETURNING created_at`,
    [id, name, input.role.trim(), quote, input.image.trim(), input.published],
  );
  return { id, name, role: input.role.trim(), quote, image: input.image.trim(), published: input.published, at: result.rows[0].created_at.toISOString() };
}

export async function updateTestimonial(id: string, input: Omit<Testimonial, 'id' | 'at'>) {
  const name = input.name.trim();
  const quote = input.quote.trim();
  if (!name || !quote) throw new Error('Name and quote are required.');
  const result = await query(
    `UPDATE testimonials SET name=$2, role=$3, quote=$4, image=$5, published=$6 WHERE id=$1`,
    [id, name, input.role.trim(), quote, input.image.trim(), input.published],
  );
  if (!result.rowCount) throw new Error('Testimonial not found.');
  return { id, name, role: input.role.trim(), quote, image: input.image.trim(), published: input.published };
}

export async function deleteTestimonial(id: string) {
  await query(`DELETE FROM testimonials WHERE id = $1`, [id]);
}

export async function reorderTestimonials(ids: string[]) {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  for (const [index, id] of unique.entries()) {
    await query(`UPDATE testimonials SET sort_order = $2 WHERE id = $1`, [id, index]);
  }
}

const COLLABORATION_KINDS = new Set<CollaborationKind>(['school', 'company', 'organisation', 'inkind', 'other']);

export function collaborationKind(value: string): CollaborationKind {
  return COLLABORATION_KINDS.has(value as CollaborationKind) ? value as CollaborationKind : 'other';
}

export function collaborationStatus(value: string): CollaborationStatus {
  return value === 'reviewed' || value === 'closed' ? value : 'new';
}

export async function createCollaboration(input: Omit<Collaboration, 'id' | 'at' | 'status'> & { status?: CollaborationStatus }) {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  if (!name || !email || !message) throw new Error('Name, email, and a short note are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email.');
  const id = `col_${randomBytes(4).toString('hex')}`;
  const status = input.status || 'new';
  const result = await query<{ created_at: Date }>(
    `INSERT INTO collaborations (id, name, organization, email, phone, kind, message, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING created_at`,
    [id, name, input.organization.trim(), email, input.phone.trim(), input.kind, message, status],
  );
  const saved: Collaboration = {
    id,
    name,
    organization: input.organization.trim(),
    email,
    phone: input.phone.trim(),
    kind: input.kind,
    message,
    status,
    at: result.rows[0].created_at.toISOString(),
  };
  return saved;
}

export async function updateCollaborationStatus(id: string, status: CollaborationStatus) {
  const result = await query(`UPDATE collaborations SET status = $2 WHERE id = $1`, [id, status]);
  if (!result.rowCount) throw new Error('Collaboration request not found.');
}

export async function deleteCollaboration(id: string) {
  await query(`DELETE FROM collaborations WHERE id = $1`, [id]);
}
