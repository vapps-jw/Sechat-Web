export const containsUppercase = (str: string) => {
  return /[A-Z]/.test(str);
};

export const containsSpecialCharacter = (str: string) => {
  if (str.match(/\W/)) {
    return true;
  } else {
    return false;
  }
};
