import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { profileInfo } from "./constants";
import { useAppContext } from "./AppContext";
import { floatToTime } from "./utils";

const gameModes = [
  { id: "surf", label: "Surf", icon: "〰" },
  { id: "bhop", label: "Bhop", icon: "↗" },
  { id: "kz", label: "KZ", icon: "⌁" },
];

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`İstek başarısız (${response.status})`);
  }
  const json = await response.json();
  if (json?.result && json.result !== "success") {
    throw new Error("xplay.gg isteği tamamlayamadı.");
  }
  return json;
}

function getRecordForMap(records, mapName) {
  return records?.find((record) => record?.map === mapName);
}

function getMapImageUrl(mapName) {
  return `https://cdn.xplay.gg/img/site/common/maps/${encodeURIComponent(mapName)}.jpg`;
}

function MapCompletionCount({ count, error, onVisible, mapName }) {
  const cellRef = useRef(null);

  useEffect(() => {
    const cell = cellRef.current;
    if (!cell || count !== undefined || error) return undefined;

    if (!("IntersectionObserver" in window)) {
      onVisible(mapName);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisible(mapName);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" },
    );

    observer.observe(cell);
    return () => observer.disconnect();
  }, [count, error, mapName, onVisible]);

  return (
    <td ref={cellRef} className="completion-count-cell" title={error || undefined}>
      {count ?? (error ? "—" : <span className="count-loading" aria-label="Yükleniyor">…</span>)}
    </td>
  );
}

function getServer(profile) {
  const server = profile?.serverData;
  if (!server || typeof server !== "object") return null;

  const host = server.IP || server.ip || server.host || server.address;
  const port = server.port;
  if (!host || !port) return null;

  return {
    host,
    port,
    map: server.currentMap || server.map || "",
    url: `steam://connect/${host}:${port}`,
  };
}

function App() {
  const { selectedProfiles, setSelectedProfiles, profilesData } = useAppContext();
  const [mode, setMode] = useState("surf");
  const [maps, setMaps] = useState([]);
  const [records, setRecords] = useState({});
  const [mapSearch, setMapSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordErrors, setRecordErrors] = useState({});
  const [mapError, setMapError] = useState("");
  const [detailMap, setDetailMap] = useState("");
  const [detailPage, setDetailPage] = useState(1);
  const [detailRecords, setDetailRecords] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isMapImageExpanded, setIsMapImageExpanded] = useState(false);
  const [mapCountState, setMapCountState] = useState({});
  const mapCountCache = useRef(new Map());

  const loadMapCount = useCallback((mapName) => {
    const cacheKey = `${mode}:${mapName}`;
    const cached = mapCountCache.current.get(cacheKey);
    if (cached) return cached;

    const request = (async () => {
      let page = 1;
      let total = 0;
      let rows;

      do {
        const params = new URLSearchParams({
          mapName,
          page: String(page),
          limit: "500",
          level: "0",
          style: "0",
        });
        const response = await fetchJson(`/surf-api/leaderboard/data?${params.toString()}`);
        rows = response?.data?.records;
        if (!Array.isArray(rows)) {
          throw new Error("Harita tamamlayan sayısı alınamadı.");
        }
        total += rows.length;
        page += 1;
      } while (rows.length === 500);

      setMapCountState((current) => ({
        ...current,
        [cacheKey]: { count: total },
      }));
      return total;
    })().catch((error) => {
      mapCountCache.current.delete(cacheKey);
      setMapCountState((current) => ({
        ...current,
        [cacheKey]: { error: error.message || "Tamamlayan sayısı alınamadı." },
      }));
      return undefined;
    });

    mapCountCache.current.set(cacheKey, request);
  }, [mode]);

  function openMapDetails(mapName) {
    setDetailMap(mapName);
    setDetailPage(1);
    setDetailRecords([]);
    setDetailError("");
  }

  const closeMapDetails = useCallback(() => {
    setDetailMap("");
    setDetailRecords([]);
    setDetailError("");
    setIsMapImageExpanded(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMaps() {
      setIsLoadingMaps(true);
      setMapError("");
      try {
        const response = await fetchJson("/surf-api/leaderboard/maps", controller.signal);
        const modeMaps = response?.data?.[mode];
        if (!Array.isArray(modeMaps)) {
          throw new Error(`${mode.toUpperCase()} haritaları bulunamadı.`);
        }
        setMaps(modeMaps);
      } catch (error) {
        if (error.name !== "AbortError") {
          setMaps([]);
          setMapError(error.message || "Haritalar yüklenemedi.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingMaps(false);
      }
    }

    loadMaps();
    return () => controller.abort();
  }, [mode]);

  useEffect(() => {
    if (!detailMap) return undefined;

    const controller = new AbortController();
    const params = new URLSearchParams({
      mapName: detailMap,
      page: String(detailPage),
      limit: "50",
      level: "0",
      style: "0",
    });

    async function loadMapDetails() {
      setIsLoadingDetails(true);
      setDetailError("");
      try {
        const response = await fetchJson(
          `/surf-api/leaderboard/data?${params.toString()}`,
          controller.signal,
        );
        const rows = response?.data?.records;
        if (!Array.isArray(rows)) {
          throw new Error("Harita sıralaması beklenen biçimde alınamadı.");
        }
        setDetailRecords(rows);
      } catch (error) {
        if (error.name !== "AbortError") {
          setDetailRecords([]);
          setDetailError(error.message || "Harita sıralaması yüklenemedi.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingDetails(false);
      }
    }

    loadMapDetails();
    return () => controller.abort();
  }, [detailMap, detailPage]);

  useEffect(() => {
    if (!detailMap) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (isMapImageExpanded) setIsMapImageExpanded(false);
        else closeMapDetails();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [closeMapDetails, detailMap, isMapImageExpanded]);

  useEffect(() => {
    const controller = new AbortController();
    const selected = Object.entries(selectedProfiles);

    if (selected.length === 0) {
      setRecords({});
      setRecordErrors({});
      setIsLoadingRecords(false);
      return () => controller.abort();
    }

    async function loadRecords() {
      setRecords({});
      setRecordErrors({});
      setIsLoadingRecords(true);
      const results = await Promise.all(
        selected.map(async ([name, profile]) => {
          try {
            const response = await fetchJson(
              `/surf-api/leaderboard/profile?accountId=${encodeURIComponent(profile.id)}`,
              controller.signal,
            );
            const profileRecords = response?.data?.records?.[mode];
            if (!Array.isArray(profileRecords)) {
              throw new Error("Bu oyuncu için derece verisi bulunamadı.");
            }
            return { name, records: profileRecords };
          } catch (error) {
            if (error.name === "AbortError") return null;
            return { name, error: error.message || "Dereceler yüklenemedi." };
          }
        }),
      );

      if (controller.signal.aborted) return;
      setRecords(
        results.reduce((allRecords, result) => {
          if (result?.records) allRecords[result.name] = result.records;
          return allRecords;
        }, {}),
      );
      setRecordErrors(
        results.reduce((errors, result) => {
          if (result?.error) errors[result.name] = result.error;
          return errors;
        }, {}),
      );
      setIsLoadingRecords(false);
    }

    loadRecords();
    return () => controller.abort();
  }, [mode, selectedProfiles]);

  const visibleMaps = useMemo(() => {
    const selectedNames = Object.keys(selectedProfiles);
    const query = mapSearch.trim().toLowerCase();
    let filtered = maps
      .filter((mapName) => !query || mapName.toLowerCase().includes(query))
      .map((mapName) => {
        const playerRecords = selectedNames.reduce((all, name) => {
          all[name] = getRecordForMap(records[name], mapName);
          return all;
        }, {});
        const completed = Object.values(playerRecords).filter(Boolean).length;
        const countKey = `${mode}:${mapName}`;
        return {
          name: mapName,
          playerRecords,
          completed,
          totalCompleted: mapCountState[countKey]?.count,
        };
      });

    if (statusFilter === "finished") {
      filtered = filtered.filter((map) => map.completed === selectedNames.length);
    } else if (statusFilter === "unfinished") {
      filtered = filtered.filter((map) => map.completed === 0);
    } else if (statusFilter.startsWith("player:")) {
      const profileName = statusFilter.slice("player:".length);
      filtered = filtered.filter((map) => Boolean(map.playerRecords[profileName]));
    } else if (statusFilter.startsWith("only:")) {
      const profileName = statusFilter.slice("only:".length);
      filtered = filtered.filter(
        (map) =>
          Boolean(map.playerRecords[profileName]) &&
          selectedNames.every(
            (name) => name === profileName || !map.playerRecords[name],
          ),
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === "most-completed") {
        return (
          (b.totalCompleted ?? -1) - (a.totalCompleted ?? -1) ||
          a.name.localeCompare(b.name)
        );
      }
      if (sortBy === "best-rank") {
        const rank = (map) =>
          Math.min(
            ...Object.values(map.playerRecords)
              .filter(Boolean)
              .map((record) => Number(record.position) || Infinity),
          );
        return rank(a) - rank(b) || a.name.localeCompare(b.name);
      }
      if (sortBy.startsWith("time:")) {
        const profileName = sortBy.slice("time:".length);
        return (
          (Number(a.playerRecords[profileName]?.time) || Infinity) -
          (Number(b.playerRecords[profileName]?.time) || Infinity)
        );
      }
      return a.name.localeCompare(b.name);
    });
  }, [maps, mapCountState, mapSearch, mode, records, selectedProfiles, sortBy, statusFilter]);

  const selectedNames = Object.keys(selectedProfiles);
  const completedCount = selectedNames.reduce(
    (total, name) => total + (records[name]?.length || 0),
    0,
  );
  const errorMessages = Object.values(recordErrors);

  function toggleProfile(name) {
    setSelectedProfiles((current) => {
      const next = { ...current };
      if (next[name]) delete next[name];
      else next[name] = profileInfo[name];
      return next;
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Surfboard ana sayfa">
          <span className="brand-mark">S</span>
          <span>SURF<span className="brand-muted">BOARD</span></span>
        </a>
        <div className="topbar-right">
          <span className="live-dot" />
          <span>xplay.gg canlı verileri</span>
          <a className="site-link" href="https://surf.xplay.gg/" target="_blank" rel="noreferrer">
            xplay.gg <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> ARKADAŞLARINLA KIYASLA</div>
          <h1>Her haritada<br /><span>en iyi derecen.</span></h1>
          <p>xplay.gg surf, bhop ve KZ derecelerinizi tek yerde keşfedin.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-icon">⌖</span>
            <span className="stat-value">{maps.length || "—"}</span>
            <span className="stat-label">{mode.toUpperCase()} HARİTALARI</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon-green">✓</span>
            <span className="stat-value">{completedCount}</span>
            <span className="stat-label">TOPLAM TAMAMLAMA</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon-purple">♟</span>
            <span className="stat-value">{selectedNames.length}</span>
            <span className="stat-label">SEÇİLİ OYUNCU</span>
          </div>
        </div>
      </section>

      <section className="players-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">EKİBİN</span>
            <h2>Oyuncular</h2>
          </div>
          <span className="section-hint">Karşılaştırmak için oyuncu seç</span>
        </div>
        <div className="players-grid">
          {Object.entries(profileInfo).map(([name, info]) => {
            const profile = profilesData?.[name]?.data;
            const server = getServer(profile);
            const displayName =
              profile?.name && profile.name !== "undefined" ? profile.name : name;
            const selected = Boolean(selectedProfiles[name]);
            return (
              <article
                className={`player-card${selected ? " is-selected" : ""}`}
                key={name}
              >
                <button
                  type="button"
                  className="player-select"
                  onClick={() => toggleProfile(name)}
                  aria-pressed={selected}
                  aria-label={`${displayName} ${selected ? "seçimini kaldır" : "seç"}`}
                >
                  <span className="player-avatar-wrap">
                    <img
                      className="player-avatar"
                      src={profile?.avatar || `/avatar/${name}.jpg`}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.src = `/avatar/${name}.jpg`;
                      }}
                    />
                    <span className={`presence-dot${server ? " online" : ""}`} />
                  </span>
                  <span className="player-info">
                    <span className="player-name">{displayName}</span>
                    <span className="player-id">ID {info.id}</span>
                  </span>
                  <span className={`selection-check${selected ? " checked" : ""}`}>
                    {selected ? "✓" : "+"}
                  </span>
                </button>
                {server ? (
                  <a className="server-link" href={server.url}>
                    <span className="server-icon">⌁</span>
                    <span className="server-details">
                      <strong>Oyunda · {server.map || "Sunucuda"}</strong>
                      <small>{server.host}:{server.port}</small>
                    </span>
                    <span className="server-arrow">↗</span>
                  </a>
                ) : profilesData?.[name]?.error ? (
                            <div className="offline-status profile-error" title={profilesData[name].error}>
                              <span className="offline-dot" /> Profil bilgisi alınamadı
                  </div>
                          ) : (
                            <div className="offline-status">
                              <span className="offline-dot" /> Çevrimdışı
                            </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="leaderboard-section">
        <div className="leaderboard-heading">
          <div>
            <span className="section-kicker">DERECE TABLOSU</span>
            <h2>Harita keşfi</h2>
          </div>
          <div className="mode-tabs" role="tablist" aria-label="Oyun modu">
            {gameModes.map((gameMode) => (
              <button
                type="button"
                role="tab"
                aria-selected={mode === gameMode.id}
                className={`mode-tab${mode === gameMode.id ? " active" : ""}`}
                key={gameMode.id}
                onClick={() => setMode(gameMode.id)}
              >
                <span>{gameMode.icon}</span>{gameMode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-bar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={mapSearch}
              onChange={(event) => setMapSearch(event.target.value)}
              placeholder="Harita ara..."
              aria-label="Harita ara"
            />
            {mapSearch && (
              <button type="button" onClick={() => setMapSearch("")} aria-label="Aramayı temizle">×</button>
            )}
          </label>
          <label className="select-wrap">
            <span>FİLTRE</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Tüm haritalar</option>
              <option value="finished">Herkes tamamladı</option>
              <option value="unfinished">Henüz tamamlanmadı</option>
              {selectedNames.map((name) => (
                <optgroup label={name} key={name}>
                  <option value={`player:${name}`}>{name} bitirdi</option>
                  <option value={`only:${name}`}>Sadece {name} bitirdi</option>
                </optgroup>
              ))}
            </select>
          </label>
          <label className="select-wrap sort-select">
            <span>SIRALAMA</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name">Harita adı</option>
              <option value="most-completed">En çok tamamlanan</option>
              <option value="best-rank">En iyi sıra</option>
              {selectedNames.map((name) => (
                <option value={`time:${name}`} key={name}>En iyi süre · {name}</option>
              ))}
            </select>
          </label>
        </div>

        {errorMessages.length > 0 && (
          <div className="inline-error" role="status">
            Bazı oyuncu dereceleri alınamadı: {Object.keys(recordErrors).join(", ")}.
            Veriler kısa süre sonra tekrar denenebilir.
          </div>
        )}
        {mapError && <div className="inline-error" role="alert">{mapError}</div>}

        <div className="table-wrap">
          <table className="records-table">
            <thead>
              <tr>
                <th className="rank-col">#</th>
                <th>HARİTA</th>
                <th>TAMAMLAYAN</th>
                {selectedNames.map((name) => (
                  <th key={name}><span className="column-player"><i style={{ background: profileInfo[name].color }} />{name}</span></th>
                ))}
                <th aria-label="xplay.gg bağlantısı" />
              </tr>
            </thead>
            <tbody>
              {isLoadingMaps || isLoadingRecords ? (
                <tr><td className="table-message" colSpan={selectedNames.length + 4}>
                  <span className="loading-spinner" /> {isLoadingMaps ? "Haritalar" : "Oyuncu dereceleri"} yükleniyor...
                </td></tr>
              ) : mapError ? (
                <tr><td className="table-message" colSpan={selectedNames.length + 4}>
                  Harita listesi şu anda alınamıyor. Lütfen biraz sonra tekrar deneyin.
                </td></tr>
              ) : selectedNames.length === 0 ? (
                <tr><td className="table-message" colSpan={selectedNames.length + 4}>
                  Dereceleri karşılaştırmak için yukarıdan en az bir oyuncu seç.
                </td></tr>
              ) : visibleMaps.length === 0 ? (
                <tr><td className="table-message" colSpan={selectedNames.length + 4}>
                  {maps.length === 0 ? "Bu oyun modunda harita bulunamadı." : "Filtrelere uygun harita bulunamadı."}
                </td></tr>
              ) : (
                visibleMaps.map((map, index) => (
                  <tr key={map.name}>
                    <td className="rank-col">{String(index + 1).padStart(2, "0")}</td>
                    <td>
                      <button className="map-name" type="button" onClick={() => openMapDetails(map.name)}>
                        <span className="map-symbol">
                          <img
                            src={getMapImageUrl(map.name)}
                            alt=""
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                          <span aria-hidden="true">⌁</span>
                        </span>
                        {map.name}
                      </button>
                    </td>
                    <MapCompletionCount
                      mapName={map.name}
                      count={mapCountState[`${mode}:${map.name}`]?.count}
                      error={mapCountState[`${mode}:${map.name}`]?.error}
                      onVisible={loadMapCount}
                    />
                    {selectedNames.map((name) => {
                      const record = map.playerRecords[name];
                      return (
                        <td key={name}>
                          {record ? (
                            <span className="personal-record">
                              <strong>{floatToTime(Number(record.time))}</strong>
                              <small>#{record.position}</small>
                            </span>
                          ) : <span className="no-record">—</span>}
                        </td>
                      );
                    })}
                    <td><button className="row-link" type="button" onClick={() => openMapDetails(map.name)} aria-label={`${map.name} derecelerini göster`}>↗</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span><i className="footer-live-dot" /> xplay.gg skorları</span>
          <span>{visibleMaps.length} harita listeleniyor</span>
        </div>
      </section>

      <footer className="page-footer">
        <span><b>SURF<span>BOARD</span></b> · Arkadaşlar arasında tatlı rekabet.</span>
        <span>Veriler <a href="https://xplay.gg/" target="_blank" rel="noreferrer">xplay.gg</a> üzerinden alınır.</span>
      </footer>

      {detailMap && (
        <div
          className="map-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMapDetails();
          }}
        >
          <section
            className="map-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-dialog-title"
          >
            <header className="map-dialog-header">
              <div className="map-dialog-title">
                <button
                  className="map-dialog-image"
                  type="button"
                  onClick={() => setIsMapImageExpanded(true)}
                  aria-label={`${detailMap} görselini büyüt`}
                  title="Büyütmek için tıkla"
                >
                  <img
                    src={getMapImageUrl(detailMap)}
                    alt={`${detailMap} harita görseli`}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <span aria-hidden="true">⌁</span>
                  <span className="map-image-zoom-hint" aria-hidden="true">⤢</span>
                </button>
                <div>
                  <span className="section-kicker">HARİTA SIRALAMASI</span>
                  <h2 id="map-dialog-title">{detailMap}</h2>
                </div>
              </div>
              <button
                className="dialog-close"
                type="button"
                onClick={closeMapDetails}
                aria-label="Detayları kapat"
              >
                ×
              </button>
            </header>
            <div className="map-dialog-summary">
              <span><i className="footer-live-dot" /> {mode.toUpperCase()} · Normal stil · Tüm seviyeler</span>
              <span>Sayfa {detailPage} · {detailRecords.length} derece</span>
            </div>
            <div className="detail-table-wrap">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th className="detail-rank-col">SIRA</th>
                    <th>OYUNCU</th>
                    <th>SÜRE</th>
                    <th>STİL</th>
                    <th>TARİH</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDetails ? (
                    <tr>
                      <td className="detail-message" colSpan={5}>
                        <span className="loading-spinner" /> Sıralama yükleniyor...
                      </td>
                    </tr>
                  ) : detailError ? (
                    <tr><td className="detail-message detail-error" colSpan={5}>{detailError}</td></tr>
                  ) : detailRecords.length === 0 ? (
                    <tr><td className="detail-message" colSpan={5}>Bu harita için derece bulunamadı.</td></tr>
                  ) : (
                    detailRecords.map((record, index) => {
                      const selectedPlayer = Object.entries(selectedProfiles).find(
                        ([, profile]) => String(profile.id) === String(record.accountID),
                      );
                      const date = Number(record.date);
                      return (
                        <tr
                          className={selectedPlayer ? "friend-record" : ""}
                          key={`${record.accountID}-${record.position}-${index}`}
                        >
                          <td className="detail-rank-col">
                            <span className={`rank-medal${record.position <= 3 ? ` rank-${record.position}` : ""}`}>
                              {record.position}
                            </span>
                          </td>
                          <td>
                            <span className="detail-player">
                              <span className="detail-avatar" style={selectedPlayer ? { background: profileInfo[selectedPlayer[0]].color } : undefined}>
                                {(record.name || "?").slice(0, 1).toUpperCase()}
                              </span>
                              <span>{record.name || `Oyuncu ${record.accountID}`}</span>
                              {selectedPlayer && <small>SENİN EKİBİN</small>}
                            </span>
                          </td>
                          <td className="detail-time">{floatToTime(Number(record.time))}</td>
                          <td><span className="style-tag">{record.style === 0 ? "Normal" : `Stil ${record.style}`}</span></td>
                          <td className="detail-date">
                            {Number.isFinite(date) && date > 0
                              ? new Date(date * 1000).toLocaleDateString("tr-TR")
                              : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <footer className="detail-pagination">
              <span>En hızlı süreler üstte listelenir.</span>
              <div>
                <button
                  type="button"
                  onClick={() => setDetailPage((page) => Math.max(1, page - 1))}
                  disabled={detailPage === 1 || isLoadingDetails}
                >
                  ← Önceki
                </button>
                <button
                  type="button"
                  onClick={() => setDetailPage((page) => page + 1)}
                  disabled={detailRecords.length < 50 || isLoadingDetails}
                >
                  Sonraki →
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
      {detailMap && isMapImageExpanded && (
        <div
          className="map-image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${detailMap} büyük harita görseli`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsMapImageExpanded(false);
            }
          }}
        >
          <button
            className="lightbox-close"
            type="button"
            onClick={() => setIsMapImageExpanded(false)}
            aria-label="Büyük görseli kapat"
          >
            ×
          </button>
          <img
            className="lightbox-image"
            src={getMapImageUrl(detailMap)}
            alt={`${detailMap} harita görseli`}
          />
          <span className="lightbox-caption">{detailMap}</span>
        </div>
      )}
    </main>
  );
}

export default App;
