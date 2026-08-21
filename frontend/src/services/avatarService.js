import { API_BASE } from './apiConfig';

export async function fetchAvatarObjectUrl(userId) {
  if (!userId) {
    return null;
  }

  const response = await fetch(`${API_BASE}/v1/users/${userId}/avatar`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function revokeAvatarObjectUrl(objectUrl) {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
}
