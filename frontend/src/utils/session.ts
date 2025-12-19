// Lightweight session helper: in-memory with localStorage fallback for web.
let _user: any = null;

export const setUser = (u: any) => {
  _user = u;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('osra_user', JSON.stringify(u));
    }
  } catch (e) {
    // ignore
  }
};

export const getUser = () => {
  if (_user) return _user;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const s = window.localStorage.getItem('osra_user');
      if (s) {
        _user = JSON.parse(s);
        return _user;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
};

export const clearUser = () => {
  _user = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('osra_user');
    }
  } catch (e) {}
};
