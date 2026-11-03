// Use the installed plugin's supported preamble for HTML outside Vite's index transform.
import '@vitejs/plugin-react/preamble';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { OwnerWorkspace } from '../src/staff/owner';
import { TeacherWorkspace } from '../src/staff/teacher';

// Browser-only synthetic fixture. Production application code does not import this file.
export function mountWorkspace(kind: 'owner' | 'teacher') {
  const container = document.getElementById('staff-fixture');
  if (!container) throw new Error('Missing synthetic staff fixture container');
  const root = createRoot(container);
  root.render(createElement(kind === 'owner' ? OwnerWorkspace : TeacherWorkspace));
  return root;
}
