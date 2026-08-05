export const getAvatarInitial = (displayName) => {
  if (!displayName || typeof displayName !== 'string') return '?';
  const match = displayName.trim().match(/[A-Za-z]/);
  return match ? match[0].toUpperCase() : '?';
};
