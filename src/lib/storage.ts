export type ToolType = 'mockup' | 'banner' | 'privacy' | 'icon';

export interface UserProject {
  id: string;
  user_id?: string;
  name: string;
  tool_type: ToolType;
  data: Record<string, unknown>;
  preview_image_url?: string | null;
  created_at: string;
  updated_at: string;
  isLocal?: boolean;
}

const STORAGE_KEY = 'devtoo_local_projects';

// Event dispatched when local projects change so UI components can re-render reactively
export const LOCAL_PROJECTS_CHANGED_EVENT = 'devtoo_local_projects_changed';

export function notifyProjectsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOCAL_PROJECTS_CHANGED_EVENT));
  }
}

/**
 * Get all saved local projects, sorted by updated_at descending
 */
export function getLocalProjects(): UserProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: UserProject[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map((p) => ({ ...p, isLocal: true })).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } catch (err) {
    console.error('Failed to read local projects:', err);
    return [];
  }
}

/**
 * Save or update a project in local storage
 */
export function saveLocalProject(
  name: string,
  toolType: ToolType,
  data: Record<string, unknown>,
  previewImageUrl?: string | null,
  existingId?: string
): UserProject {
  const existingList = getLocalProjects();
  const now = new Date().toISOString();

  let targetProject: UserProject;

  if (existingId) {
    const idx = existingList.findIndex((p) => p.id === existingId);
    if (idx !== -1) {
      targetProject = {
        ...existingList[idx],
        name: name.trim() || existingList[idx].name,
        tool_type: toolType,
        data,
        preview_image_url: previewImageUrl !== undefined ? previewImageUrl : existingList[idx].preview_image_url,
        updated_at: now,
        isLocal: true,
      };
      existingList[idx] = targetProject;
    } else {
      targetProject = {
        id: existingId,
        user_id: 'local_user',
        name: name.trim() || 'İsimsiz Proje',
        tool_type: toolType,
        data,
        preview_image_url: previewImageUrl || null,
        created_at: now,
        updated_at: now,
        isLocal: true,
      };
      existingList.unshift(targetProject);
    }
  } else {
    targetProject = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user_id: 'local_user',
      name: name.trim() || 'İsimsiz Proje',
      tool_type: toolType,
      data,
      preview_image_url: previewImageUrl || null,
      created_at: now,
      updated_at: now,
      isLocal: true,
    };
    existingList.unshift(targetProject);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingList));
    notifyProjectsChanged();
  } catch (err) {
    console.error('Failed to save local project:', err);
    throw new Error('Tarayıcı depolama alanı dolu veya izin verilmedi.');
  }

  return targetProject;
}

/**
 * Delete a local project by ID
 */
export function deleteLocalProject(id: string): boolean {
  try {
    const list = getLocalProjects();
    const updated = list.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyProjectsChanged();
    return true;
  } catch (err) {
    console.error('Failed to delete local project:', err);
    return false;
  }
}

/**
 * Download project payload as a .devtoo file
 */
export function exportProjectToFile(project: UserProject | { tool_type: ToolType; data: Record<string, unknown>; name?: string }) {
  const exportPayload = {
    format: 'devtoo-project',
    version: 1,
    tool_type: project.tool_type,
    name: project.name || 'devtoo-project',
    exported_at: new Date().toISOString(),
    data: project.data,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (project.name || project.tool_type).replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  a.download = `devtoo-${safeName}-${new Date().toISOString().slice(0, 10)}.devtoo`;
  a.click();
  URL.revokeObjectURL(url);
}
