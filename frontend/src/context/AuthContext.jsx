import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "artnest_user";
const TOKEN_KEY = "token";

const AuthContext = createContext(null);

function load() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(load);
  const [artistBlocked, setArtistBlocked] = useState(false);

  // Login with actual backend user data
  const login = useCallback((userData, token, remember = true) => {
    try {
      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;

      otherStorage.removeItem(STORAGE_KEY);
      otherStorage.removeItem(TOKEN_KEY);

      storage.setItem(STORAGE_KEY, JSON.stringify(userData));

      if (token) {
        storage.setItem(TOKEN_KEY, token);
      }

      setUser(userData);
    } catch (error) {
      console.error("Login storage error:", error);
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);

    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }, []);
  // Block artist actions
  const blockIfArtist = useCallback(() => {
    if (user?.role !== "artist") return false;

    setArtistBlocked(true);
    return true;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      blockIfArtist,
    }),
    [user, login, logout, blockIfArtist],
  );

  const btn = {
    height: 40,
    padding: "0 20px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      {artistBlocked && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="artist-block-title"
          onClick={() => setArtistBlocked(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(54,47,38,0.5)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              borderRadius: 20,
              padding: 28,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#F6E7D0",
                color: "#8A5A22",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 14px",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              !
            </div>

            <h2
              id="artist-block-title"
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#362F26",
                margin: 0,
              }}
            >
              Access restricted
            </h2>

            <p
              style={{
                marginTop: 10,
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "#736153",
              }}
            >
              You don't have access to make a purchase or send a custom Art
              request as an artist. Please login as a buyer.
            </p>

            <div
              style={{
                marginTop: 22,
                display: "flex",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <button
                type="button"
                autoFocus
                onClick={() => setArtistBlocked(false)}
                style={{
                  ...btn,
                  border: "1px solid #E8E1DB",
                  background: "#fff",
                  color: "#362F26",
                }}
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setArtistBlocked(false);
                  window.location.href = "/buyer/login";
                }}
                style={{
                  ...btn,
                  border: "none",
                  background: "#9F5639",
                  color: "#fff",
                }}
              >
                Login as buyer
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return ctx;
}
