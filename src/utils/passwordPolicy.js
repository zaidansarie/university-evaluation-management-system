export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  noSpaces: true,
  specialChars: '@#$%&*!?_-'
};

/**
 * Validates a password against the strict policy and returns detailed results.
 * @param {string} password 
 * @returns {object} Object containing individual rule results and overall validity
 */
export const validatePassword = (password) => {
  const p = password || '';
  
  const minLength = p.length >= PASSWORD_POLICY.minLength;
  const uppercase = /[A-Z]/.test(p);
  const lowercase = /[a-z]/.test(p);
  const number = /[0-9]/.test(p);
  // Special char must be strictly one of the allowed set
  const special = new RegExp(`[${PASSWORD_POLICY.specialChars}]`).test(p);
  const noSpaces = !/\s/.test(p);
  
  const isValid = minLength && uppercase && lowercase && number && special && noSpaces;

  return {
    isValid,
    checks: {
      minLength,
      uppercase,
      lowercase,
      number,
      special,
      noSpaces
    }
  };
};
