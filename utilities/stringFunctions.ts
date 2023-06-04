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
  let allNames = fullName.trim().split(" ");
  if (allNames.length == 1) {
    allNames = [...fullName.trim()];
  }
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) {
      acc = `${acc}${curr.charAt(0).toUpperCase()}`;
    }
    return acc;
  }, "");
  return initials;
};

export const stringToColor = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `hsl(${hash % 360}, 85%, 35%)`;
};
