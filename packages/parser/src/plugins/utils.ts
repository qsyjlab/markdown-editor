export function extractTitle(info: string, html = false) {
  if (html) {
    return (
      info.replace(/<!--[^]*?-->/g, "").match(/data-title="(.*?)"/)?.[1] || ""
    );
  }
  return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || "txt";
}

function extractLang(info: string) {
  return info
    .trim()
    .replace(/=(\d*)/, "")
    .replace(/:(no-)?line-numbers({| |$|=\d*).*/, "")
    .replace(/^ansi$/, "");
}






// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[\u0300-\u036F]/g;

/**
 * Default slugification function
 */
export const slugify = (str: string): string =>
  str
    .normalize('NFKD')
    // Remove accents
    .replace(rCombining, '')
    // Remove control characters
    .replace(rControl, '')
    // Replace special characters
    .replace(rSpecial, '-')
    // Remove continuos separators
    .replace(/-{2,}/g, '-')
    // Remove prefixing and trailing separators
    .replace(/^-+|-+$/g, '')
    // ensure it doesn't start with a number (#121)
    .replace(/^(\d)/, '_$1')
    // lowercase
    .toLowerCase();