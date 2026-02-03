const AUTH_KEY = 'kb_admin_auth';
const PIN_KEY = 'kb_admin_pin';

export const requireAdminPin = true;

export const getAdminPin = () => {
  return localStorage.getItem(PIN_KEY) || '1234';
};

export const setAdminPin = (pin: string) => {
  localStorage.setItem(PIN_KEY, pin);
};

export const isAdminAuthenticated = () => {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
};

export const authenticateAdmin = (pin: string) => {
  if (pin === getAdminPin()) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const clearAdminSession = () => {
  sessionStorage.removeItem(AUTH_KEY);
};
