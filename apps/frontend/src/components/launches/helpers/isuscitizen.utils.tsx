export const isUSCitizen = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const browserLanguage =
    navigator.language || navigator.languages?.[0] || 'en';
  const userLanguage =
    localStorage.getItem('isUS') ||
    (browserLanguage.startsWith('en-US') ? 'US' : 'GLOBAL');

  return userLanguage === 'US';
};
