type Mutation<T> = {
  mutateAsync: () => Promise<void>,
  data: T | undefined
}
export async function fromStorage<T>(key: string, mutation: Mutation<T>, holdTime?: number) {
  // console.log('test encode decode', '{"name": "damar", "id"}', lzw_encode('abcdefgh'), lzw_decode(lzw_encode('abcdefgh')))
  storageSizeCheck();
  clearStorage(key, holdTime);
  if (localStorage.getItem(key)) {
    return JSON.parse(lzw_decode(localStorage.getItem(key) ?? "")) as T;
  } else {
    await mutation.mutateAsync();
    if (mutation.data) {
      localStorage.setItem(key, lzw_encode(JSON.stringify(mutation.data)));
    } else {
      localStorage.removeItem(key);
      localStorage.removeItem(`expired_data_storage:${key}`);
      return null;
    }
  }
  return JSON.parse(lzw_decode(localStorage.getItem(key) ?? "")) as T;
}

function clearStorage(key: string, holdTime?: number) {
  if (checkExpired(key) && localStorage.getItem(key)) {
    localStorage.removeItem(key);
    localStorage.removeItem(`expired_data_storage:${key}`);
  }

  if (!localStorage.getItem(`expired_data_storage:${key}`)) {
    localStorage.setItem(
      `expired_data_storage:${key}`,
      (new Date().getTime() + 1000 * 60 * (holdTime ?? 3)).toString(),
    );
  }
}

function checkExpired(key: string) {
  return (
    localStorage.getItem(`expired_data_storage:${key}`) &&
    new Date().getTime() >=
      Number(localStorage.getItem(`expired_data_storage:${key}`))
  );
}

function storageSizeCheck() {
  let _lsTotal = 0,
    _xLen,
    _x;
  for (_x in localStorage) {
    if (!localStorage.hasOwnProperty(_x)) {
      continue;
    }
    const value = localStorage.getItem(_x);
    _xLen = ((value ? value.length : 0) + _x.length) * 2;
    _lsTotal += _xLen;
    // console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
  }
  const max = 5 * 1024;
  const val = _lsTotal / 1024;
  let css = "";
  if (val / max < 1 && val / max >= 0.75) {
    css = "background: #222; color: red";
  } else if (val / max < 0.75 && val / max >= 0.5) {
    css = "background: #222; color: orange";
  } else if (val / max < 0.5 && val / max >= 0.25) {
    css = "background: #222; color: yellow";
  } else {
    css = "background: #222; color: green";
  }

  console.log(
    "%c LocalStorage Total = " +
      (_lsTotal / 1024).toFixed(2) +
      " KB" +
      ` (${((_lsTotal * 100) / (5 * 1000 * 1024)).toFixed(2)}%)`,
    css,
  );

  _lsTotal = 0;
  _xLen = undefined;
  _x = undefined;
  for (_x in sessionStorage) {
    if (!sessionStorage.hasOwnProperty(_x)) {
      continue;
    }
    const sessionValue = sessionStorage.getItem(_x);
    _xLen = ((sessionValue ? sessionValue.length : 0) + _x.length) * 2;
    _lsTotal += _xLen;
    // console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
  }

  const maxSession = 5 * 1024;
  const valSession = _lsTotal / 1024;
  let cssSession = "";
  if (valSession / maxSession < 1 && valSession / maxSession >= 0.75) {
    cssSession = "background: #222; color: red";
  } else if (valSession / maxSession < 0.75 && valSession / maxSession >= 0.5) {
    cssSession = "background: #222; color: orange";
  } else if (valSession / maxSession < 0.5 && valSession / maxSession >= 0.25) {
    cssSession = "background: #222; color: yellow";
  } else {
    cssSession = "background: #222; color: green";
  }

  console.log(
    "%c SessionStorage Total = " +
      (_lsTotal / 1024).toFixed(2) +
      " KB" +
      ` (${((_lsTotal * 100) / (5 * 1000 * 1024)).toFixed(2)}%)`,
    cssSession,
  );
}

function lzw_encode(s: string) {
  const dict: Record<string, number> = {};
  const data = (s + "").split("");
  const out: number[] = [];
  let currChar: string;
  let phrase: string = data[0] ?? "";
  let code = 256;
  for (let i = 1; i < data.length; i++) {
    currChar = data[i] ?? "";
    if (phrase && dict[phrase + currChar] != null) {
      phrase += currChar;
    } else {
      out.push(phrase.length > 1 ? (dict[phrase] ?? 0) : phrase.charCodeAt(0));
      dict[phrase + currChar] = code;
      code++;
      phrase = currChar;
    }
  }
  out.push(phrase.length > 1 ? (dict[phrase] ?? 0) : phrase.charCodeAt(0));
  const encoded: string[] = [];
  for (let i = 0; i < out.length; i++) {
    encoded[i] = String.fromCharCode(out[i] ?? 0);
  }
  return encoded.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s: string) {
  if (s.length === 0) return "{}";
  const dict: Record<number, string> = {};
  const data = (s + "").split("");
  let currChar = data[0] ?? "";
  let oldPhrase: string = currChar;
  const out = [currChar];
  let code = 256;
  let phrase: string;
  for (let i = 1; i < data.length; i++) {
    const currCode = (data[i] ?? '').charCodeAt(0);
    if (currCode < 256) {
      phrase = data[i] ?? "";
    } else {
      phrase = dict[currCode] ?? (oldPhrase + currChar);
    }
    out.push(phrase);
    currChar = phrase.charAt(0);
    dict[code] = oldPhrase + currChar;
    code++;
    oldPhrase = phrase;
  }
  return out.join("");
}
