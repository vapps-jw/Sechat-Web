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

export const hasOccurrences = (searchIndex: string, query: string): boolean => {
  const queryParts = query.toLowerCase().split(" ");
  if (queryParts.length > 0) {
    return queryParts
      .map((x) => searchIndex.indexOf(x) > -1)
      .reduce((a, b) => a && b);
  }

  return true;
};

export const addUniqueId = (input: string, tag: string) => {
  const words = input.split(" ");
  for (let index = 0; index < words.length; index++) {
    if (index !== 0 && words[index - 1] === tag) {
      words.splice(index, 0, `id="${uuidv4()}"`);
    }
  }
  return words.join(" ");
};

export const stringToColor = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `hsl(${hash % 360}, 85%, 35%)`;
};

export const isAnchor = (str: string) => {
  return /^\<a.*\>.*\<\/a\>/i.test(str);
};

export const findAll = (regexPattern, sourceString) => {
  var output = [];
  var match;
  var regexPatternWithGlobal = regexPattern.global
    ? regexPattern
    : RegExp(regexPattern, regexPattern.flags + "g");
  while ((match = regexPatternWithGlobal.exec(sourceString))) {
    output.push(match);
    if (match[0].length == 0) {
      regexPatternWithGlobal.lastIndex += 1;
    }
  }
  return output;
};

export const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
