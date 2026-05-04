export type AppRole = 'customer' | 'driver' | 'restaurant' | 'admin';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  restaurantId?: string | null;
  restaurantName?: string | null;
  driverId?: string | null;
}

const getRoleSessionKey = (role: AppRole) => `mealgo_last_session_${role}`;

export const setCurrentUserSession = (user: StoredUser) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem(getRoleSessionKey(user.role), JSON.stringify(user));
  window.dispatchEvent(new Event('userChanged'));
};

export const getCurrentUserSession = (): StoredUser | null => {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getRoleSession = (role: AppRole): StoredUser | null => {
  const raw = localStorage.getItem(getRoleSessionKey(role));
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearRoleSession = (role: AppRole) => {
  const currentUser = getCurrentUserSession();
  if (currentUser?.role === role) {
    localStorage.removeItem('currentUser');
  }
  localStorage.removeItem(getRoleSessionKey(role));
  window.dispatchEvent(new Event('userChanged'));
};
