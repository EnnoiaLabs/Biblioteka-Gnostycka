window.GNOSTYK_CHANGELOG_TOOLS = (() => {
function pushUniquePoint(list, point) {
  const normalized = String(point || "").trim();
  if (!normalized || list.includes(normalized)) return;
  list.push(normalized);
}

function compareVersionsDesc(a, b) {
  const left = String(a || "").split(".").map(part => Number(part) || 0);
  const right = String(b || "").split(".").map(part => Number(part) || 0);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const diff = (right[index] || 0) - (left[index] || 0);
    if (diff) return diff;
  }
  return 0;
}

function parseChangelogGroups(text) {
  const byVersion = new Map();
  let currentGroup = null;
  let activeLocale = "all";

  const ensureGroup = (version, title = "") => {
    let group = byVersion.get(version);
    if (!group) {
      group = { version, title: title || "", points: { pl: [], en: [], all: [] } };
      byVersion.set(version, group);
    } else if (!group.title && title) {
      group.title = title;
    }
    return group;
  };

  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const heading = rawLine.match(/^#{1,3}\s+(?:(?:Biblioteka Gnozy|Gnostic Library|Version)\s+)?([0-9]+\.[0-9]+\.[0-9]+)(?:\s+-\s+(.+))?\s*$/);
    if (heading) {
      currentGroup = ensureGroup(heading[1], heading[2] || "");
      activeLocale = "all";
      continue;
    }

    const localeHeading = rawLine.match(/^\s*(?:#{2,4}\s*)?(PL|Polski|EN|English)\s*:?\s*$/i);
    if (currentGroup && localeHeading) {
      const label = localeHeading[1].toLowerCase();
      activeLocale = label === "en" || label === "english" ? "en" : "pl";
      continue;
    }

    const bullet = rawLine.match(/^\s*[-*]\s+(.+?)\s*$/);
    if (currentGroup && bullet) {
      const rawPoint = bullet[1];
      const prefixed = rawPoint.match(/^(PL|EN):\s*(.+)$/i);
      if (prefixed) {
        const locale = prefixed[1].toLowerCase() === "en" ? "en" : "pl";
        pushUniquePoint(currentGroup.points[locale], prefixed[2]);
      } else {
        pushUniquePoint(currentGroup.points[activeLocale], rawPoint);
      }
    }
  }

  return Array.from(byVersion.values()).sort((a, b) => compareVersionsDesc(a.version, b.version));
}

return { compareVersionsDesc, parseChangelogGroups };
})();
