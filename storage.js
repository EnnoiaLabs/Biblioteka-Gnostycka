(function initializeStorage(global) {
  function createStorage(nativeStorage) {
    const memory = new Map();

    return {
      getItem(key) {
        const normalizedKey = String(key);
        try {
          const value = nativeStorage?.getItem(normalizedKey);
          if (value !== null && value !== undefined) return value;
        } catch {
          // Continue with the in-memory fallback when browser storage is blocked.
        }
        return memory.has(normalizedKey) ? memory.get(normalizedKey) : null;
      },

      setItem(key, value) {
        const normalizedKey = String(key);
        const normalizedValue = String(value);
        memory.set(normalizedKey, normalizedValue);
        try {
          nativeStorage?.setItem(normalizedKey, normalizedValue);
        } catch {
          // The current session still works through the in-memory fallback.
        }
      },

      removeItem(key) {
        const normalizedKey = String(key);
        memory.delete(normalizedKey);
        try {
          nativeStorage?.removeItem(normalizedKey);
        } catch {
          // The value has already been removed from the session fallback.
        }
      }
    };
  }

  let nativeStorage = null;
  try {
    nativeStorage = global.localStorage;
  } catch {
    // Access to localStorage can itself throw in restricted browser contexts.
  }

  global.GNOSTYK_CREATE_STORAGE = createStorage;
  global.GNOSTYK_STORAGE = createStorage(nativeStorage);
})(window);
