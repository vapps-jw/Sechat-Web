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

export const getInitials = (fullName: string) => {
  const allNames = fullName.trim().split(" ");
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) {
      acc = `${acc}${curr.charAt(0).toUpperCase()}`;
    }
    return acc;
  }, "");
  return initials;
};
