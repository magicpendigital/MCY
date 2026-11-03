// An account returning after A → B → A is a new session for pending UI work.
let actor: string | null = null;
let generation = 0;
export function observeLearnerSession(userId: string | null) {
  if (userId !== actor) { actor = userId; generation++; }
}
export function learnerSessionGeneration() { return generation; }
