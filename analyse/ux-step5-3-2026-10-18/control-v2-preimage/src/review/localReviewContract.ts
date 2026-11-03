/** Local 5.3 rehearsal transport. These types contain no canonical content or authority. */
export const LOCAL_REVIEW_BASE = '/__mcy_review/v1' as const;
export const LOCAL_REVIEW_BOOTSTRAP_PATH = `${LOCAL_REVIEW_BASE}/bootstrap` as const;

export type LocalReviewMode = 'fictional_rehearsal' | 'owner_local_preview';
export type LocalReviewPermission = 'list' | 'read' | 'asset' | 'note' | 'draft' | 'review';
export type LocalReviewErrorCode =
  | 'SESSION_REQUIRED' | 'SESSION_EXPIRED' | 'SESSION_REVOKED'
  | 'FORBIDDEN' | 'NOT_FOUND' | 'VERSION_CONFLICT' | 'SOURCE_CHANGED'
  | 'MEDIA_UNAVAILABLE' | 'INVALID_INPUT' | 'REVIEW_UNAVAILABLE';

export type LocalReviewError = { code: LocalReviewErrorCode; message: string };
export type LocalReviewSession = {
  authenticated: boolean;
  mode: LocalReviewMode | null;
  bootstrapPath: typeof LOCAL_REVIEW_BOOTSTRAP_PATH;
  epoch: string | null;
  expiresAt: string | null;
  actorLabel: string | null;
  permissions: LocalReviewPermission[];
};

export type LocalReviewMedia = {
  id: string;
  stepId: string | null;
  status: 'draft_present' | 'identity_blocked' | 'not_produced';
  alt: string;
  caption: string;
  assetUrl: string | null;
  mime: string | null;
};

export type LocalReviewStep = {
  id: string;
  order: number;
  title: string;
  body: string;
  detail: string | null;
  entry: string | null;
  exit: string | null;
  alternative: string | null;
  stopCue: string | null;
  mediaIds: string[];
};

export type LocalReviewUnitSummary = {
  key: string; // opaque URL key; never a filesystem path
  id: string;
  revision: string;
  locale: string;
  kind: string;
  title: string;
  shortTitle: string;
  sourceHash: string;
  mediaAvailable: number;
  mediaBlocked: number;
  reviewState: 'unreviewed' | 'changes_requested' | 'fixture_reviewed';
};

export type LocalReviewUnit = LocalReviewUnitSummary & {
  intro: string;
  learningObjectives: string[];
  audience: string;
  prerequisites: string[];
  preparation: string[];
  stopGuidance: string;
  steps: LocalReviewStep[];
  media: LocalReviewMedia[];
  sourceRefs: Array<{ courseId: string; lessonId: string; youtubeId: string; relation: string; contentObserved: boolean }>;
  notes: string | null;
};

export type LocalReviewListResponse = { epoch: string; items: LocalReviewUnitSummary[] };
export type LocalReviewReadResponse = { epoch: string; unit: LocalReviewUnit };
export type LocalReviewMutationResponse = { epoch: string; unit: LocalReviewUnit };
export type LocalReviewWritePrecondition = {
  epoch: string; // optimistic conflict check; server derives authority from its lease
  sourceHash: string;
  revision: string;
};
export type LocalReviewNoteRequest = LocalReviewWritePrecondition & { notes: string };
export type LocalReviewDraftRequest = LocalReviewWritePrecondition & { title: string };
export type LocalReviewDecisionRequest = LocalReviewWritePrecondition & {
  decision: 'changes_requested' | 'fixture_reviewed';
};

/** All mutation requests require same-origin Origin, JSON and this fixed intent header. */
export const LOCAL_REVIEW_INTENT_HEADER = 'X-MCY-Review-Intent' as const;
export const LOCAL_REVIEW_INTENT_VALUE = '1' as const;

export const localReviewPaths = {
  session: `${LOCAL_REVIEW_BASE}/session`,
  list: `${LOCAL_REVIEW_BASE}/units`,
  read: (opaqueKey: string) => `${LOCAL_REVIEW_BASE}/units/${encodeURIComponent(opaqueKey)}`,
  asset: (opaqueKey: string, slot: string) => `${LOCAL_REVIEW_BASE}/units/${encodeURIComponent(opaqueKey)}/assets/${encodeURIComponent(slot)}`,
  note: (opaqueKey: string) => `${LOCAL_REVIEW_BASE}/units/${encodeURIComponent(opaqueKey)}/notes`,
  draft: (opaqueKey: string) => `${LOCAL_REVIEW_BASE}/units/${encodeURIComponent(opaqueKey)}/draft`,
  review: (opaqueKey: string) => `${LOCAL_REVIEW_BASE}/units/${encodeURIComponent(opaqueKey)}/review`,
} as const;
