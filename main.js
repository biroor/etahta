import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import { 
        getFirestore, collection, addDoc, query, where, onSnapshot, 
        doc, setDoc, serverTimestamp, deleteDoc 
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
    
    import { schoolData, lessonIcons, lessonHours, dutyTeachers } from './data.js';
    import { attList, loadATT } from './att.js'; 

    const firebaseConfig = { projectId: "birooretap" }; 
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const startTime = Date.now();
    const DAILY_NOTE_COLLECTION = "classDailyNotes";
    let dailyLogPreviewUnsubscribe = null;

function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDailyNoteDocId(classId) {
    return `${classId}_${getTodayKey()}`;
}

function toDateObject(rawValue) {
    if (!rawValue) return null;
    if (rawValue instanceof Date) return rawValue;
    if (typeof rawValue.toDate === "function") return rawValue.toDate();
    return null;
}

function formatTimestampLabel(rawValue) {
    const date = toDateObject(rawValue);
    if (!date) return "Az önce";
    return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderDailyLogPreview(payload = null) {
    const text = (payload?.text || "").toString().trim();
    const previewEl = document.getElementById("todayLogPreview");
    const metaEl = document.getElementById("todayLogMeta");

    if (previewEl) {
        previewEl.innerText = text || "Bugün için ders özeti henüz paylaşılmadı.";
    }
    if (metaEl) {
        metaEl.innerText = text
            ? `Son güncelleme: ${formatTimestampLabel(payload?.updatedAt)}`
            : "Bugün için henüz paylaşım yapılmadı.";
    }
};

window.showWeekly = () => {
    const cClass = localStorage.getItem("myClass");
    const table = document.getElementById("weeklyTable");
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    
    if(!schoolData[cClass] || !lessonHours) return;

    let head = `<tr><th style="width:80px; color:var(--accent);">Saat</th>` + 
               days.map(d => `<th style="color:var(--accent);">${d}</th>`).join("") + `</tr>`;
    
    let body = "";

    for(let i = 0; i < lessonHours.length; i++) { 
 
        body += `<tr><td style="font-size:0.75rem; font-weight:bold; background:var(--glass);">
                    ${lessonHours[i].s}<br>│<br>${lessonHours[i].e}
                 </td>`;
        
        days.forEach(day => {
            const dayLessons = schoolData[cClass][day] || [];
            const lessonName = dayLessons[i];
            
 
            const icon = lessonName ? (lessonIcons[lessonName] || "📚") : "➖";
    
            const label = lessonName || "";

            body += `<td style="padding:10px; border:1px solid var(--glass);">
                        <div style="font-size:1.6rem; margin-bottom:4px;">${icon}</div>
                        <div style="font-size:0.65rem; font-weight:bold; opacity:0.9; text-transform:uppercase;">${label}</div>
                     </td>`;
        });
        
        body += "</tr>";
    }
    
    table.innerHTML = head + body;
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    
    openModal('weeklyModal');
};
window.addEventListener('DOMContentLoaded', () => {
    loadATT();
});
    const themeNames = [
        'dark', 'light', 'forest', 'midnight', 'ocean', 'sunset', 'cyber', 'rose', 'canva', 'mars',
        'lavender', 'deepsea', 'gold',
        'aurora', 'arctic', 'ember', 'espresso', 'coral', 'emerald', 'sky', 'graphite', 'neon', 'sepia',
        'glacier', 'plum', 'steel', 'lemon', 'sakura', 'sand', 'storm', 'ruby', 'mint', 'obsidian',
        'dawn', 'twilight', 'lagoon', 'meadow', 'copper', 'cobalt', 'pearl', 'mono', 'bubblegum', 'charcoal',
        'sunrise', 'dusk', 'pine', 'violet', 'amber', 'frost', 'volcano', 'rain', 'orchid', 'desertnight'
    ];
    const themeLabels = {
        dark: 'Koyu',
        light: 'Açık',
        forest: 'Orman',
        midnight: 'Gece Yarısı',
        ocean: 'Okyanus',
        sunset: 'Gün Batımı',
        cyber: 'Cyber',
        rose: 'Gül',
        canva: 'Canva',
        mars: 'Mars',
        lavender: 'Lavanta',
        deepsea: 'Derin Deniz',
        gold: 'Altın',
        aurora: 'Aurora',
        arctic: 'Arktik',
        ember: 'Kor',
        espresso: 'Espresso',
        coral: 'Mercan',
        emerald: 'Zümrüt',
        sky: 'Gökyüzü',
        graphite: 'Grafit',
        neon: 'Neon',
        sepia: 'Sepya',
        glacier: 'Buzul',
        plum: 'Erik',
        steel: 'Çelik',
        lemon: 'Limon',
        sakura: 'Sakura',
        sand: 'Kum',
        storm: 'Fırtına',
        ruby: 'Yakut',
        mint: 'Nane',
        obsidian: 'Obsidyen',
        dawn: 'Şafak',
        twilight: 'Alacakaranlık',
        lagoon: 'Lagün',
        meadow: 'Çayır',
        copper: 'Bakır',
        cobalt: 'Kobalt',
        pearl: 'İnci',
        mono: 'Monokrom',
        bubblegum: 'Şeker',
        charcoal: 'Kömür',
        sunrise: 'Gün Doğumu',
        dusk: 'Akşam',
        pine: 'Çam',
        violet: 'Menekşe',
        amber: 'Kehribar',
        frost: 'Don',
        volcano: 'Volkan',
        rain: 'Yağmur',
        orchid: 'Orkide',
        desertnight: 'Çöl Gecesi'
    };

    const CUSTOM_THEMES_KEY = "panelCustomThemesV1";
    const THEME_MENU_PROFILE_KEY = "panelThemeMenuProfilesV1";
    const THEME_MENU_KEYS = [
        "topThemeShortcut",
        "topFullscreenShortcut",
        "weeklyButton",
        "cardHw",
        "cardTools",
        "cardFocus",
        "cardAtt",
        "cardOffice",
        "cardTheme",
        "cardGame"
    ];
    const THEME_MENU_ITEMS = [
        { key: "topThemeShortcut", icon: "🎨", label: "Üst TEMA" },
        { key: "topFullscreenShortcut", icon: "🖥️", label: "Üst Tam Ekran" },
        { key: "weeklyButton", icon: "📅", label: "Haftalık Butonu" },
        { key: "cardHw", icon: "📝", label: "Ödevler Kartı" },
        { key: "cardTools", icon: "🛠️", label: "Araçlar Kartı" },
        { key: "cardFocus", icon: "🧘", label: "Odaklanma Kartı" },
        { key: "cardAtt", icon: "📋", label: "ATT Kartı" },
        { key: "cardOffice", icon: "💼", label: "BiroOffice Kartı" },
        { key: "cardTheme", icon: "🎨", label: "Temalar Kartı" },
        { key: "cardGame", icon: "🎮", label: "Oyun Kartı" }
    ];
    const THEME_MENU_GUI_OPTIONS = [
        { id: "classic", label: "Klasik" },
        { id: "glass", label: "Cam" },
        { id: "block", label: "Blok" }
    ];
    let isUiSettingsBooted = false;
    let activeThemeMenuGui = "classic";
    const customThemeVarKeys = [
        "--bg-gradient", "--panel-bg", "--text-main", "--accent", "--glass", "--shadow", "--card-hover"
    ];
    const sanitizeThemeMenuGuiMode = (mode) => {
        const raw = (mode || "").toString().trim().toLowerCase();
        return THEME_MENU_GUI_OPTIONS.some((item) => item.id === raw) ? raw : "classic";
    };
    const parseThemeMenuProfiles = (rawValue) => {
        try {
            const parsed = JSON.parse(rawValue || "{}");
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
            const next = {};
            Object.entries(parsed).forEach(([themeId, profile]) => {
                if (!themeId || !profile || typeof profile !== "object") return;
                const safeProfile = {
                    menuGui: sanitizeThemeMenuGuiMode(profile.menuGui)
                };
                THEME_MENU_KEYS.forEach((key) => {
                    if (typeof profile[key] === "boolean") safeProfile[key] = profile[key];
                });
                next[themeId] = safeProfile;
            });
            return next;
        } catch (_) {
            return {};
        }
    };
    let themeMenuProfiles = parseThemeMenuProfiles(localStorage.getItem(THEME_MENU_PROFILE_KEY));
    const saveThemeMenuProfiles = () => {
        localStorage.setItem(THEME_MENU_PROFILE_KEY, JSON.stringify(themeMenuProfiles));
    };
    const applyThemeMenuGuiMode = (rawMode) => {
        const safeMode = sanitizeThemeMenuGuiMode(rawMode);
        activeThemeMenuGui = safeMode;
        const body = document.body;
        if (body) {
            body.classList.remove("menu-gui-classic", "menu-gui-glass", "menu-gui-block");
            body.classList.add(`menu-gui-${safeMode}`);
        }
        return safeMode;
    };
    const isHexColor = (value) => /^#[0-9a-fA-F]{6}$/.test((value || "").toString().trim());
    const sanitizeHex = (value, fallback) => isHexColor(value) ? value : fallback;
    const hexToRgba = (hex, alpha) => {
        const safe = sanitizeHex(hex, "#000000").replace("#", "");
        const r = parseInt(safe.slice(0, 2), 16);
        const g = parseInt(safe.slice(2, 4), 16);
        const b = parseInt(safe.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const parseCustomThemes = (rawValue) => {
        try {
            const parsed = JSON.parse(rawValue || "[]");
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter((item) => item && typeof item === "object")
                .map((item) => ({
                    id: (item.id || "").toString(),
                    label: (item.label || "").toString().trim(),
                    bgStart: sanitizeHex(item.bgStart, "#0f172a"),
                    bgEnd: sanitizeHex(item.bgEnd, "#1e293b"),
                    panelColor: sanitizeHex(item.panelColor, "#1e293b"),
                    textColor: sanitizeHex(item.textColor, "#f8fafc"),
                    accentColor: sanitizeHex(item.accentColor, "#38bdf8"),
                    glassColor: sanitizeHex(item.glassColor, "#94a3b8")
                }))
                .filter((item) => item.id && item.label);
        } catch (e) {
            return [];
        }
    };
    let customThemes = parseCustomThemes(localStorage.getItem(CUSTOM_THEMES_KEY));
    const saveCustomThemes = () => {
        localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
    };
    const getCustomThemeById = (themeId) => customThemes.find((theme) => theme.id === themeId);
    const clearCustomThemeVars = () => {
        customThemeVarKeys.forEach((varKey) => document.documentElement.style.removeProperty(varKey));
    };
    const applyCustomThemeVars = (theme) => {
        const panelBase = sanitizeHex(theme.panelColor, "#1e293b");
        const glassBase = sanitizeHex(theme.glassColor, "#94a3b8");
        const accent = sanitizeHex(theme.accentColor, "#38bdf8");
        const bgStart = sanitizeHex(theme.bgStart, "#0f172a");
        const bgEnd = sanitizeHex(theme.bgEnd, "#1e293b");
        const text = sanitizeHex(theme.textColor, "#f8fafc");
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty("--bg-gradient", `linear-gradient(135deg, ${bgStart}, ${bgEnd})`);
        rootStyle.setProperty("--panel-bg", hexToRgba(panelBase, 0.18));
        rootStyle.setProperty("--text-main", text);
        rootStyle.setProperty("--accent", accent);
        rootStyle.setProperty("--glass", hexToRgba(glassBase, 0.16));
        rootStyle.setProperty("--shadow", `0 10px 30px ${hexToRgba(bgEnd, 0.45)}`);
        rootStyle.setProperty("--card-hover", hexToRgba(accent, 0.24));
    };
    const setThemeCreatorStatus = (text, ok = false) => {
        const statusEl = document.getElementById("themeCreatorStatus");
        if (!statusEl) return;
        statusEl.innerText = text;
        statusEl.style.color = ok ? "#22c55e" : "var(--text-main)";
    };
    const readCustomThemeForm = () => {
        const nameRaw = (document.getElementById("customThemeName")?.value || "").trim();
        return {
            label: nameRaw || "Özel Tema",
            bgStart: sanitizeHex(document.getElementById("ctBgStart")?.value, "#0f172a"),
            bgEnd: sanitizeHex(document.getElementById("ctBgEnd")?.value, "#1e293b"),
            panelColor: sanitizeHex(document.getElementById("ctPanel")?.value, "#1e293b"),
            textColor: sanitizeHex(document.getElementById("ctText")?.value, "#f8fafc"),
            accentColor: sanitizeHex(document.getElementById("ctAccent")?.value, "#38bdf8"),
            glassColor: sanitizeHex(document.getElementById("ctGlass")?.value, "#94a3b8")
        };
    };
    const getThemeLabel = (themeId) => {
        const custom = getCustomThemeById(themeId);
        if (custom) return `${custom.label} (Özel)`;
        return themeLabels[themeId] || themeId;
    };
    const renderThemeMenu = () => {
        const listEl = document.getElementById('themeListContent');
        if (!listEl) return;
        const currentTheme = localStorage.getItem("panelTheme") || 'dark';
        const allThemeIds = [...themeNames, ...customThemes.map((theme) => theme.id)];
        const themeRowsHtml = allThemeIds.map((themeId) => {
            const isActive = themeId === currentTheme;
            const isCustom = Boolean(getCustomThemeById(themeId));
            return `<div onclick="setTheme('${themeId}')" class="theme-row ${isActive ? 'active' : ''}">
                        <span class="theme-row-title">${getThemeLabel(themeId)}</span>
                        ${isCustom
                            ? `<button onclick="event.stopPropagation(); deleteCustomTheme('${themeId}')" class="theme-row-delete">SİL</button>`
                            : `<span class="theme-row-state">${isActive ? 'AKTİF' : ''}</span>`}
                    </div>`;
        }).join('');
        let studioHtml = "";
        if (isUiSettingsBooted) {
            const profile = buildThemeMenuDraftProfile(currentTheme);
            const guiButtons = THEME_MENU_GUI_OPTIONS.map((item) =>
                `<button type="button" class="theme-menu-gui-btn ${profile.menuGui === item.id ? 'active' : ''}" data-mode="${item.id}" onclick="selectThemeMenuGui('${item.id}')">${item.label}</button>`
            ).join("");
            const toggleCards = THEME_MENU_ITEMS.map((item) =>
                `<label class="theme-menu-toggle-card">
                    <input id="themeMenu_${item.key}" type="checkbox" ${profile[item.key] ? "checked" : ""}>
                    <span class="theme-menu-toggle-icon">${item.icon}</span>
                    <span>${item.label}</span>
                </label>`
            ).join("");
            studioHtml = `
                <div class="theme-menu-studio">
                    <div class="theme-menu-studio-head">
                        <h4 class="theme-menu-studio-title">🧩 Menü Stüdyosu</h4>
                        <div class="theme-menu-studio-sub">${getThemeLabel(currentTheme)} teması için</div>
                    </div>
                    <input id="themeMenuGuiInput" type="hidden" value="${profile.menuGui}">
                    <div class="theme-menu-gui-row">${guiButtons}</div>
                    <div class="theme-menu-toggle-grid">${toggleCards}</div>
                    <div class="theme-menu-studio-actions">
                        <button type="button" onclick="saveThemeMenuProfile()">Bu Tema İçin Kaydet</button>
                        <button type="button" onclick="resetThemeMenuProfile()" style="background:#334155;">Temayı Sıfırla</button>
                    </div>
                </div>
            `;
        }
        listEl.innerHTML = `<div class="theme-picker-list">${themeRowsHtml}</div>${studioHtml}`;
    };
    const applyTheme = (themeId) => {
        const customTheme = getCustomThemeById(themeId);
        if (customTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            applyCustomThemeVars(customTheme);
            localStorage.setItem("panelTheme", customTheme.id);
            renderThemeMenu();
            if (isUiSettingsBooted) applyThemeMenuProfile(customTheme.id);
            return customTheme.id;
        }
        const safeTheme = themeNames.includes(themeId) ? themeId : 'dark';
        clearCustomThemeVars();
        document.documentElement.setAttribute('data-theme', safeTheme);
        localStorage.setItem("panelTheme", safeTheme);
        renderThemeMenu();
        if (isUiSettingsBooted) applyThemeMenuProfile(safeTheme);
        return safeTheme;
    };
    window.setTheme = (themeId) => applyTheme(themeId);
    window.saveCustomTheme = () => {
        const formData = readCustomThemeForm();
        const normalizedLabel = formData.label.toLocaleLowerCase("tr");
        const existingIndex = customThemes.findIndex(
            (theme) => theme.label.toLocaleLowerCase("tr") === normalizedLabel
        );
        if (existingIndex >= 0) {
            customThemes[existingIndex] = { ...customThemes[existingIndex], ...formData };
            saveCustomThemes();
            applyTheme(customThemes[existingIndex].id);
            setThemeCreatorStatus("Tema güncellendi ve uygulandı.", true);
            return;
        }
        const slug = formData.label
            .toLocaleLowerCase("tr")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 24) || "ozel-tema";
        const newTheme = { id: `custom-${slug}-${Date.now().toString(36)}`, ...formData };
        customThemes.push(newTheme);
        saveCustomThemes();
        applyTheme(newTheme.id);
        setThemeCreatorStatus("Yeni tema kaydedildi ve uygulandı.", true);
        const nameInput = document.getElementById("customThemeName");
        if (nameInput) nameInput.value = "";
    };
    window.deleteCustomTheme = (themeId) => {
        const themeExists = customThemes.some((theme) => theme.id === themeId);
        if (!themeExists) return;
        customThemes = customThemes.filter((theme) => theme.id !== themeId);
        saveCustomThemes();
        if (themeMenuProfiles[themeId]) {
            delete themeMenuProfiles[themeId];
            saveThemeMenuProfiles();
        }
        if ((localStorage.getItem("panelTheme") || "") === themeId) {
            applyTheme("dark");
        } else {
            renderThemeMenu();
        }
        setThemeCreatorStatus("Özel tema silindi.", true);
    };
    window.openThemeCreatorModal = () => {
        closeModal('themeModal');
        openModal('themeCreatorModal');
        setThemeCreatorStatus("Kaydettiğin tema listede görünecek.");
    };
    window.openThemeSelectionModal = () => {
        closeModal('themeCreatorModal');
        openModal('themeModal');
    };

    const savedThemeRaw = localStorage.getItem("panelTheme") || 'dark';
    applyTheme(savedThemeRaw);

    const savedClass = localStorage.getItem("myClass");
    if (savedClass) {
        document.getElementById("setupOverlay").classList.add("hidden");
        initPanel(savedClass);
    }

    window.finishSetup = () => {
        const sel = document.getElementById("setupClass").value;
        localStorage.setItem("myClass", sel);
        location.reload();
    };

    window.resetSystem = () => {
        for (let i = 1; i <= 10; i++) {
            const ok = confirm(`Fabrika ayarlarına dönülecek. Onay ${i}/10: Emin misin?`);
            if (!ok) return;
        }
        localStorage.clear();
        location.reload();
    };

    const UI_SETTINGS_KEY = "panelUiSettingsV1";
    const uiSettingsDefaults = {
        topThemeShortcut: true,
        topFullscreenShortcut: true,
        weeklyButton: true,
        cardHw: true,
        cardTools: true,
        cardFocus: true,
        cardAtt: true,
        cardOffice: true,
        cardTheme: true,
        cardGame: true,
        modalHw: true,
        modalTool: true,
        modalAtt: true,
        modalOffice: true,
        modalTheme: true,
        modalThemeCreator: true,
        modalGameSelect: true,
        widgetDragEnabled: false,
        lockButtons: false,
        panelDesignMode: "modern"
    };
    const uiSettingFields = [
        { key: "topThemeShortcut", label: "Üstte TEMA kısa yolu" },
        { key: "topFullscreenShortcut", label: "Üstte Tam Ekran kısa yolu" },
        { key: "weeklyButton", label: "Haftalık Bak butonu" },
        { key: "cardHw", label: "Ödevler kartı" },
        { key: "cardTools", label: "Araçlar kartı" },
        { key: "cardFocus", label: "Odaklanma kartı" },
        { key: "cardAtt", label: "ATT kartı" },
        { key: "cardOffice", label: "BiroOffice kartı" },
        { key: "cardTheme", label: "Temalar kartı" },
        { key: "cardGame", label: "Oyun Modu kartı" },
        { key: "modalHw", label: "Ödev modalı" },
        { key: "modalTool", label: "Araçlar modalı" },
        { key: "modalAtt", label: "ATT modalı" },
        { key: "modalOffice", label: "BiroOffice modalı" },
        { key: "modalTheme", label: "Tema modalı" },
        { key: "modalThemeCreator", label: "Tema Oluşturucu modalı" },
        { key: "modalGameSelect", label: "Oyun Seçimi modalı" },
        { key: "widgetDragEnabled", label: "Düzenleme modu (panelleri taşı)" },
        { key: "lockButtons", label: "Butonları kilitle" }
    ];
    const modalSettingMap = {
        hwModal: "modalHw",
        toolModal: "modalTool",
        attModal: "modalAtt",
        officeModal: "modalOffice",
        themeModal: "modalTheme",
        themeCreatorModal: "modalThemeCreator",
        gameSelectModal: "modalGameSelect"
    };
    const parseUiSettings = (raw) => {
        const merged = { ...uiSettingsDefaults };
        if (!raw || typeof raw !== "object") return merged;
        Object.keys(uiSettingsDefaults).forEach((key) => {
            if (typeof merged[key] === "boolean" && typeof raw[key] === "boolean") merged[key] = raw[key];
        });
        if (typeof raw.panelDesignMode === "string") {
            merged.panelDesignMode = raw.panelDesignMode;
        } else if (typeof raw.classicPanelDesign === "boolean") {
            merged.panelDesignMode = raw.classicPanelDesign ? "classic" : "modern";
        }
        return merged;
    };
    const loadUiSettings = () => {
        try {
            const raw = JSON.parse(localStorage.getItem(UI_SETTINGS_KEY) || "{}");
            return parseUiSettings(raw);
        } catch (_) {
            return { ...uiSettingsDefaults };
        }
    };
    let uiSettings = loadUiSettings();
    isUiSettingsBooted = true;
    const saveUiSettings = () => {
        localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(uiSettings));
    };
    const sanitizePanelDesignMode = (mode) => {
        const safeMode = (mode || "").toString().trim().toLowerCase();
        return ["modern", "classic", "control", "bulletin"].includes(safeMode) ? safeMode : "modern";
    };
    const getActivePanelDesignMode = () => sanitizePanelDesignMode(uiSettings?.panelDesignMode);
    const syncPanelDesignControls = () => {
        const activeMode = getActivePanelDesignMode();
        document.querySelectorAll(".design-mode-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.designMode === activeMode);
        });
        const statusEl = document.getElementById("panelDesignStatus");
        if (statusEl) {
            statusEl.innerText = activeMode === "classic"
                ? "Eski tasarım aktif. İstersen tek tuşla yeni tasarıma dönebilirsin."
                : activeMode === "control"
                    ? "Kontrol Odası aktif. Daha sert, teknik ve çok farklı görünüm kullanılıyor."
                    : activeMode === "bulletin"
                        ? "Pano Duvarı aktif. Panel kağıt, bant ve sınıf panosu hissiyle gösteriliyor."
                    : "Yeni tasarım aktif. Eski görünümü de istediğinde açabilirsin.";
        }
    };
    const applyPanelDesignMode = () => {
        const activeMode = getActivePanelDesignMode();
        document.body.classList.toggle("panel-design-classic", activeMode === "classic");
        document.body.classList.toggle("panel-design-control", activeMode === "control");
        document.body.classList.toggle("panel-design-bulletin", activeMode === "bulletin");
        document.body.classList.toggle("panel-design-modern", activeMode === "modern");
        syncPanelDesignControls();
    };
    window.setPanelDesignMode = (mode) => {
        const nextMode = sanitizePanelDesignMode(mode);
        uiSettings = parseUiSettings({
            ...uiSettings,
            panelDesignMode: nextMode
        });
        saveUiSettings();
        applyUiSettings();
    };
    const setVisibility = (id, visible) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = visible ? "" : "none";
    };
    const applyUiSettings = () => {
        setVisibility("topThemeBtn", uiSettings.topThemeShortcut);
        setVisibility("topFullscreenBtn", uiSettings.topFullscreenShortcut);
        setVisibility("weeklyBtn", uiSettings.weeklyButton);
        setVisibility("cardHw", uiSettings.cardHw);
        setVisibility("cardTools", uiSettings.cardTools);
        setVisibility("cardFocus", uiSettings.cardFocus);
        setVisibility("cardAtt", uiSettings.cardAtt);
        setVisibility("cardOffice", uiSettings.cardOffice);
        setVisibility("cardTheme", uiSettings.cardTheme);
        setVisibility("cardGame", uiSettings.cardGame);
        setVisibility("cardSettings", true);

        Object.entries(modalSettingMap).forEach(([modalId, settingKey]) => {
            const modalEl = document.getElementById(modalId);
            if (!modalEl) return;
            modalEl.dataset.uiDisabled = uiSettings[settingKey] ? "0" : "1";
            if (!uiSettings[settingKey] && modalEl.style.display === "block") {
                modalEl.style.display = "none";
            }
        });
        const isDashboardEditMode = !!uiSettings.widgetDragEnabled;
        document.body.classList.toggle("drag-disabled", !isDashboardEditMode);
        document.body.classList.toggle("dashboard-edit-mode", isDashboardEditMode);
        setVisibility("layoutEditBadge", isDashboardEditMode);
        setVisibility("panelStyleBox", isDashboardEditMode);
        document.body.classList.toggle("buttons-locked", !!uiSettings.lockButtons);
        applyPanelDesignMode();
        if (typeof applyDashboardDragState === "function") applyDashboardDragState();
        if (typeof applyPanelStyleSettings === "function") applyPanelStyleSettings();
        if (typeof updateEditModeHud === "function") updateEditModeHud();
    };
    function buildThemeMenuDraftProfile(themeId) {
        const stored = themeMenuProfiles[themeId] || {};
        const profile = {
            menuGui: sanitizeThemeMenuGuiMode(stored.menuGui || activeThemeMenuGui)
        };
        THEME_MENU_KEYS.forEach((key) => {
            if (typeof stored[key] === "boolean") {
                profile[key] = stored[key];
            } else if (typeof uiSettings?.[key] === "boolean") {
                profile[key] = uiSettings[key];
            } else {
                profile[key] = uiSettingsDefaults[key];
            }
        });
        return profile;
    }
    function applyThemeMenuProfile(themeId, options = {}) {
        if (!isUiSettingsBooted) return false;
        const safeThemeId = (themeId || "").toString() || (localStorage.getItem("panelTheme") || "dark");
        const profile = themeMenuProfiles[safeThemeId];
        const persistUi = options.persistUi !== false;
        const reapplyUi = options.reapplyUi !== false;

        if (!profile || typeof profile !== "object") {
            applyThemeMenuGuiMode("classic");
            if (reapplyUi) applyUiSettings();
            return false;
        }

        const next = { ...uiSettings };
        THEME_MENU_KEYS.forEach((key) => {
            if (typeof profile[key] === "boolean") next[key] = profile[key];
        });
        uiSettings = parseUiSettings(next);
        applyThemeMenuGuiMode(profile.menuGui);

        if (persistUi) saveUiSettings();
        if (reapplyUi) {
            applyUiSettings();
            renderUiSettingsForm();
        }
        return true;
    }
    window.selectThemeMenuGui = (mode) => {
        const safeMode = sanitizeThemeMenuGuiMode(mode);
        const hiddenEl = document.getElementById("themeMenuGuiInput");
        if (hiddenEl) hiddenEl.value = safeMode;
        document.querySelectorAll(".theme-menu-gui-btn").forEach((btn) => {
            const isActive = btn.dataset.mode === safeMode;
            btn.classList.toggle("active", isActive);
        });
    };
    window.saveThemeMenuProfile = () => {
        if (!isUiSettingsBooted) return;
        const activeTheme = localStorage.getItem("panelTheme") || "dark";
        const nextProfile = {};
        THEME_MENU_ITEMS.forEach((item) => {
            nextProfile[item.key] = Boolean(document.getElementById(`themeMenu_${item.key}`)?.checked);
        });
        nextProfile.menuGui = sanitizeThemeMenuGuiMode(
            document.getElementById("themeMenuGuiInput")?.value || activeThemeMenuGui
        );
        themeMenuProfiles[activeTheme] = nextProfile;
        saveThemeMenuProfiles();
        applyThemeMenuProfile(activeTheme, { persistUi: true, reapplyUi: true });
        renderThemeMenu();
    };
    window.resetThemeMenuProfile = () => {
        if (!isUiSettingsBooted) return;
        const activeTheme = localStorage.getItem("panelTheme") || "dark";
        delete themeMenuProfiles[activeTheme];
        saveThemeMenuProfiles();
        const next = { ...uiSettings };
        THEME_MENU_KEYS.forEach((key) => {
            next[key] = uiSettingsDefaults[key];
        });
        uiSettings = parseUiSettings(next);
        applyThemeMenuGuiMode("classic");
        saveUiSettings();
        applyUiSettings();
        renderUiSettingsForm();
        renderThemeMenu();
    };
    const renderUiSettingsForm = () => {
        const listEl = document.getElementById("uiSettingsList");
        if (!listEl) return;
        listEl.innerHTML = uiSettingFields.map((item) => {
            const checked = uiSettings[item.key] ? "checked" : "";
            return `<label class="settings-item">
                        <input id="uiSetting_${item.key}" type="checkbox" ${checked}>
                        <span>${item.label}</span>
                    </label>`;
        }).join("");
    };
    window.saveUiSettingsFromForm = () => {
        const next = {
            ...uiSettingsDefaults,
            panelDesignMode: getActivePanelDesignMode()
        };
        uiSettingFields.forEach((item) => {
            const input = document.getElementById(`uiSetting_${item.key}`);
            next[item.key] = Boolean(input?.checked);
        });
        uiSettings = next;
        saveUiSettings();
        applyUiSettings();
    };
    window.exitDashboardEditMode = () => {
        if (!uiSettings.widgetDragEnabled) return;
        uiSettings = { ...uiSettings, widgetDragEnabled: false };
        saveUiSettings();
        applyUiSettings();
        renderUiSettingsForm();
    };
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (!uiSettings.widgetDragEnabled) return;
        window.exitDashboardEditMode();
    });

    const PANEL_STYLE_KEY = "panelStyleSettingsV1";
    const panelStyleDefaults = {
        leftWidth: 320,
        rightWidth: 320,
        bottomHeight: 250,
        gap: 15,
        radius: 20,
        blur: 25,
        useCustomColors: false,
        colorAlpha: 22,
        clockColor: "#1e293b",
        lessonsColor: "#1e293b",
        quickColor: "#1e293b",
        homeworkColor: "#1e293b"
    };
    const PANEL_STYLE_WIDGET_MAP = {
        widgetClock: "clockColor",
        widgetLessons: "lessonsColor",
        widgetQuick: "quickColor",
        widgetHomework: "homeworkColor"
    };
    const clampInt = (value, min, max, fallback) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return fallback;
        return Math.min(max, Math.max(min, Math.round(num)));
    };
    const parsePanelStyleSettings = (raw) => {
        const safe = raw && typeof raw === "object" ? raw : {};
        return {
            leftWidth: clampInt(safe.leftWidth, 220, 520, panelStyleDefaults.leftWidth),
            rightWidth: clampInt(safe.rightWidth, 220, 520, panelStyleDefaults.rightWidth),
            bottomHeight: clampInt(safe.bottomHeight, 90, 280, panelStyleDefaults.bottomHeight),
            gap: clampInt(safe.gap, 6, 36, panelStyleDefaults.gap),
            radius: clampInt(safe.radius, 8, 40, panelStyleDefaults.radius),
            blur: clampInt(safe.blur, 0, 45, panelStyleDefaults.blur),
            useCustomColors: Boolean(safe.useCustomColors),
            colorAlpha: clampInt(safe.colorAlpha, 8, 100, panelStyleDefaults.colorAlpha),
            clockColor: sanitizeHex(safe.clockColor, panelStyleDefaults.clockColor),
            lessonsColor: sanitizeHex(safe.lessonsColor, panelStyleDefaults.lessonsColor),
            quickColor: sanitizeHex(safe.quickColor, panelStyleDefaults.quickColor),
            homeworkColor: sanitizeHex(safe.homeworkColor, panelStyleDefaults.homeworkColor)
        };
    };
    const loadPanelStyleSettings = () => {
        try {
            const raw = JSON.parse(localStorage.getItem(PANEL_STYLE_KEY) || "{}");
            return parsePanelStyleSettings(raw);
        } catch (_) {
            return { ...panelStyleDefaults };
        }
    };
    let panelStyleSettings = loadPanelStyleSettings();
    const savePanelStyleSettings = () => {
        localStorage.setItem(PANEL_STYLE_KEY, JSON.stringify(panelStyleSettings));
    };
    const setPanelStyleValueText = (id, valueText) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerText = valueText;
    };
    window.syncPanelStylePreview = () => {
        const leftW = clampInt(document.getElementById("psLeftWidth")?.value, 220, 520, panelStyleSettings.leftWidth);
        const rightW = clampInt(document.getElementById("psRightWidth")?.value, 220, 520, panelStyleSettings.rightWidth);
        const bottomH = clampInt(document.getElementById("psBottomHeight")?.value, 90, 280, panelStyleSettings.bottomHeight);
        const gap = clampInt(document.getElementById("psGap")?.value, 6, 36, panelStyleSettings.gap);
        const radius = clampInt(document.getElementById("psRadius")?.value, 8, 40, panelStyleSettings.radius);
        const blur = clampInt(document.getElementById("psBlur")?.value, 0, 45, panelStyleSettings.blur);
        const alpha = clampInt(document.getElementById("psColorAlpha")?.value, 8, 100, panelStyleSettings.colorAlpha);
        setPanelStyleValueText("psLeftWidthVal", `${leftW}px`);
        setPanelStyleValueText("psRightWidthVal", `${rightW}px`);
        setPanelStyleValueText("psBottomHeightVal", `${bottomH}px`);
        setPanelStyleValueText("psGapVal", `${gap}px`);
        setPanelStyleValueText("psRadiusVal", `${radius}px`);
        setPanelStyleValueText("psBlurVal", `${blur}px`);
        setPanelStyleValueText("psColorAlphaVal", `%${alpha}`);
    };
    function renderPanelStyleForm() {
        const setInput = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = `${value}`;
        };
        const setColor = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = sanitizeHex(value, "#1e293b");
        };
        const useCustom = document.getElementById("psUseCustomColors");
        if (useCustom) useCustom.checked = !!panelStyleSettings.useCustomColors;
        setInput("psLeftWidth", panelStyleSettings.leftWidth);
        setInput("psRightWidth", panelStyleSettings.rightWidth);
        setInput("psBottomHeight", panelStyleSettings.bottomHeight);
        setInput("psGap", panelStyleSettings.gap);
        setInput("psRadius", panelStyleSettings.radius);
        setInput("psBlur", panelStyleSettings.blur);
        setInput("psColorAlpha", panelStyleSettings.colorAlpha);
        setColor("psClockColor", panelStyleSettings.clockColor);
        setColor("psLessonsColor", panelStyleSettings.lessonsColor);
        setColor("psQuickColor", panelStyleSettings.quickColor);
        setColor("psHomeworkColor", panelStyleSettings.homeworkColor);
        window.syncPanelStylePreview();
        if (typeof updateEditModeHud === "function") updateEditModeHud();
    }
    function applyPanelStyleSettings() {
        const grid = document.getElementById("dashboardGrid");
        if (grid) {
            grid.style.gridTemplateColumns = `${panelStyleSettings.leftWidth}px 1fr ${panelStyleSettings.rightWidth}px`;
            grid.style.gridTemplateRows = `1fr ${panelStyleSettings.bottomHeight}px`;
            grid.style.gap = `${panelStyleSettings.gap}px`;
        }

        ["widgetClock", "widgetLessons", "widgetQuick", "widgetHomework"].forEach((panelId) => {
            const panelEl = document.getElementById(panelId);
            if (!panelEl) return;
            panelEl.style.borderRadius = `${panelStyleSettings.radius}px`;
            panelEl.style.backdropFilter = `blur(${panelStyleSettings.blur}px)`;
        });

        const alpha = panelStyleSettings.colorAlpha / 100;
        Object.entries(PANEL_STYLE_WIDGET_MAP).forEach(([widgetId, colorKey]) => {
            const widgetEl = document.getElementById(widgetId);
            if (!widgetEl) return;
            if (panelStyleSettings.useCustomColors) {
                widgetEl.style.background = hexToRgba(panelStyleSettings[colorKey], alpha);
            } else {
                widgetEl.style.removeProperty("background");
            }
        });
    }
    window.savePanelStyleFromForm = () => {
        const next = {
            leftWidth: clampInt(document.getElementById("psLeftWidth")?.value, 220, 520, panelStyleSettings.leftWidth),
            rightWidth: clampInt(document.getElementById("psRightWidth")?.value, 220, 520, panelStyleSettings.rightWidth),
            bottomHeight: clampInt(document.getElementById("psBottomHeight")?.value, 90, 280, panelStyleSettings.bottomHeight),
            gap: clampInt(document.getElementById("psGap")?.value, 6, 36, panelStyleSettings.gap),
            radius: clampInt(document.getElementById("psRadius")?.value, 8, 40, panelStyleSettings.radius),
            blur: clampInt(document.getElementById("psBlur")?.value, 0, 45, panelStyleSettings.blur),
            useCustomColors: Boolean(document.getElementById("psUseCustomColors")?.checked),
            colorAlpha: clampInt(document.getElementById("psColorAlpha")?.value, 8, 100, panelStyleSettings.colorAlpha),
            clockColor: sanitizeHex(document.getElementById("psClockColor")?.value, panelStyleDefaults.clockColor),
            lessonsColor: sanitizeHex(document.getElementById("psLessonsColor")?.value, panelStyleDefaults.lessonsColor),
            quickColor: sanitizeHex(document.getElementById("psQuickColor")?.value, panelStyleDefaults.quickColor),
            homeworkColor: sanitizeHex(document.getElementById("psHomeworkColor")?.value, panelStyleDefaults.homeworkColor)
        };
        panelStyleSettings = parsePanelStyleSettings(next);
        savePanelStyleSettings();
        applyPanelStyleSettings();
        renderPanelStyleForm();
    };
    window.resetPanelStyleFromForm = () => {
        panelStyleSettings = { ...panelStyleDefaults };
        savePanelStyleSettings();
        applyPanelStyleSettings();
        renderPanelStyleForm();
    };
    const EDIT_WIDGET_LABELS = {
        widgetClock: "Saat Paneli",
        widgetLessons: "Ders Paneli",
        widgetQuick: "Kısayol Paneli",
        widgetHomework: "Ödev Paneli"
    };
    const EDIT_MODE_HUD_POS_KEY = "panelEditModeHudPosV1";
    let editHudPosition = null;
    let editHudDragPointerId = null;
    let editHudDragOffsetX = 0;
    let editHudDragOffsetY = 0;
    const parseEditHudPosition = (raw) => {
        if (!raw || typeof raw !== "object") return null;
        const left = Number(raw.left);
        const top = Number(raw.top);
        if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
        return { left, top };
    };
    const loadEditHudPosition = () => {
        try {
            return parseEditHudPosition(JSON.parse(localStorage.getItem(EDIT_MODE_HUD_POS_KEY) || "null"));
        } catch (_) {
            return null;
        }
    };
    const saveEditHudPosition = () => {
        if (!editHudPosition) {
            localStorage.removeItem(EDIT_MODE_HUD_POS_KEY);
            return;
        }
        localStorage.setItem(EDIT_MODE_HUD_POS_KEY, JSON.stringify(editHudPosition));
    };
    const clampEditHudPosition = (left, top, hudEl) => {
        const rect = hudEl.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(0, window.innerHeight - rect.height);
        return {
            left: Math.min(maxLeft, Math.max(0, left)),
            top: Math.min(maxTop, Math.max(0, top))
        };
    };
    function applyEditHudPosition() {
        const hud = document.getElementById("editModeHud");
        if (!hud) return;
        if (!editHudPosition) {
            hud.style.left = "12px";
            hud.style.bottom = "12px";
            hud.style.top = "";
            hud.style.right = "";
            return;
        }
        const clamped = clampEditHudPosition(editHudPosition.left, editHudPosition.top, hud);
        editHudPosition = clamped;
        hud.style.left = `${clamped.left}px`;
        hud.style.top = `${clamped.top}px`;
        hud.style.right = "auto";
        hud.style.bottom = "auto";
    }
    window.resetEditModeHudPosition = () => {
        editHudPosition = null;
        saveEditHudPosition();
        applyEditHudPosition();
    };
    const onEditHudPointerDown = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const hud = document.getElementById("editModeHud");
        if (!hud) return;
        const rect = hud.getBoundingClientRect();
        editHudDragPointerId = e.pointerId;
        editHudDragOffsetX = e.clientX - rect.left;
        editHudDragOffsetY = e.clientY - rect.top;
        hud.classList.add("is-moving");
        if (typeof e.currentTarget?.setPointerCapture === "function") {
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch (_) {}
        }
        e.preventDefault();
        e.stopPropagation();
    };
    const onEditHudPointerMove = (e) => {
        if (editHudDragPointerId === null || e.pointerId !== editHudDragPointerId) return;
        const hud = document.getElementById("editModeHud");
        if (!hud) return;
        const nextLeft = e.clientX - editHudDragOffsetX;
        const nextTop = e.clientY - editHudDragOffsetY;
        editHudPosition = clampEditHudPosition(nextLeft, nextTop, hud);
        applyEditHudPosition();
        e.preventDefault();
    };
    const onEditHudPointerUp = (e) => {
        if (editHudDragPointerId === null || e.pointerId !== editHudDragPointerId) return;
        editHudDragPointerId = null;
        const hud = document.getElementById("editModeHud");
        if (hud) hud.classList.remove("is-moving");
        saveEditHudPosition();
        e.preventDefault();
    };
    function initEditModeHudDrag() {
        editHudPosition = loadEditHudPosition();
        applyEditHudPosition();
        const dragEl = document.getElementById("editModeHudDrag");
        if (dragEl && dragEl.dataset.dragReady !== "1") {
            dragEl.dataset.dragReady = "1";
            dragEl.addEventListener("pointerdown", onEditHudPointerDown);
            dragEl.addEventListener("dblclick", () => window.resetEditModeHudPosition());
        }
        if (!document.body.dataset.editHudPointerReady) {
            document.body.dataset.editHudPointerReady = "1";
            document.addEventListener("pointermove", onEditHudPointerMove);
            document.addEventListener("pointerup", onEditHudPointerUp);
            document.addEventListener("pointercancel", onEditHudPointerUp);
            window.addEventListener("resize", () => applyEditHudPosition());
        }
    }
    let selectedEditWidgetId = "widgetClock";
    function updateEditModeSelectionClasses() {
        const showSelection = !!uiSettings.widgetDragEnabled;
        Object.keys(PANEL_STYLE_WIDGET_MAP).forEach((widgetId) => {
            const el = document.getElementById(widgetId);
            if (!el) return;
            el.classList.toggle("edit-selected", showSelection && selectedEditWidgetId === widgetId);
        });
    }
    function updateEditModeHud() {
        const nameEl = document.getElementById("editModeSelectedName");
        if (nameEl) {
            nameEl.innerText = EDIT_WIDGET_LABELS[selectedEditWidgetId] || "Panel";
        }
        const colorPicker = document.getElementById("editModeColorPicker");
        const colorKey = PANEL_STYLE_WIDGET_MAP[selectedEditWidgetId];
        if (colorPicker && colorKey) {
            colorPicker.value = sanitizeHex(panelStyleSettings[colorKey], "#1e293b");
        }
        updateEditModeSelectionClasses();
        applyEditHudPosition();
    }
    function selectEditWidget(widgetId, openPicker = false) {
        if (!PANEL_STYLE_WIDGET_MAP[widgetId]) return;
        selectedEditWidgetId = widgetId;
        updateEditModeHud();
        if (!openPicker) return;
        const colorPicker = document.getElementById("editModeColorPicker");
        if (!colorPicker) return;
        colorPicker.focus();
        colorPicker.click();
    }
    window.openEditModeColorPicker = () => {
        const colorPicker = document.getElementById("editModeColorPicker");
        if (!colorPicker) return;
        colorPicker.focus();
        colorPicker.click();
    };
    window.applyEditModeColor = (rawColor) => {
        const colorKey = PANEL_STYLE_WIDGET_MAP[selectedEditWidgetId];
        if (!colorKey) return;
        panelStyleSettings = parsePanelStyleSettings({
            ...panelStyleSettings,
            useCustomColors: true,
            [colorKey]: sanitizeHex(rawColor, panelStyleSettings[colorKey])
        });
        savePanelStyleSettings();
        applyPanelStyleSettings();
        renderPanelStyleForm();
        updateEditModeHud();
    };
    const DASHBOARD_LAYOUT_KEY = "panelDashboardFreeLayoutV2";
    const DASHBOARD_LAYOUT_META_KEY = "panelDashboardFreeLayoutMetaV1";
    const DASHBOARD_WIDGET_IDS = ["widgetClock", "widgetLessons", "widgetQuick", "widgetHomework"];
    const DASHBOARD_ROLE_LAYOUT_KEY = "panelDashboardGridRoleLayoutV1";
    const DASHBOARD_WIDGET_SIZE_KEY = "panelDashboardGridWidgetSizeV1";
    const DASHBOARD_ROLE_CLASS_BY_ID = {
        widgetClock: "widget-clock",
        widgetLessons: "widget-lessons",
        widgetQuick: "widget-quick",
        widgetHomework: "widget-homework"
    };
    const DASHBOARD_ROLE_CLASSES = Object.values(DASHBOARD_ROLE_CLASS_BY_ID);
    const DASHBOARD_BOTTOM_ANCHORED_IDS = new Set(["widgetQuick"]);
    const INTERACTIVE_DRAG_SELECTOR = "button,input,textarea,select,a,label,.menu-card,.status-shortcut";
    const DASHBOARD_DRAG_HANDLE_SELECTOR = ".widget-drag-handle";
    const DASHBOARD_RESIZE_HANDLE_SELECTOR = ".widget-resize-handle";
    const SIMPLE_DASHBOARD_GRID_MODE = true;
    const POINTER_DRAG_THRESHOLD = 8;
    const DASHBOARD_MIN_WIDTH = 120;
    const DASHBOARD_MIN_HEIGHT = 80;
    const DASHBOARD_MIN_CENTER_WIDTH = 320;
    const DASHBOARD_MIN_SIDE_WIDTH = 220;
    const DASHBOARD_MAX_SIDE_WIDTH = 520;
    const DASHBOARD_MIN_BOTTOM_HEIGHT = 90;
    const DASHBOARD_MAX_BOTTOM_HEIGHT = 280;
    let dashboardLayout = null;
    let pointerDragWidgetId = "";
    let pointerDragPointerId = null;
    let pointerDragActivated = false;
    let pointerDropTargetId = "";
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerDragStartBox = null;
    let resizeWidgetId = "";
    let resizePointerId = null;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let resizeStartBox = null;
    let suppressDashboardClickUntil = 0;
    let dashboardLastBounds = null;
    let dashboardResizeDebounceTimer = null;

    const getDashboardGrid = () => document.querySelector(".main-grid");
    const getDashboardPaddingValue = () => window.innerWidth <= 700 ? 16 : 20;
    const getDashboardViewportOffset = () => {
        const statusBarHeight = document.querySelector(".status-bar")?.getBoundingClientRect().height || 72;
        return Math.ceil(statusBarHeight + getDashboardPaddingValue());
    };
    const activateDashboardFreeLayout = () => {
        const grid = getDashboardGrid();
        if (!grid) return;
        grid.style.display = "block";
        grid.style.position = "relative";
        grid.style.padding = `${getDashboardPaddingValue()}px`;
        grid.style.boxSizing = "border-box";
        grid.style.height = `calc(100vh - ${getDashboardViewportOffset()}px)`;
        grid.style.overflow = "hidden";
    };
    const activateDashboardSimpleGrid = () => {
        const grid = getDashboardGrid();
        if (!grid) return;
        ["display", "position", "padding", "box-sizing", "height", "overflow"].forEach((prop) => {
            grid.style.removeProperty(prop);
        });
    };
    const clearWidgetInlineLayout = (widget) => {
        if (!widget) return;
        [
            "position",
            "left",
            "top",
            "width",
            "height",
            "margin",
            "justify-self",
            "align-self",
            "grid-column",
            "grid-row"
        ].forEach((prop) => widget.style.removeProperty(prop));
    };
    const getWidgetRoleClass = (widgetEl) => {
        if (!widgetEl) return "";
        const roleClass = DASHBOARD_ROLE_CLASSES.find((cls) => widgetEl.classList.contains(cls));
        return roleClass || "";
    };
    const readDashboardRoleLayout = () => {
        const layout = {};
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            layout[id] = getWidgetRoleClass(el) || DASHBOARD_ROLE_CLASS_BY_ID[id];
        });
        return layout;
    };
    const parseDashboardRoleLayout = (raw) => {
        if (!raw || typeof raw !== "object") return null;
        const next = {};
        const used = new Set();
        for (const id of DASHBOARD_WIDGET_IDS) {
            const roleClass = raw[id];
            if (!DASHBOARD_ROLE_CLASSES.includes(roleClass)) return null;
            if (used.has(roleClass)) return null;
            used.add(roleClass);
            next[id] = roleClass;
        }
        return next;
    };
    const loadDashboardRoleLayout = () => {
        try {
            return parseDashboardRoleLayout(JSON.parse(localStorage.getItem(DASHBOARD_ROLE_LAYOUT_KEY) || "null"));
        } catch (_) {
            return null;
        }
    };
    const parseDashboardWidgetSizes = (raw) => {
        if (!raw || typeof raw !== "object") return null;
        const next = {};
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const item = raw[id];
            if (!item || typeof item !== "object") return;
            const width = Number(item.w);
            const height = Number(item.h);
            const hasW = Number.isFinite(width);
            const hasH = Number.isFinite(height);
            if (!hasW && !hasH) return;
            next[id] = {};
            if (hasW) next[id].w = Math.round(width);
            if (hasH) next[id].h = Math.round(height);
        });
        return Object.keys(next).length ? next : null;
    };
    const loadDashboardWidgetSizes = () => {
        if (!SIMPLE_DASHBOARD_GRID_MODE) return null;
        try {
            return parseDashboardWidgetSizes(JSON.parse(localStorage.getItem(DASHBOARD_WIDGET_SIZE_KEY) || "null"));
        } catch (_) {
            return null;
        }
    };
    const readDashboardWidgetSizes = () => {
        const next = {};
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const width = Number.parseInt(el.style.width || "", 10);
            const height = Number.parseInt(el.style.height || "", 10);
            if (!Number.isFinite(width) && !Number.isFinite(height)) return;
            next[id] = {};
            if (Number.isFinite(width)) next[id].w = width;
            if (Number.isFinite(height)) next[id].h = height;
        });
        return next;
    };
    const saveDashboardWidgetSizes = () => {
        if (!SIMPLE_DASHBOARD_GRID_MODE) return;
        localStorage.setItem(DASHBOARD_WIDGET_SIZE_KEY, JSON.stringify(readDashboardWidgetSizes()));
    };
    const applyDashboardWidgetSizes = (sizes) => {
        if (!SIMPLE_DASHBOARD_GRID_MODE || !sizes) return;
        const bounds = getDashboardBounds();
        const maxWidth = Math.max(DASHBOARD_MIN_WIDTH, Math.round(bounds.width - 20));
        const maxHeight = Math.max(DASHBOARD_MIN_HEIGHT, Math.round(bounds.height - 20));
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const size = sizes[id];
            if (!size || typeof size !== "object") return;
            if (Number.isFinite(size.w)) {
                const nextW = clampInt(size.w, DASHBOARD_MIN_WIDTH, maxWidth, el.offsetWidth || DASHBOARD_MIN_WIDTH);
                el.style.width = `${nextW}px`;
                el.style.justifySelf = "start";
            }
            if (Number.isFinite(size.h)) {
                const nextH = clampInt(size.h, DASHBOARD_MIN_HEIGHT, maxHeight, el.offsetHeight || DASHBOARD_MIN_HEIGHT);
                el.style.height = `${nextH}px`;
                el.style.alignSelf = "start";
            }
        });
    };
    const saveDashboardRoleLayout = () => {
        if (!SIMPLE_DASHBOARD_GRID_MODE) return;
        localStorage.setItem(DASHBOARD_ROLE_LAYOUT_KEY, JSON.stringify(readDashboardRoleLayout()));
    };
    const applyDashboardRoleLayout = (layout) => {
        if (!layout) return;
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const widget = document.getElementById(id);
            if (!widget) return;
            DASHBOARD_ROLE_CLASSES.forEach((roleClass) => widget.classList.remove(roleClass));
            const roleClass = layout[id] || DASHBOARD_ROLE_CLASS_BY_ID[id];
            widget.classList.add(roleClass);
        });
    };
    const swapDashboardWidgetRoles = (sourceId, targetId) => {
        if (!sourceId || !targetId || sourceId === targetId) return false;
        const sourceEl = document.getElementById(sourceId);
        const targetEl = document.getElementById(targetId);
        if (!sourceEl || !targetEl) return false;
        const sourceRole = getWidgetRoleClass(sourceEl);
        const targetRole = getWidgetRoleClass(targetEl);
        if (!sourceRole || !targetRole || sourceRole === targetRole) return false;
        sourceEl.classList.remove(sourceRole);
        targetEl.classList.remove(targetRole);
        sourceEl.classList.add(targetRole);
        targetEl.classList.add(sourceRole);
        saveDashboardRoleLayout();
        return true;
    };
    const getDashboardBounds = () => {
        const grid = getDashboardGrid();
        if (!grid) return { width: 0, height: 0 };
        return {
            width: Math.max(0, grid.clientWidth),
            height: Math.max(0, grid.clientHeight)
        };
    };
    const getSimpleGridResizeLimits = (baseSettings = panelStyleSettings) => {
        const bounds = getDashboardBounds();
        const gap = clampInt(baseSettings?.gap, 6, 36, panelStyleSettings.gap);
        const usableWidth = Math.max(0, bounds.width - (gap * 2));
        const usableHeight = Math.max(0, bounds.height - gap);
        const maxSideTotal = Math.max(
            DASHBOARD_MIN_SIDE_WIDTH * 2,
            usableWidth - DASHBOARD_MIN_CENTER_WIDTH
        );
        const maxBottomBySpace = Math.max(
            DASHBOARD_MIN_BOTTOM_HEIGHT,
            usableHeight - DASHBOARD_MIN_HEIGHT
        );
        return {
            minSide: DASHBOARD_MIN_SIDE_WIDTH,
            maxSide: DASHBOARD_MAX_SIDE_WIDTH,
            maxSideTotal,
            minBottom: DASHBOARD_MIN_BOTTOM_HEIGHT,
            maxBottom: Math.min(DASHBOARD_MAX_BOTTOM_HEIGHT, maxBottomBySpace)
        };
    };
    const applySimpleGridLinkedResize = (widgetId, dx, dy) => {
        if (!SIMPLE_DASHBOARD_GRID_MODE || !resizeStartBox?.panelStyle) return;
        const start = resizeStartBox.panelStyle;
        const limits = getSimpleGridResizeLimits(start);
        const next = { ...panelStyleSettings };

        if (widgetId === "widgetClock") {
            const maxAllowed = Math.min(limits.maxSide, limits.maxSideTotal - start.rightWidth);
            next.leftWidth = clampInt(
                start.leftWidth - dx,
                limits.minSide,
                Math.max(limits.minSide, maxAllowed),
                start.leftWidth
            );
        } else if (widgetId === "widgetHomework") {
            const maxAllowed = Math.min(limits.maxSide, limits.maxSideTotal - start.leftWidth);
            next.rightWidth = clampInt(
                start.rightWidth - dx,
                limits.minSide,
                Math.max(limits.minSide, maxAllowed),
                start.rightWidth
            );
        } else if (widgetId === "widgetLessons") {
            next.bottomHeight = clampInt(
                start.bottomHeight - dy,
                limits.minBottom,
                limits.maxBottom,
                start.bottomHeight
            );
        } else if (widgetId === "widgetQuick") {
            next.bottomHeight = clampInt(
                start.bottomHeight + dy,
                limits.minBottom,
                limits.maxBottom,
                start.bottomHeight
            );
        } else {
            return;
        }

        panelStyleSettings = parsePanelStyleSettings(next);
        applyPanelStyleSettings();
    };
    const isValidDashboardBox = (box) => {
        if (!box || typeof box !== "object") return false;
        return ["x", "y", "w", "h"].every((k) => Number.isFinite(Number(box[k])));
    };
    const parseDashboardLayout = (raw) => {
        if (!raw || typeof raw !== "object") return null;
        const next = {};
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const box = raw[id];
            if (!isValidDashboardBox(box)) return;
            next[id] = {
                x: Number(box.x),
                y: Number(box.y),
                w: Number(box.w),
                h: Number(box.h)
            };
        });
        const ok = DASHBOARD_WIDGET_IDS.every((id) => isValidDashboardBox(next[id]));
        return ok ? next : null;
    };
    const parseDashboardBounds = (raw) => {
        if (!raw || typeof raw !== "object") return null;
        const width = Number(raw.width);
        const height = Number(raw.height);
        if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
        if (width <= 0 || height <= 0) return null;
        return { width: Math.round(width), height: Math.round(height) };
    };
    const captureInitialDashboardLayout = () => {
        const grid = getDashboardGrid();
        if (!grid) return null;
        const gridRect = grid.getBoundingClientRect();
        const next = {};
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            next[id] = {
                x: Math.round(rect.left - gridRect.left),
                y: Math.round(rect.top - gridRect.top),
                w: Math.round(rect.width),
                h: Math.round(rect.height)
            };
        });
        const ok = DASHBOARD_WIDGET_IDS.every((id) => isValidDashboardBox(next[id]));
        return ok ? next : null;
    };
    const createFallbackDashboardLayout = () => {
        const staticFallback = {
            widgetClock: { x: 15, y: 15, w: 320, h: 540 },
            widgetLessons: { x: 350, y: 15, w: 640, h: 290 },
            widgetQuick: { x: 350, y: 320, w: 640, h: 250 },
            widgetHomework: { x: 1005, y: 15, w: 320, h: 540 }
        };
        const bounds = getDashboardBounds();
        if (!bounds || bounds.width <= 0 || bounds.height <= 0) return staticFallback;

        const gridPadding = 15;
        const gap = clampInt(panelStyleSettings?.gap, 6, 36, 15);
        const minCenterWidth = DASHBOARD_MIN_WIDTH;
        const minSideWidth = 220;
        const contentWidth = Math.max(minSideWidth * 2 + minCenterWidth + (gap * 2), bounds.width - (gridPadding * 2));
        const contentHeight = Math.max((DASHBOARD_MIN_HEIGHT * 2) + gap, bounds.height - (gridPadding * 2));

        let leftWidth = clampInt(panelStyleSettings?.leftWidth, minSideWidth, 520, 320);
        let rightWidth = clampInt(panelStyleSettings?.rightWidth, minSideWidth, 520, 320);

        const maxSideTotal = Math.max(minSideWidth * 2, contentWidth - minCenterWidth - (gap * 2));
        if (leftWidth + rightWidth > maxSideTotal) {
            let overflow = (leftWidth + rightWidth) - maxSideTotal;
            const leftShrink = Math.min(Math.ceil(overflow / 2), leftWidth - minSideWidth);
            leftWidth -= leftShrink;
            overflow -= leftShrink;
            const rightShrink = Math.min(overflow, rightWidth - minSideWidth);
            rightWidth -= rightShrink;
        }
        const centerWidth = Math.max(minCenterWidth, contentWidth - leftWidth - rightWidth - (gap * 2));

        const bottomHeightRaw = clampInt(panelStyleSettings?.bottomHeight, 90, 280, panelStyleDefaults.bottomHeight);
        const maxBottomHeight = Math.max(DASHBOARD_MIN_HEIGHT, contentHeight - DASHBOARD_MIN_HEIGHT - gap);
        const bottomHeight = Math.min(bottomHeightRaw, maxBottomHeight);
        const topHeight = Math.max(DASHBOARD_MIN_HEIGHT, contentHeight - bottomHeight - gap);

        const middleX = gridPadding + leftWidth + gap;
        const rightX = middleX + centerWidth + gap;

        const clampBoxToBounds = (box) => {
            const maxW = Math.max(DASHBOARD_MIN_WIDTH, bounds.width - (gridPadding * 2));
            const maxH = Math.max(DASHBOARD_MIN_HEIGHT, bounds.height - (gridPadding * 2));
            const w = clampInt(box.w, DASHBOARD_MIN_WIDTH, maxW, box.w);
            const h = clampInt(box.h, DASHBOARD_MIN_HEIGHT, maxH, box.h);
            const minX = gridPadding;
            const minY = gridPadding;
            const maxX = Math.max(minX, bounds.width - gridPadding - w);
            const maxY = Math.max(minY, bounds.height - gridPadding - h);
            return {
                x: clampInt(box.x, minX, maxX, box.x),
                y: clampInt(box.y, minY, maxY, box.y),
                w,
                h
            };
        };

        return {
            widgetClock: clampBoxToBounds({ x: gridPadding, y: gridPadding, w: leftWidth, h: contentHeight }),
            widgetLessons: clampBoxToBounds({ x: middleX, y: gridPadding, w: centerWidth, h: topHeight }),
            widgetQuick: clampBoxToBounds({ x: middleX, y: gridPadding + topHeight + gap, w: centerWidth, h: bottomHeight }),
            widgetHomework: clampBoxToBounds({ x: rightX, y: gridPadding, w: rightWidth, h: contentHeight })
        };
    };
    const loadDashboardLayout = () => {
        try {
            return parseDashboardLayout(JSON.parse(localStorage.getItem(DASHBOARD_LAYOUT_KEY) || "null"));
        } catch (_) {
            return null;
        }
    };
    const loadDashboardLayoutMeta = () => {
        try {
            return parseDashboardBounds(JSON.parse(localStorage.getItem(DASHBOARD_LAYOUT_META_KEY) || "null"));
        } catch (_) {
            return null;
        }
    };
    const saveDashboardLayout = () => {
        if (!dashboardLayout) return;
        localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(dashboardLayout));
        const bounds = getDashboardBounds();
        if (bounds.width > 0 && bounds.height > 0) {
            localStorage.setItem(DASHBOARD_LAYOUT_META_KEY, JSON.stringify(bounds));
        }
    };
    const estimateDashboardLayoutHeight = (layout) => {
        if (!layout) return 0;
        const gapSize = clampInt(panelStyleSettings?.gap, 6, 36, 12);
        let maxBottom = 0;
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const box = layout[id];
            if (!box) return;
            maxBottom = Math.max(maxBottom, box.y + box.h);
        });
        return Math.max(0, Math.round(maxBottom + gapSize));
    };
    const normalizeDashboardLayout = (layout) => {
        // Minimal normalization - just return as is
        // No complex overlapping fixes, no resizing
        return layout || {};
    };
    const autoExpandDashboardForFullscreen = (bounds) => {
        if (!dashboardLayout) return false;
        if (!document.fullscreenElement) return false;
        if (uiSettings?.widgetDragEnabled) return false;
        const gapSize = clampInt(panelStyleSettings?.gap, 6, 36, 12);
        const nextLayout = { ...dashboardLayout };
        let changed = false;

        const quick = nextLayout.widgetQuick;
        if (quick) {
            let safeQuick = { ...quick };
            const maxQuickHeight = Math.max(DASHBOARD_MIN_HEIGHT, Math.round(bounds.height * 0.42));
            if (safeQuick.h > maxQuickHeight) {
                safeQuick.h = maxQuickHeight;
                changed = true;
            }
            const maxQuickY = Math.max(0, bounds.height - safeQuick.h);
            const targetQuickY = clampInt(bounds.height - safeQuick.h - gapSize, 0, maxQuickY, safeQuick.y);
            if (targetQuickY !== safeQuick.y) {
                safeQuick.y = targetQuickY;
                changed = true;
            }
            nextLayout.widgetQuick = safeQuick;
        }

        const lessons = nextLayout.widgetLessons;
        const safeQuick = nextLayout.widgetQuick;
        if (lessons && safeQuick) {
            const targetLessonsH = Math.max(DASHBOARD_MIN_HEIGHT, safeQuick.y - lessons.y - gapSize);
            if (targetLessonsH !== lessons.h) {
                nextLayout.widgetLessons = { ...lessons, h: targetLessonsH };
                changed = true;
            }
        }

        ["widgetClock", "widgetHomework"].forEach((id) => {
            const box = nextLayout[id];
            if (!box) return;
            const maxH = Math.max(DASHBOARD_MIN_HEIGHT, bounds.height - box.y);
            const targetH = Math.max(DASHBOARD_MIN_HEIGHT, Math.min(maxH, bounds.height - box.y - gapSize));
            if (targetH > box.h) {
                nextLayout[id] = { ...box, h: targetH };
                changed = true;
            }
        });

        if (changed) {
            dashboardLayout = nextLayout;
        }
        return changed;
    };
    const clampDashboardBox = (box) => {
        const bounds = getDashboardBounds();
        const fallback = { x: 0, y: 0, w: 320, h: 220 };
        if (!isValidDashboardBox(box)) return fallback;
        
        // Grid container padding/margin
        const gridPadding = 15;
        const availableWidth = Math.max(DASHBOARD_MIN_WIDTH, bounds.width - (gridPadding * 2));
        const availableHeight = Math.max(DASHBOARD_MIN_HEIGHT, bounds.height - (gridPadding * 2));
        
        const maxW = availableWidth;
        const maxH = availableHeight;
        const w = clampInt(box.w, DASHBOARD_MIN_WIDTH, maxW, fallback.w);
        const h = clampInt(box.h, DASHBOARD_MIN_HEIGHT, maxH, fallback.h);
        
        // Strict boundary constraints - widget must stay within grid bounds
        const minX = gridPadding;
        const minY = gridPadding;
        const maxX = Math.max(minX, bounds.width - gridPadding - w);
        const maxY = Math.max(minY, bounds.height - gridPadding - h);
        
        const x = clampInt(box.x, minX, maxX, fallback.x);
        const y = clampInt(box.y, minY, maxY, fallback.y);
        return { x, y, w, h };
    };
    const clearDashboardDropState = () => {
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.remove("drop-target");
            el.classList.remove("is-dragging");
            el.classList.remove("is-resizing");
        });
        pointerDropTargetId = "";
    };
    const setDashboardDropTarget = (targetId) => {
        const nextId = targetId || "";
        if (pointerDropTargetId && pointerDropTargetId !== nextId) {
            const prevEl = document.getElementById(pointerDropTargetId);
            if (prevEl) prevEl.classList.remove("drop-target");
        }
        pointerDropTargetId = nextId;
        if (!pointerDropTargetId) return;
        const nextEl = document.getElementById(pointerDropTargetId);
        if (nextEl) nextEl.classList.add("drop-target");
    };
    const ensureWidgetDragHint = (widgetEl) => {
        if (!widgetEl || widgetEl.querySelector(DASHBOARD_DRAG_HANDLE_SELECTOR)) return;
        const hint = document.createElement("button");
        hint.type = "button";
        hint.className = "widget-drag-handle";
        hint.innerText = "↕ Taşı";
        hint.title = "Paneli taşımak için sürükle";
        hint.setAttribute("aria-label", "Paneli taşı");
        hint.setAttribute("data-lock-exempt", "true");
        widgetEl.appendChild(hint);
    };
    const ensureWidgetResizeHandle = (widgetEl) => {
        if (!widgetEl || widgetEl.querySelector(DASHBOARD_RESIZE_HANDLE_SELECTOR)) return;
        const handle = document.createElement("button");
        handle.type = "button";
        handle.className = "widget-resize-handle";
        handle.innerText = "◣";
        handle.title = "Sol alttan tutup boyutlandır";
        handle.setAttribute("aria-label", "Paneli boyutlandır");
        handle.setAttribute("data-lock-exempt", "true");
        widgetEl.appendChild(handle);
    };
    const applyDashboardLayout = (persist = false) => {
        if (!dashboardLayout) return;
        dashboardLayout = normalizeDashboardLayout(dashboardLayout);
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const box = dashboardLayout[id];
            if (!box) return;
            el.style.position = "absolute";
            el.style.margin = "0";
            el.style.gridColumn = "auto";
            el.style.gridRow = "auto";
            el.style.left = `${box.x}px`;
            el.style.top = `${box.y}px`;
            el.style.width = `${box.w}px`;
            el.style.height = `${box.h}px`;
        });
        if (persist) saveDashboardLayout();
    };
    const ensureDashboardLayoutForSwap = () => {
        if (dashboardLayout) return true;
        dashboardLayout = loadDashboardLayout() || captureInitialDashboardLayout() || createFallbackDashboardLayout();
        return !!dashboardLayout;
    };
    const swapDashboardWidgetPositions = (sourceId, targetId, keepWidgetSizes = true) => {
        if (!sourceId || !targetId || sourceId === targetId) return false;
        if (!ensureDashboardLayoutForSwap()) return false;
        const sourceBox = dashboardLayout[sourceId];
        const targetBox = dashboardLayout[targetId];
        if (!isValidDashboardBox(sourceBox) || !isValidDashboardBox(targetBox)) return false;
        if (keepWidgetSizes) {
            dashboardLayout[sourceId] = { ...sourceBox, x: targetBox.x, y: targetBox.y };
            dashboardLayout[targetId] = { ...targetBox, x: sourceBox.x, y: sourceBox.y };
        } else {
            dashboardLayout[sourceId] = { ...targetBox };
            dashboardLayout[targetId] = { ...sourceBox };
        }
        return true;
    };
    const getMaxHeightWithoutOverlap = (widgetId, box, layout, boundsHeight, gapSize) => {
        let maxBottom = boundsHeight;
        DASHBOARD_WIDGET_IDS.forEach((otherId) => {
            if (otherId === widgetId) return;
            const other = layout[otherId];
            if (!other) return;
            const overlapX = Math.min(box.x + box.w, other.x + other.w) - Math.max(box.x, other.x);
            if (overlapX < 24) return;
            if (other.y < box.y + box.h - 1) return;
            maxBottom = Math.min(maxBottom, other.y - gapSize);
        });
        return Math.max(DASHBOARD_MIN_HEIGHT, maxBottom - box.y);
    };
    const scaleDashboardWidth = (prevBounds, nextBounds) => {
        if (!dashboardLayout) return false;
        const prevW = Math.max(1, Math.round(prevBounds?.width || 0));
        const nextW = Math.max(1, Math.round(nextBounds?.width || 0));
        if (Math.abs(nextW - prevW) < 2) return false;
        const ratio = nextW / prevW;
        if (!Number.isFinite(ratio) || ratio <= 0) return false;
        const sourceLayout = dashboardLayout;
        const nextLayout = { ...sourceLayout };
        let changed = false;

        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const box = sourceLayout[id];
            if (!box) return;
            const scaledW = Math.max(DASHBOARD_MIN_WIDTH, Math.round(box.w * ratio));
            const scaledX = Math.round(box.x * ratio);
            if (scaledW === box.w && scaledX === box.x) return;
            nextLayout[id] = { ...box, x: scaledX, w: scaledW };
            changed = true;
        });
        if (changed) dashboardLayout = nextLayout;
        return changed;
    };
    const isBottomAnchoredWidget = (widgetId, box, boundsHeight, gapSize) => {
        if (DASHBOARD_BOTTOM_ANCHORED_IDS.has(widgetId)) return true;
        if (!box || boundsHeight <= 0) return false;
        const bottomGap = boundsHeight - (box.y + box.h);
        return box.y > boundsHeight * 0.4 && bottomGap <= gapSize + 8;
    };
    const growDashboardDownward = (prevBounds, nextBounds) => {
        if (!dashboardLayout) return false;
        const deltaH = Math.round(nextBounds.height - prevBounds.height);
        if (deltaH <= 0) return false;
        const gapSize = clampInt(panelStyleSettings?.gap, 6, 36, 12);
        const sourceLayout = dashboardLayout;
        const nextLayout = { ...dashboardLayout };
        let changed = false;

        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const box = sourceLayout[id];
            if (!box) return;
            if (!isBottomAnchoredWidget(id, box, prevBounds.height, gapSize)) return;
            const maxY = Math.max(0, nextBounds.height - box.h);
            const movedY = clampInt(box.y + deltaH, 0, maxY, box.y);
            if (movedY === box.y) return;
            nextLayout[id] = { ...box, y: movedY };
            changed = true;
        });

        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const sourceBox = sourceLayout[id];
            if (!sourceBox) return;
            if (isBottomAnchoredWidget(id, sourceBox, prevBounds.height, gapSize)) return;
            const box = nextLayout[id] || sourceBox;
            const noOverlapMaxH = getMaxHeightWithoutOverlap(id, box, nextLayout, nextBounds.height, gapSize);
            const maxH = Math.max(DASHBOARD_MIN_HEIGHT, Math.min(nextBounds.height - box.y, noOverlapMaxH));
            const grownH = Math.min(maxH, sourceBox.h + deltaH);
            if (grownH === box.h) return;
            nextLayout[id] = { ...box, h: grownH };
            changed = true;
        });

        if (changed) dashboardLayout = nextLayout;
        return changed;
    };
    
    const fixDashboardWidgetOverlaps = (bounds) => {
        if (!dashboardLayout || !bounds) return;
        const gapSize = clampInt(panelStyleSettings?.gap, 6, 36, 12);
        const nextLayout = { ...dashboardLayout };
        let changed = false;
        
        // Helper to check overlap
        const checkOverlap = (box1, box2) => {
            const dx = Math.min(box1.x + box1.w, box2.x + box2.w) - Math.max(box1.x, box2.x);
            const dy = Math.min(box1.y + box1.h, box2.y + box2.h) - Math.max(box1.y, box2.y);
            return dx > 8 && dy > 8;
        };
        
        // Check all widgets for overlaps
        DASHBOARD_WIDGET_IDS.forEach((id1) => {
            const box1 = nextLayout[id1];
            if (!box1) return;
            
            let hasOverlap = false;
            DASHBOARD_WIDGET_IDS.forEach((id2) => {
                if (id1 >= id2) return; // Avoid duplicate checks
                const box2 = nextLayout[id2];
                if (!box2 || checkOverlap(box1, box2)) {
                    hasOverlap = true;
                }
            });
            
            // If overlap detected, try to reposition
            if (hasOverlap) {
                // Try moving down first
                let newY = box1.y + box1.h + gapSize;
                if (newY + box1.h <= bounds.height - gapSize) {
                    nextLayout[id1] = { ...box1, y: newY };
                    changed = true;
                } else {
                    // Try shrinking height
                    const maxH = Math.max(DASHBOARD_MIN_HEIGHT, bounds.height - newY - gapSize);
                    if (maxH < box1.h) {
                        nextLayout[id1] = { ...box1, h: maxH };
                        changed = true;
                    }
                }
            }
        });
        
        if (changed) {
            dashboardLayout = nextLayout;
        }
    };
    
    const handleDashboardViewportChange = () => {
        // Minimal viewport handling - mostly keep layout as-is
        const nextBounds = getDashboardBounds();
        if (!dashboardLayout) {
            dashboardLastBounds = nextBounds;
            return;
        }
        applyDashboardLayout(false);
        dashboardLastBounds = nextBounds;
    };
    function canUseDashboardDrag() {
        return !!uiSettings.widgetDragEnabled;
    }
    function applyDashboardDragState() {
        const enabled = !!uiSettings.widgetDragEnabled;
        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.draggable = false;
            el.classList.toggle("drag-active", enabled);
            const handle = el.querySelector(DASHBOARD_DRAG_HANDLE_SELECTOR);
            if (handle) {
                handle.disabled = !enabled;
                handle.style.removeProperty("display");
            }
            const resizeHandle = el.querySelector(DASHBOARD_RESIZE_HANDLE_SELECTOR);
            if (resizeHandle) {
                resizeHandle.disabled = !enabled;
                resizeHandle.style.removeProperty("display");
            }
        });
        if (!enabled) updateEditModeSelectionClasses();
    }
    const onDashboardWidgetClick = (e) => {
        if (!canUseDashboardDrag()) return;
        if (Date.now() < suppressDashboardClickUntil) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (e.target && typeof e.target.closest === "function" && (
            e.target.closest(DASHBOARD_DRAG_HANDLE_SELECTOR) ||
            e.target.closest(DASHBOARD_RESIZE_HANDLE_SELECTOR)
        )) {
            return;
        }
        const widget = e.currentTarget;
        if (!widget || !widget.id) return;
        selectEditWidget(widget.id, true);
        e.preventDefault();
        e.stopPropagation();
    };
    const startDashboardMove = (widget, e) => {
        const current = dashboardLayout?.[widget.id];
        if (!SIMPLE_DASHBOARD_GRID_MODE && !current) return;
        
        // Panel seçim görseli
        document.querySelectorAll(".dashboard-widget").forEach(w => {
            w.classList.remove("drag-selected");
        });
        widget.classList.add("drag-selected");
        
        pointerDragWidgetId = widget.id;
        pointerDragPointerId = e.pointerId;
        pointerDragActivated = false;
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        pointerDragStartBox = current ? { ...current } : { x: 0, y: 0, w: 0, h: 0 };
        setDashboardDropTarget("");
        widget.classList.add("is-dragging");
        if (typeof widget.setPointerCapture === "function") {
            try {
                widget.setPointerCapture(e.pointerId);
            } catch (_) {}
        }
        e.preventDefault();
        e.stopPropagation();
    };
    
    window.selectDragPanel = (e) => {
        // Panel tıklandığında drag sistemini başlat
        let widget = e.target;
        while (widget && !widget.classList.contains("dashboard-widget")) {
            widget = widget.parentElement;
        }
        if (!widget || !widget.id) return;
        
        startDashboardMove(widget, e);
    };
    const startDashboardResize = (widget, e) => {
        const current = dashboardLayout?.[widget.id];
        if (!SIMPLE_DASHBOARD_GRID_MODE && !current) return;
        const rect = widget.getBoundingClientRect();
        resizeWidgetId = widget.id;
        resizePointerId = e.pointerId;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartBox = current
            ? { ...current }
            : {
                w: Math.round(rect.width),
                h: Math.round(rect.height),
                panelStyle: {
                    leftWidth: panelStyleSettings.leftWidth,
                    rightWidth: panelStyleSettings.rightWidth,
                    bottomHeight: panelStyleSettings.bottomHeight,
                    gap: panelStyleSettings.gap
                }
            };
        widget.classList.add("is-resizing");
        selectEditWidget(widget.id, false);
        if (typeof widget.setPointerCapture === "function") {
            try {
                widget.setPointerCapture(e.pointerId);
            } catch (_) {}
        }
        e.preventDefault();
        e.stopPropagation();
    };
    const onDashboardPointerDown = (e) => {
        if (!canUseDashboardDrag()) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const widget = e.currentTarget;
        if (!widget || !widget.id) return;

        const resizeHandle = (e.target && typeof e.target.closest === "function")
            ? e.target.closest(DASHBOARD_RESIZE_HANDLE_SELECTOR)
            : null;
        if (resizeHandle && !resizeHandle.disabled) {
            startDashboardResize(widget, e);
            return;
        }

        const dragHandle = (e.target && typeof e.target.closest === "function")
            ? e.target.closest(DASHBOARD_DRAG_HANDLE_SELECTOR)
            : null;
        if (!dragHandle || dragHandle.disabled) return;

        // Sadece sağ üstteki "Taşı" butonundan sürükleme başlasın
        startDashboardMove(widget, e);
    };
    const onDashboardPointerMove = (e) => {
        if (resizeWidgetId) {
            if (resizePointerId !== null && e.pointerId !== resizePointerId) return;
            if (!resizeStartBox) return;
            const widget = document.getElementById(resizeWidgetId);
            if (!widget) return;
            const dx = e.clientX - resizeStartX;
            const dy = e.clientY - resizeStartY;

            if (SIMPLE_DASHBOARD_GRID_MODE) {
                applySimpleGridLinkedResize(resizeWidgetId, dx, dy);
            } else if (dashboardLayout?.[resizeWidgetId]) {
                const bounds = getDashboardBounds();
                const startX = Number(resizeStartBox.x) || 0;
                const startY = Number(resizeStartBox.y) || 0;
                const maxWidth = Math.max(DASHBOARD_MIN_WIDTH, Math.round(bounds.width - startX));
                const maxHeight = Math.max(DASHBOARD_MIN_HEIGHT, Math.round(bounds.height - startY));
                const nextW = clampInt(resizeStartBox.w + dx, DASHBOARD_MIN_WIDTH, maxWidth, resizeStartBox.w);
                const nextH = clampInt(resizeStartBox.h + dy, DASHBOARD_MIN_HEIGHT, maxHeight, resizeStartBox.h);
                dashboardLayout[resizeWidgetId] = {
                    ...dashboardLayout[resizeWidgetId],
                    w: nextW,
                    h: nextH
                };
                applyDashboardLayout(false);
            }
            e.preventDefault();
            return;
        }
        
        if (!pointerDragWidgetId || !canUseDashboardDrag()) return;
        if (pointerDragPointerId !== null && e.pointerId !== pointerDragPointerId) return;
        if (!pointerDragStartBox) return;
        
        const dx = e.clientX - pointerStartX;
        const dy = e.clientY - pointerStartY;
        
        if (!pointerDragActivated) {
            const travel = Math.hypot(dx, dy);
            if (travel < POINTER_DRAG_THRESHOLD) return;
            pointerDragActivated = true;
        }

        const hitEl = document.elementFromPoint(e.clientX, e.clientY);
        let targetId = "";
        if (hitEl && typeof hitEl.closest === "function") {
            const targetWidget = hitEl.closest(".dashboard-widget");
            if (targetWidget?.id && targetWidget.id !== pointerDragWidgetId) {
                targetId = targetWidget.id;
            }
        }
        setDashboardDropTarget(targetId);
        e.preventDefault();
    };
    const onDashboardPointerUp = (e) => {
        if (resizeWidgetId) {
            if (resizePointerId !== null && e.pointerId !== resizePointerId) return;
            const resizedId = resizeWidgetId;
            const resizedEl = document.getElementById(resizedId);
            if (resizedEl) {
                resizedEl.classList.remove("is-resizing");
                if (typeof resizedEl.releasePointerCapture === "function") {
                    try {
                        resizedEl.releasePointerCapture(e.pointerId);
                    } catch (_) {}
                }
            }
            if (SIMPLE_DASHBOARD_GRID_MODE) {
                savePanelStyleSettings();
                renderPanelStyleForm();
            } else if (dashboardLayout?.[resizedId]) {
                applyDashboardLayout(true);
                saveDashboardLayout();
            }
            resizeWidgetId = "";
            resizePointerId = null;
            resizeStartBox = null;
            suppressDashboardClickUntil = Date.now() + 200;
            e.preventDefault();
            return;
        }
        
        if (!pointerDragWidgetId) return;
        if (pointerDragPointerId !== null && e.pointerId !== pointerDragPointerId) return;
        
        const sourceId = pointerDragWidgetId;
        const sourceEl = document.getElementById(sourceId);
        const moved = pointerDragActivated;
        
        pointerDragWidgetId = "";
        pointerDragPointerId = null;
        pointerDragActivated = false;
        pointerDragStartBox = null;
        
        if (sourceEl) {
            sourceEl.classList.remove("is-dragging");
            if (typeof sourceEl.releasePointerCapture === "function") {
                try {
                    sourceEl.releasePointerCapture(e.pointerId);
                } catch (_) {}
            }
        }
        
        const dropTargetId = pointerDropTargetId;
        clearDashboardDropState();
        
        if (moved && dropTargetId) {
            if (SIMPLE_DASHBOARD_GRID_MODE) {
                if (swapDashboardWidgetRoles(sourceId, dropTargetId)) {
                    suppressDashboardClickUntil = Date.now() + 250;
                }
            } else if (dashboardLayout[sourceId]) {
                swapDashboardWidgetPositions(sourceId, dropTargetId, true);
                applyDashboardLayout(true);
                saveDashboardLayout();
                suppressDashboardClickUntil = Date.now() + 250;
            }
        }
        
        e.preventDefault();
    };
    const onDashboardClickCapture = (e) => {
        if (Date.now() >= suppressDashboardClickUntil) return;
        e.preventDefault();
        e.stopPropagation();
    };
    const initDashboardWidgets = () => {
        if (SIMPLE_DASHBOARD_GRID_MODE) {
            activateDashboardSimpleGrid();
            DASHBOARD_WIDGET_IDS.forEach((id) => {
                const widget = document.getElementById(id);
                if (!widget) return;
                widget.classList.add("dashboard-widget");
                clearWidgetInlineLayout(widget);
                ensureWidgetDragHint(widget);
                ensureWidgetResizeHandle(widget);
                if (widget.dataset.dragReady === "1") return;
                widget.dataset.dragReady = "1";
                widget.addEventListener("pointerdown", onDashboardPointerDown);
                widget.addEventListener("click", onDashboardWidgetClick, true);
            });
            const storedRoleLayout = loadDashboardRoleLayout();
            if (storedRoleLayout) applyDashboardRoleLayout(storedRoleLayout);
            if (!document.body.dataset.dashboardPointerReady) {
                document.body.dataset.dashboardPointerReady = "1";
                document.addEventListener("pointermove", onDashboardPointerMove);
                document.addEventListener("pointerup", onDashboardPointerUp);
                document.addEventListener("pointercancel", onDashboardPointerUp);
                document.addEventListener("click", onDashboardClickCapture, true);
            }
            dashboardLayout = null;
            dashboardLastBounds = getDashboardBounds();
            applyDashboardDragState();
            return;
        }
        const initialLayout = captureInitialDashboardLayout() || createFallbackDashboardLayout();
        dashboardLayout = loadDashboardLayout() || initialLayout;
        activateDashboardFreeLayout();
        const currentBounds = getDashboardBounds();
        let prevBoundsForGrow = loadDashboardLayoutMeta();
        if (!prevBoundsForGrow) {
            const estimatedHeight = estimateDashboardLayoutHeight(dashboardLayout);
            if (estimatedHeight > 0) {
                prevBoundsForGrow = { width: currentBounds.width, height: Math.min(currentBounds.height, estimatedHeight) };
            }
        }
        if (prevBoundsForGrow && Math.abs(currentBounds.width - prevBoundsForGrow.width) > 1) {
            scaleDashboardWidth(prevBoundsForGrow, currentBounds);
        }
        if (prevBoundsForGrow && currentBounds.height > prevBoundsForGrow.height + 1) {
            growDashboardDownward(prevBoundsForGrow, currentBounds);
        }

        DASHBOARD_WIDGET_IDS.forEach((id) => {
            const widget = document.getElementById(id);
            if (!widget) return;
            widget.classList.add("dashboard-widget");
            ensureWidgetDragHint(widget);
            ensureWidgetResizeHandle(widget);
            if (widget.dataset.dragReady === "1") return;
            widget.dataset.dragReady = "1";
            widget.addEventListener("pointerdown", onDashboardPointerDown);
            widget.addEventListener("click", onDashboardWidgetClick, true);
        });
        if (!document.body.dataset.dashboardPointerReady) {
            document.body.dataset.dashboardPointerReady = "1";
            document.addEventListener("pointermove", onDashboardPointerMove);
            document.addEventListener("pointerup", onDashboardPointerUp);
            document.addEventListener("pointercancel", onDashboardPointerUp);
            document.addEventListener("click", onDashboardClickCapture, true);
        }
        if (!document.body.dataset.dashboardWindowResizeReady) {
            document.body.dataset.dashboardWindowResizeReady = "1";
            let lastDevicePixelRatio = window.devicePixelRatio;
            
            // Monitor both window resize and zoom changes
            window.addEventListener("resize", () => {
                if (dashboardResizeDebounceTimer) clearTimeout(dashboardResizeDebounceTimer);
                dashboardResizeDebounceTimer = setTimeout(() => {
                    handleDashboardViewportChange();
                    dashboardResizeDebounceTimer = null;
                }, 120);
            });
            
            // Monitor zoom changes (devicePixelRatio)
            const zoomCheckInterval = setInterval(() => {
                if (window.devicePixelRatio !== lastDevicePixelRatio) {
                    lastDevicePixelRatio = window.devicePixelRatio;
                    if (dashboardResizeDebounceTimer) clearTimeout(dashboardResizeDebounceTimer);
                    dashboardResizeDebounceTimer = setTimeout(() => {
                        handleDashboardViewportChange();
                        dashboardResizeDebounceTimer = null;
                    }, 100);
                }
            }, 200);
        }
        if (!document.body.dataset.dashboardFullscreenReady) {
            document.body.dataset.dashboardFullscreenReady = "1";
            document.addEventListener("fullscreenchange", () => {
                setTimeout(() => handleDashboardViewportChange(), 60);
                setTimeout(() => handleDashboardViewportChange(), 180);
                setTimeout(() => handleDashboardViewportChange(), 360);
            });
        }
        applyDashboardLayout(true);
        dashboardLastBounds = currentBounds;
        autoExpandDashboardForFullscreen(currentBounds);
        applyDashboardLayout(true);
        applyDashboardDragState();
    };
    function initPanel(cClass) {
        document.getElementById("stClass").innerText = cClass;
        const cNum = parseInt(cClass.charAt(0));
        const cSec = cClass.charAt(1);

        const updatePresence = async () => {
            await setDoc(doc(db, "presence", cClass), {
                lastSeen: serverTimestamp(),
                status: "online",
                className: cClass
            }, { merge: true });
        };
        updatePresence();

        renderDailyLogPreview(null);
        if (typeof dailyLogPreviewUnsubscribe === "function") {
            dailyLogPreviewUnsubscribe();
        }
        dailyLogPreviewUnsubscribe = onSnapshot(
            doc(db, DAILY_NOTE_COLLECTION, getDailyNoteDocId(cClass)),
            (docSnap) => {
                renderDailyLogPreview(docSnap.exists() ? docSnap.data() : null);
            },
            () => renderDailyLogPreview(null)
        );

        function update() {
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
            document.getElementById("clock").innerText = timeStr;
            document.getElementById("date").innerText = now.toLocaleDateString("tr-TR", {day:'numeric', month:'long', weekday:'long'});
            document.getElementById("uptime").innerText = `⏱️ ${Math.floor((Date.now() - startTime) / 60000)}dk`;

            const day = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"][now.getDay()];
            const nt = dutyTeachers[day] || {};
            document.getElementById("nBahce").innerText = nt.bahce || "--";
            document.getElementById("nK1").innerText = nt.kat1 || "--";
            document.getElementById("nK2").innerText = nt.kat2 || "--";
            document.getElementById("nK3").innerText = nt.kat3 || "--";
            document.getElementById("nK4").innerText = nt.kat4 || "--";

            const prog = schoolData[cClass] ? schoolData[cClass][day] : null;
            let html = "", currentL = "Teneffüs ☕", timer = "--:--";
            
            if(prog) {
                prog.forEach((d, i) => {
                    const s = lessonHours[i].s, e = lessonHours[i].e;
                    const active = (timeStr >= s && timeStr <= e);
                    html += `<article class="lesson-box ${active ? 'active-lesson' : ''}">
                        <div class="lesson-box-main">
                            <span class="lesson-icon">${lessonIcons[d] || '📚'}</span>
                            <div class="lesson-copy">
                                <strong>${d}</strong>
                                <small>${active ? 'Şu an aktif ders' : 'Planlanan ders akışı'}</small>
                            </div>
                        </div>
                        <b class="lesson-time">${s} - ${e}</b>
                    </article>`;
                    if(active) {
                        currentL = d;
                        const [eH, eM] = e.split(":").map(Number);
                        const target = new Date(); target.setHours(eH, eM, 0);
                        const diff = Math.floor((target - now) / 1000);
                        if(diff > 0) timer = Math.floor(diff/60) + ":" + (diff%60).toString().padStart(2,'0');
                    }
                });
            }
            document.getElementById("lessonsPreview").innerHTML = html;
            document.getElementById("currentLesson").innerText = currentL;
            document.getElementById("lessonTimer").innerText = timer;
        }

        const q = query(collection(db, "homeworks"), where("classNumber", "==", cNum), where("classSection", "==", cSec));
        onSnapshot(q, (snap) => {
            let h = "";
            snap.forEach(docSnap => { 
                const data = docSnap.data();
                const id = docSnap.id;
                h += `
                <article class="homework-card">
                    <div class="homework-card-title">${data.title}</div>
                    <div class="homework-card-text">${data.desc}</div>
                    <button class="homework-delete" onclick="deleteHomework('${id}')" aria-label="Odevi sil">✕</button>
                </article>`; 
            });
            document.getElementById("hwPreview").innerHTML = h || "<div class='homework-empty'>Bugün için kaydedilmiş ödev görünmüyor. Yeni görev ekleyerek tahtayı güncel tutabilirsin.</div>";
        });

        setInterval(update, 1000); 
        update(); 
        getWeather();
    }

    window.deleteHomework = async (id) => {
    await deleteDoc(doc(db, "homeworks", id));
    };

    document.getElementById("addHwBtn").onclick = async () => {
        const t = document.getElementById("hT").value;
        const d = document.getElementById("hD").value;
        const cClass = localStorage.getItem("myClass");
        if(t && d && cClass) {
            await addDoc(collection(db, "homeworks"), { 
                title: t, desc: d, 
                classNumber: parseInt(cClass.charAt(0)), 
                classSection: cClass.charAt(1),
                timestamp: serverTimestamp() 
            });
            document.getElementById("hT").value = "";
            document.getElementById("hD").value = "";
            closeModal('hwModal');
        }
    };

    const BIRO_OFFICE_KEY = "biroOfficeDataV1";
    const BIRO_SHEET_ROWS = 14;
    const BIRO_SHEET_COLS = 8;
    const BIRO_OFFICE_APPS = ["word", "sheet", "slides"];
    const escapeHtml = (value) => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    const sheetColLabel = (index) => {
        let n = index + 1;
        let out = "";
        while (n > 0) {
            const rem = (n - 1) % 26;
            out = String.fromCharCode(65 + rem) + out;
            n = Math.floor((n - 1) / 26);
        }
        return out;
    };
    const createDefaultBiroOfficeState = () => ({
        activeApp: "word",
        wordHtml: `<h3 style="margin-top:0;">Ders Notu</h3><p>Buraya yazmaya başlayabilirsin...</p>`,
        sheetCells: {},
        slides: [
            {
                title: "Sunum 1",
                body: "Başlık ve içeriği düzenleyerek slaytı hazırla."
            }
        ],
        activeSlide: 0
    });
    const normalizeBiroOfficeState = (raw) => {
        const base = createDefaultBiroOfficeState();
        if (!raw || typeof raw !== "object") return base;

        const activeApp = BIRO_OFFICE_APPS.includes(raw.activeApp) ? raw.activeApp : base.activeApp;
        const wordHtml = (raw.wordHtml || "").toString() || base.wordHtml;

        const sheetCells = {};
        if (raw.sheetCells && typeof raw.sheetCells === "object") {
            Object.entries(raw.sheetCells).forEach(([key, value]) => {
                const cellKey = (key || "").toString().toUpperCase().replace(/[^A-Z0-9]/g, "");
                if (!cellKey) return;
                const safeValue = (value || "").toString();
                if (safeValue !== "") sheetCells[cellKey] = safeValue.slice(0, 200);
            });
        }

        const slidesRaw = Array.isArray(raw.slides) ? raw.slides : [];
        const slides = slidesRaw
            .filter((slide) => slide && typeof slide === "object")
            .map((slide) => ({
                title: (slide.title || "").toString().slice(0, 80) || "Yeni Slayt",
                body: (slide.body || "").toString().slice(0, 4000)
            }));

        const safeSlides = slides.length ? slides : base.slides;
        const idx = Number.isInteger(raw.activeSlide) ? raw.activeSlide : 0;
        const activeSlide = Math.min(Math.max(0, idx), safeSlides.length - 1);

        return {
            activeApp,
            wordHtml,
            sheetCells,
            slides: safeSlides,
            activeSlide
        };
    };
    const loadBiroOfficeState = () => {
        try {
            const raw = JSON.parse(localStorage.getItem(BIRO_OFFICE_KEY) || "{}");
            return normalizeBiroOfficeState(raw);
        } catch (_) {
            return createDefaultBiroOfficeState();
        }
    };
    let biroOfficeState = loadBiroOfficeState();
    const saveBiroOfficeState = () => {
        localStorage.setItem(BIRO_OFFICE_KEY, JSON.stringify(biroOfficeState));
    };
    const BIRO_FILE_MARKER = "birooffice-file";
    const BIRO_FILE_VERSION = 1;
    const BIRO_APP_FILE_META = {
        word: { defaultName: "belge", extension: "doc" },
        sheet: { defaultName: "excel", extension: "csv" },
        slides: { defaultName: "powerpoint", extension: "html" }
    };
    let biroSlideShowOpen = false;
    let biroSlideShowIndex = 0;
    const sanitizeFileName = (value, fallback) => {
        const safe = (value || "").toString().trim()
            .replace(/[\\/:*?"<>|]+/g, "-")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
        return safe || fallback;
    };
    const readFileAsText = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result || "").toString());
        reader.onerror = () => reject(new Error("Dosya okunamadı"));
        reader.readAsText(file, "utf-8");
    });
    const downloadTextFile = (filename, content, mimeType) => {
        const blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            a.remove();
        }, 0);
    };
    const stripScriptsAndStyles = (html) => {
        const doc = new DOMParser().parseFromString(html || "", "text/html");
        doc.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());
        return doc.body?.innerHTML || "";
    };
    const buildWordDocHtml = (bodyHtml) => {
        return [
            "<!DOCTYPE html>",
            "<html lang=\"tr\">",
            "<head>",
            "<meta charset=\"utf-8\">",
            "<title>Belge</title>",
            "</head>",
            `<body>${bodyHtml || ""}</body>`,
            "</html>"
        ].join("\n");
    };
    const buildSlidesHtmlExport = (slides) => {
        const safeSlides = (slides || []).map((slide, idx) => {
            const obj = slide && typeof slide === "object" ? slide : {};
            return {
                title: (obj.title || `Sunum ${idx + 1}`).toString(),
                body: (obj.body || "").toString()
            };
        });
        const total = safeSlides.length || 1;
        const safeList = safeSlides.length ? safeSlides : [{ title: "Sunum 1", body: "" }];
        const allSlides = safeList.map((slide, idx) => {
            return [
                "<section class=\"slide\">",
                `  <div class="counter">${idx + 1} / ${total}</div>`,
                `  <h1>${escapeHtml(slide.title)}</h1>`,
                `  <div class="body">${escapeHtml(slide.body)}</div>`,
                "</section>"
            ].join("\n");
        }).join("\n");
        return [
            "<!DOCTYPE html>",
            "<html lang=\"tr\">",
            "<head>",
            "<meta charset=\"utf-8\">",
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
            "<title>PowerPoint</title>",
            "<style>",
            "body{margin:0;font-family:Segoe UI,sans-serif;background:#020617;color:#f8fafc;padding:24px;box-sizing:border-box}",
            ".slide{width:min(1100px,96vw);min-height:min(92vh,860px);margin:0 auto 24px;border:1px solid #334155;border-radius:16px;background:radial-gradient(circle at top,#1e293b,#020617 60%);padding:24px;box-sizing:border-box}",
            ".counter{opacity:.78;margin-bottom:8px}",
            "h1{margin:0 0 12px;font-size:clamp(1.8rem,3vw,3rem)}",
            ".body{border:1px solid #334155;border-radius:12px;padding:16px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;background:rgba(15,23,42,.55);min-height:60vh}",
            "@media print{body{padding:0;background:#fff;color:#111}.slide{page-break-after:always;break-after:page;min-height:auto;border:none;border-radius:0;background:#fff;color:#111}.body{border:1px solid #ddd;background:#fff}}",
            "</style>",
            "</head>",
            "<body>",
            allSlides,
            "</body>",
            "</html>"
        ].join("\n");
    };
    const textToWordHtml = (text) => `<p>${escapeHtml((text || "").toString()).replace(/\r?\n/g, "<br>")}</p>`;
    const wordHtmlToText = (html) => {
        const temp = document.createElement("div");
        temp.innerHTML = html || "";
        return (temp.innerText || temp.textContent || "").trim();
    };
    const escapeCsvCell = (value) => {
        const txt = (value || "").toString();
        if (/[",\n]/.test(txt)) return `"${txt.replace(/"/g, "\"\"")}"`;
        return txt;
    };
    const splitCsvLine = (line, delimiter) => {
        const out = [];
        let cell = "";
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            const next = line[i + 1];
            if (ch === '"' && inQuote && next === '"') {
                cell += '"';
                i += 1;
                continue;
            }
            if (ch === '"') {
                inQuote = !inQuote;
                continue;
            }
            if (ch === delimiter && !inQuote) {
                out.push(cell);
                cell = "";
                continue;
            }
            cell += ch;
        }
        out.push(cell);
        return out;
    };
    const parseCsv = (text) => {
        const raw = (text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        const lines = raw.split("\n").filter((_, idx, arr) => !(idx === arr.length - 1 && arr[idx] === ""));
        const sample = lines.find((line) => line.trim() !== "") || "";
        const delimiter = sample.split(";").length > sample.split(",").length ? ";" : ",";
        return lines.map((line) => splitCsvLine(line, delimiter));
    };
    const exportSheetCsv = () => {
        const rows = [];
        for (let r = 1; r <= BIRO_SHEET_ROWS; r++) {
            const row = [];
            for (let c = 0; c < BIRO_SHEET_COLS; c++) {
                const key = `${sheetColLabel(c)}${r}`;
                row.push(escapeCsvCell(biroOfficeState.sheetCells[key] || ""));
            }
            rows.push(row.join(","));
        }
        return rows.join("\n");
    };
    const importSheetMatrix = (matrix) => {
        const next = {};
        const maxRows = Math.min(BIRO_SHEET_ROWS, matrix.length);
        for (let r = 0; r < maxRows; r++) {
            const maxCols = Math.min(BIRO_SHEET_COLS, (matrix[r] || []).length);
            for (let c = 0; c < maxCols; c++) {
                const val = ((matrix[r] || [])[c] || "").toString().slice(0, 200);
                if (!val) continue;
                const key = `${sheetColLabel(c)}${r + 1}`;
                next[key] = val;
            }
        }
        biroOfficeState.sheetCells = next;
    };
    const importBiroOfficeJson = (data) => {
        if (!data || typeof data !== "object") return false;

        if (data.type === BIRO_FILE_MARKER) {
            const app = data.app;
            const payload = data.payload || {};
            if (app === "word") {
                biroOfficeState.activeApp = "word";
                const html = (payload.html || "").toString().trim();
                const text = (payload.text || "").toString();
                biroOfficeState.wordHtml = html ? stripScriptsAndStyles(html) : textToWordHtml(text);
                return true;
            }
            if (app === "sheet") {
                biroOfficeState.activeApp = "sheet";
                if (payload.cells && typeof payload.cells === "object") {
                    biroOfficeState.sheetCells = normalizeBiroOfficeState({ sheetCells: payload.cells }).sheetCells;
                    return true;
                }
                if (typeof payload.csv === "string") {
                    importSheetMatrix(parseCsv(payload.csv));
                    return true;
                }
            }
            if (app === "slides") {
                biroOfficeState.activeApp = "slides";
                const normalized = normalizeBiroOfficeState({ slides: payload.slides, activeSlide: 0 });
                biroOfficeState.slides = normalized.slides;
                biroOfficeState.activeSlide = 0;
                return true;
            }
        }

        if ("wordHtml" in data || "sheetCells" in data || "slides" in data || "activeApp" in data) {
            biroOfficeState = normalizeBiroOfficeState(data);
            return true;
        }
        return false;
    };
    window.openBiroOfficeFile = () => {
        const input = document.getElementById("biroOfficeFileInput");
        if (!input) return;
        input.value = "";
        input.click();
    };
    window.handleBiroOfficeFile = async (event) => {
        const file = event?.target?.files?.[0];
        if (!file) return;
        try {
            const text = await readFileAsText(file);
            const ext = (file.name.split(".").pop() || "").toLowerCase();

            if (ext === "csv" || ext === "exxel") {
                biroOfficeState.activeApp = "sheet";
                importSheetMatrix(parseCsv(text));
                saveBiroOfficeState();
                renderBiroOffice();
                alert("Tablo dosyası BiroTablo'ya yüklendi.");
                return;
            }

            if (ext === "txt" || ext === "doc" || ext === "belge") {
                if (biroOfficeState.activeApp === "slides") {
                    biroOfficeState.slides[biroOfficeState.activeSlide].body = text.slice(0, 4000);
                } else {
                    biroOfficeState.activeApp = "word";
                    biroOfficeState.wordHtml = ext === "txt" ? textToWordHtml(text) : stripScriptsAndStyles(text);
                }
                saveBiroOfficeState();
                renderBiroOffice();
                alert("Belge dosyası yüklendi.");
                return;
            }

            if (ext === "html" || ext === "htm") {
                biroOfficeState.activeApp = "word";
                biroOfficeState.wordHtml = stripScriptsAndStyles(text);
                saveBiroOfficeState();
                renderBiroOffice();
                alert("HTML dosyası BiroYazı içine aktarıldı.");
                return;
            }

            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch (_) {
                parsed = null;
            }
            if (parsed && importBiroOfficeJson(parsed)) {
                saveBiroOfficeState();
                renderBiroOffice();
                alert("BiroOffice dosyası yüklendi.");
                return;
            }

            alert("Desteklenmeyen dosya biçimi. .doc, .csv, .html, .biro, .json, .txt, .belge, .exxel, .powerpoint kullan.");
        } catch (err) {
            alert("Dosya açılırken hata oluştu.");
        } finally {
            if (event?.target) event.target.value = "";
        }
    };
    window.saveBiroOfficeFile = () => {
        const app = biroOfficeState.activeApp || "word";
        const meta = BIRO_APP_FILE_META[app] || { defaultName: "birooffice", extension: "biro" };
        const suggested = meta.defaultName;
        const entered = prompt("Kaydedilecek dosya adı:", suggested);
        if (entered === null) return;
        const fileName = sanitizeFileName(entered, suggested);
        const ext = meta.extension || "biro";
        const finalName = fileName.toLowerCase().endsWith(`.${ext}`) ? fileName.slice(0, -1 * (ext.length + 1)) : fileName;

        if (app === "word") {
            const wordDoc = buildWordDocHtml(biroOfficeState.wordHtml);
            downloadTextFile(`${finalName}.${ext}`, wordDoc, "application/msword;charset=utf-8");
            return;
        }

        if (app === "sheet") {
            downloadTextFile(`${finalName}.${ext}`, exportSheetCsv(), "text/csv;charset=utf-8");
            return;
        }

        const slideHtml = buildSlidesHtmlExport(biroOfficeState.slides);
        downloadTextFile(`${finalName}.${ext}`, slideHtml, "text/html;charset=utf-8");
    };
    const updateBiroOfficeTabs = () => {
        BIRO_OFFICE_APPS.forEach((app) => {
            const tab = document.getElementById(`boTab-${app}`);
            if (!tab) return;
            tab.classList.toggle("active", biroOfficeState.activeApp === app);
        });
    };
    const renderWordApp = () => {
        const host = document.getElementById("biroOfficeContent");
        if (!host) return;
        host.innerHTML = `
            <div class="bo-word-toolbar">
                <button onclick="biroWordCmd('bold')"><b>Kalın</b></button>
                <button onclick="biroWordCmd('italic')"><i>İtalik</i></button>
                <button onclick="biroWordCmd('underline')"><u>Altı Çizili</u></button>
                <button onclick="biroWordCmd('insertUnorderedList')">• Liste</button>
                <button onclick="biroWordCmd('justifyLeft')">Sola</button>
                <button onclick="biroWordCmd('justifyCenter')">Ortala</button>
                <button onclick="biroWordCmd('justifyRight')">Sağa</button>
                <button onclick="clearBiroWord()" style="background:#475569;">Temizle</button>
            </div>
            <div id="biroWordEditor" contenteditable="true"></div>
        `;
        const editor = document.getElementById("biroWordEditor");
        if (!editor) return;
        editor.innerHTML = biroOfficeState.wordHtml || "";
        editor.addEventListener("input", () => {
            biroOfficeState.wordHtml = editor.innerHTML;
            saveBiroOfficeState();
        });
    };
    const renderSheetApp = () => {
        const host = document.getElementById("biroOfficeContent");
        if (!host) return;

        const head = Array.from({ length: BIRO_SHEET_COLS }, (_, c) => `<th>${sheetColLabel(c)}</th>`).join("");
        const body = Array.from({ length: BIRO_SHEET_ROWS }, (_, r) => {
            const rowNum = r + 1;
            const cols = Array.from({ length: BIRO_SHEET_COLS }, (_, c) => {
                const key = `${sheetColLabel(c)}${rowNum}`;
                const value = biroOfficeState.sheetCells[key] || "";
                return `<td><input class="bo-sheet-cell" value="${escapeHtml(value)}" oninput="setBiroSheetCell('${key}', this.value)" placeholder="${key}"></td>`;
            }).join("");
            return `<tr><th>${rowNum}</th>${cols}</tr>`;
        }).join("");

        host.innerHTML = `
            <div class="bo-word-toolbar">
                <button onclick="clearBiroSheet()" style="background:#475569;">Tabloyu Temizle</button>
            </div>
            <div class="bo-sheet-wrap">
                <table class="bo-sheet">
                    <thead><tr><th>#</th>${head}</tr></thead>
                    <tbody>${body}</tbody>
                </table>
            </div>
            <div style="font-size:0.76rem; opacity:0.78; margin-top:8px;">
                Hücrelere doğrudan yazabilirsin. Veriler bu cihazda kaydedilir.
            </div>
        `;
    };
    const renderSlidesApp = () => {
        const host = document.getElementById("biroOfficeContent");
        if (!host) return;
        const slideCount = biroOfficeState.slides.length;
        const safeIndex = Math.min(Math.max(0, biroOfficeState.activeSlide), slideCount - 1);
        biroOfficeState.activeSlide = safeIndex;
        const current = biroOfficeState.slides[safeIndex];
        const listHtml = biroOfficeState.slides.map((slide, idx) => {
            const active = idx === safeIndex ? "active" : "";
            const title = escapeHtml(slide.title || `Sunum ${idx + 1}`);
            return `<button class="${active}" data-slide-index="${idx}" onclick="selectBiroSlide(${idx})">📄 ${title}</button>`;
        }).join("");

        host.innerHTML = `
            <div class="bo-slides">
                <div class="bo-slide-list">
                    ${listHtml}
                    <button onclick="addBiroSlide()" style="background:#0ea5e9; color:#fff;">+ Yeni Slayt</button>
                    <button onclick="deleteBiroSlide()" style="background:#ef4444; color:#fff;">Seçiliyi Sil</button>
                    <button onclick="openBiroSlideShow()" style="background:#16a34a; color:#fff;">Tam Ekran Sunum</button>
                </div>
                <div class="bo-slide-editor">
                    <input id="boSlideTitle" value="${escapeHtml(current.title)}" placeholder="Slayt başlığı" oninput="updateBiroSlide('title', this.value)">
                    <textarea id="boSlideBody" placeholder="Slayt içeriği" oninput="updateBiroSlide('body', this.value)">${escapeHtml(current.body)}</textarea>
                    <div class="bo-slide-preview">
                        <h2 id="boSlidePreviewTitle" style="margin:0 0 10px; color:#e2e8f0;">${escapeHtml(current.title)}</h2>
                        <div id="boSlidePreviewBody" style="white-space:pre-wrap; font-size:1rem; color:#cbd5e1;">${escapeHtml(current.body)}</div>
                    </div>
                </div>
            </div>
        `;
    };
    const renderBiroOffice = () => {
        updateBiroOfficeTabs();
        if (biroOfficeState.activeApp === "word") {
            renderWordApp();
            return;
        }
        if (biroOfficeState.activeApp === "sheet") {
            renderSheetApp();
            return;
        }
        renderSlidesApp();
    };
    window.switchBiroOfficeApp = (app) => {
        if (!BIRO_OFFICE_APPS.includes(app)) return;
        biroOfficeState.activeApp = app;
        saveBiroOfficeState();
        renderBiroOffice();
    };
    window.biroWordCmd = (command) => {
        const editor = document.getElementById("biroWordEditor");
        if (!editor) return;
        editor.focus();
        document.execCommand(command, false, null);
        biroOfficeState.wordHtml = editor.innerHTML;
        saveBiroOfficeState();
    };
    window.clearBiroWord = () => {
        biroOfficeState.wordHtml = "<p></p>";
        saveBiroOfficeState();
        renderBiroOffice();
    };
    window.setBiroSheetCell = (key, value) => {
        const safeKey = (key || "").toString().toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (!safeKey) return;
        const safeValue = (value || "").toString().slice(0, 200);
        if (safeValue === "") delete biroOfficeState.sheetCells[safeKey];
        else biroOfficeState.sheetCells[safeKey] = safeValue;
        saveBiroOfficeState();
    };
    window.clearBiroSheet = () => {
        biroOfficeState.sheetCells = {};
        saveBiroOfficeState();
        renderBiroOffice();
    };
    window.selectBiroSlide = (index) => {
        if (!Number.isInteger(index)) return;
        if (index < 0 || index >= biroOfficeState.slides.length) return;
        biroOfficeState.activeSlide = index;
        saveBiroOfficeState();
        renderBiroOffice();
    };
    window.addBiroSlide = () => {
        biroOfficeState.slides.push({
            title: `Sunum ${biroOfficeState.slides.length + 1}`,
            body: ""
        });
        biroOfficeState.activeSlide = biroOfficeState.slides.length - 1;
        saveBiroOfficeState();
        renderBiroOffice();
    };
    window.deleteBiroSlide = () => {
        if (biroOfficeState.slides.length <= 1) {
            biroOfficeState.slides = [{ title: "Sunum 1", body: "" }];
            biroOfficeState.activeSlide = 0;
            saveBiroOfficeState();
            renderBiroOffice();
            return;
        }
        biroOfficeState.slides.splice(biroOfficeState.activeSlide, 1);
        biroOfficeState.activeSlide = Math.max(0, biroOfficeState.activeSlide - 1);
        saveBiroOfficeState();
        renderBiroOffice();
    };
    window.updateBiroSlide = (field, value) => {
        const idx = biroOfficeState.activeSlide;
        const slide = biroOfficeState.slides[idx];
        if (!slide) return;
        if (field === "title") slide.title = (value || "").toString().slice(0, 80) || "Yeni Slayt";
        if (field === "body") slide.body = (value || "").toString().slice(0, 4000);
        saveBiroOfficeState();
        const titlePreview = document.getElementById("boSlidePreviewTitle");
        const bodyPreview = document.getElementById("boSlidePreviewBody");
        if (titlePreview) titlePreview.innerText = slide.title;
        if (bodyPreview) bodyPreview.innerText = slide.body;
        if (field === "title") {
            const activeBtn = document.querySelector(`.bo-slide-list button[data-slide-index="${idx}"]`);
            if (activeBtn) activeBtn.innerText = `📄 ${slide.title}`;
        }
    };
    window.resetBiroOffice = () => {
        const ok = confirm("BiroOffice içeriği sıfırlansın mı?");
        if (!ok) return;
        biroOfficeState = createDefaultBiroOfficeState();
        saveBiroOfficeState();
        renderBiroOffice();
    };
    const renderBiroSlideShow = () => {
        const slides = biroOfficeState.slides || [];
        if (!slides.length) return;
        const safeIndex = Math.min(Math.max(0, biroSlideShowIndex), slides.length - 1);
        biroSlideShowIndex = safeIndex;
        const current = slides[safeIndex] || { title: "", body: "" };

        const counterEl = document.getElementById("boShowCounter");
        const titleEl = document.getElementById("boShowTitle");
        const bodyEl = document.getElementById("boShowBody");
        if (counterEl) counterEl.innerText = `${safeIndex + 1} / ${slides.length}`;
        if (titleEl) titleEl.innerText = current.title || `Sunum ${safeIndex + 1}`;
        if (bodyEl) bodyEl.innerText = current.body || "";
    };
    const handleBiroSlideShowKeys = (e) => {
        if (!biroSlideShowOpen) return;
        if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
            e.preventDefault();
            window.nextBiroSlideShow();
            return;
        }
        if (e.key === "ArrowLeft" || e.key === "PageUp") {
            e.preventDefault();
            window.prevBiroSlideShow();
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            window.closeBiroSlideShow();
        }
    };
    window.openBiroSlideShow = () => {
        if (!biroOfficeState.slides?.length) {
            alert("Sunum için en az bir slayt olmalı.");
            return;
        }
        const root = document.getElementById("biroSlideShow");
        if (!root) return;
        biroSlideShowOpen = true;
        biroSlideShowIndex = Math.min(
            Math.max(0, biroOfficeState.activeSlide || 0),
            biroOfficeState.slides.length - 1
        );
        root.style.display = "flex";
        renderBiroSlideShow();
        document.addEventListener("keydown", handleBiroSlideShowKeys);
        if (root.requestFullscreen) {
            const req = root.requestFullscreen();
            if (req && typeof req.catch === "function") req.catch(() => {});
        }
    };
    window.closeBiroSlideShow = () => {
        const root = document.getElementById("biroSlideShow");
        if (!root) return;
        biroSlideShowOpen = false;
        root.style.display = "none";
        document.removeEventListener("keydown", handleBiroSlideShowKeys);
        biroOfficeState.activeSlide = biroSlideShowIndex;
        saveBiroOfficeState();
        if (document.fullscreenElement) {
            const ext = document.exitFullscreen();
            if (ext && typeof ext.catch === "function") ext.catch(() => {});
        }
        if (biroOfficeState.activeApp === "slides") {
            renderSlidesApp();
        }
    };
    window.nextBiroSlideShow = () => {
        const max = (biroOfficeState.slides?.length || 1) - 1;
        biroSlideShowIndex = Math.min(max, biroSlideShowIndex + 1);
        renderBiroSlideShow();
    };
    window.prevBiroSlideShow = () => {
        biroSlideShowIndex = Math.max(0, biroSlideShowIndex - 1);
        renderBiroSlideShow();
    };
    document.addEventListener("fullscreenchange", () => {
        if (!biroSlideShowOpen) return;
        if (!document.fullscreenElement) {
            window.closeBiroSlideShow();
        }
    });

    const gameModes = {
        vampirkoylu: {
            title: "Vampir Köylü",
            timer: 40 * 60,
            preview: "NAPİM",
            topBg: "#c8c8c8"
        },
        sehircilik: {
            title: "Şehircilik",
            timer: 40 * 60,
            preview: "6B BULDU",
            topBg: "#d3cec1"
        }
    };

    let activeGameMode = "vampirkoylu";
    let gameSecondsLeft = gameModes[activeGameMode].timer;
    let gameTimerInterval = null;
    let gameBoardRenderedFor = "";
    let vampirRoleResult = [];
    let sehircilikUnsubs = [];
    let sehircilikRowsBySource = {};
    let sehircilikReady = false;

    const formatGameTime = (seconds) => {
        const safe = Math.max(0, seconds || 0);
        const m = Math.floor(safe / 60).toString().padStart(2, "0");
        const s = (safe % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };
    const formatMoney = (value) => `₺${(Number(value) || 0).toLocaleString("tr-TR")}`;
    const normalizeToken = (value) => (value || "").toString().toUpperCase().replace(/[^0-9A-ZÇĞİÖŞÜ]/g, "");
    const getCurrentClassInfo = () => {
        const cClass = (localStorage.getItem("myClass") || "").toUpperCase();
        return {
            full: cClass,
            fullNorm: normalizeToken(cClass),
            number: parseInt(cClass.charAt(0), 10),
            section: cClass.charAt(1)
        };
    };
    const shuffleArray = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };
    const readNumericValue = (obj, keys) => {
        for (const key of keys) {
            if (obj?.[key] === undefined || obj?.[key] === null) continue;
            const raw = obj[key];
            if (typeof raw === "number" && Number.isFinite(raw)) return raw;
            const normalized = String(raw).replace(/\./g, "").replace(",", ".").replace(/[^0-9.-]/g, "");
            const parsed = Number(normalized);
            if (Number.isFinite(parsed)) return parsed;
        }
        return 0;
    };
    const pickFirst = (obj, keys) => {
        for (const key of keys) {
            const value = obj?.[key];
            if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
        }
        return "";
    };
    const classMatches = (data, classInfo) => {
        if (!classInfo.full) return true;
        const dataClass = normalizeToken(pickFirst(data, ["className", "class", "classId", "classCode"]));
        const dataSection = normalizeToken(pickFirst(data, ["classSection", "section", "sube", "sinifSube"]));
        const dataNumber = readNumericValue(data, ["classNumber", "grade", "sinif", "sinifNo"]);

        if (dataClass) return dataClass === classInfo.fullNorm;
        if (dataSection && dataNumber) return dataSection === normalizeToken(classInfo.section) && dataNumber === classInfo.number;
        if (dataNumber) return dataNumber === classInfo.number;
        return false;
    };
    const mapCityRow = (docSnap, classInfo) => {
        const data = docSnap.data() || {};
        if (!classMatches(data, classInfo)) return null;
        const name = pickFirst(data, [
            "name", "studentName", "playerName", "fullName", "displayName", "username", "nick", "isim", "adSoyad", "ad"
        ]) || `Kişi ${docSnap.id.slice(0, 5)}`;
        const money = readNumericValue(data, ["money", "balance", "coins", "coin", "gold", "cash", "para", "wallet", "wealth"]);
        return {
            id: docSnap.id,
            name,
            money
        };
    };
    const getMergedSehircilikRows = () => {
        const merged = new Map();
        Object.values(sehircilikRowsBySource).forEach((rows) => {
            rows.forEach((row) => {
                const key = normalizeToken(row.name) || row.id;
                const existing = merged.get(key);
                if (!existing || row.money > existing.money) merged.set(key, row);
            });
        });
        return [...merged.values()].sort((a, b) => b.money - a.money);
    };
    const stopSehircilikListeners = () => {
        sehircilikUnsubs.forEach((unsub) => {
            if (typeof unsub === "function") unsub();
        });
        sehircilikUnsubs = [];
        sehircilikRowsBySource = {};
        sehircilikReady = false;
    };
    const renderVampirRoleResult = () => {
        const holder = document.getElementById("vkResult");
        if (!holder) return;
        if (!vampirRoleResult.length) {
            holder.innerHTML = `<div style="font-size:0.78rem; opacity:0.75;">Henüz rol dağıtılmadı.</div>`;
            return;
        }
        holder.innerHTML = vampirRoleResult.map((item) => {
            const cls = item.role === "Vampir" ? "vk-role-vampir" : item.role === "Doktor" ? "vk-role-doktor" : "vk-role-koylu";
            return `<div class="vk-role ${cls}">
                        <div>${item.player}</div>
                        <span class="vk-role-title">${item.role}</span>
                    </div>`;
        }).join("");
    };
    const renderVampirKoyluBoard = () => {
        const bottomEl = document.getElementById("gameModeBottom");
        if (!bottomEl) return;
        bottomEl.innerHTML = `
            <div class="game-board-shell">
                <p class="game-board-head">Vampir ve doktor sayısını sen belirle, sistem rastgele rol dağıtsın.</p>
                <div class="vk-controls">
                    <div class="vk-field">
                        <label>Kişi Sayısı</label>
                        <input id="vkPeopleCount" type="number" min="4" max="80" value="12">
                    </div>
                    <div class="vk-field">
                        <label>Vampir Sayısı</label>
                        <input id="vkVampireCount" type="number" min="1" max="20" value="2">
                    </div>
                    <div class="vk-field">
                        <label>Doktor Sayısı</label>
                        <input id="vkDoctorCount" type="number" min="0" max="20" value="1">
                    </div>
                </div>
                <div class="vk-actions">
                    <button onclick="generateVampirRoles()">RASTGELE DAĞIT</button>
                    <button onclick="clearVampirRoles()" style="background:#475569;">TEMİZLE</button>
                </div>
                <div id="vkResult" class="vk-grid"></div>
            </div>
        `;
        renderVampirRoleResult();
    };
    const renderSehircilikBoard = () => {
        const bottomEl = document.getElementById("gameModeBottom");
        if (!bottomEl) return;
        const classInfo = getCurrentClassInfo();
        bottomEl.innerHTML = `
            <div class="game-board-shell">
                <p class="game-board-head">Şehircilik ekonomisi sınıf bazlı canlı takip ekranı</p>
                <div class="city-overview">
                    <div class="city-card">
                        <small>SINIF</small>
                        <div id="cityClassLabel">${classInfo.full || "--"}</div>
                    </div>
                    <div class="city-card">
                        <small>EN ZENGİN</small>
                        <div id="cityRichName" class="city-rich-name">Yükleniyor...</div>
                        <div id="cityRichMoney" class="city-rich-money">--</div>
                    </div>
                    <div class="city-card">
                        <small>DURUM</small>
                        <div id="cityStatus">${sehircilikReady ? "Canlı veri bağlı" : "Firebase dinleniyor..."}</div>
                        <div id="cityCount" class="game-note">Kayıt: 0</div>
                    </div>
                </div>
                <div id="cityList" class="city-list">
                    <div class="city-row"><span>Veri bekleniyor...</span></div>
                </div>
                <div class="game-note">Not: Veriler cityEconomy, cityPlayers, sehircilikEconomy, sehircilikPlayers koleksiyonlarından okunur.</div>
            </div>
        `;
        refreshSehircilikBoard();
        startSehircilikListeners();
    };
    const renderDefaultBoard = () => {
        const bottomEl = document.getElementById("gameModeBottom");
        if (!bottomEl) return;
        bottomEl.innerHTML = `<div class="game-board-shell" style="font-size:1rem; opacity:0.85;">OYUNLA İLGİLİ ALAN</div>`;
    };
    const refreshSehircilikBoard = () => {
        const listEl = document.getElementById("cityList");
        const richNameEl = document.getElementById("cityRichName");
        const richMoneyEl = document.getElementById("cityRichMoney");
        const countEl = document.getElementById("cityCount");
        const statusEl = document.getElementById("cityStatus");
        if (!listEl || !richNameEl || !richMoneyEl) return;

        const rows = getMergedSehircilikRows();
        if (countEl) countEl.innerText = `Kayıt: ${rows.length}`;
        if (statusEl) statusEl.innerText = sehircilikReady ? "Canlı veri bağlı" : "Firebase dinleniyor...";

        if (!rows.length) {
            richNameEl.innerText = "Kayıt bulunamadı";
            richMoneyEl.innerText = "--";
            listEl.innerHTML = `<div class="city-row"><span>Bu sınıfa ait para verisi henüz yok.</span></div>`;
            return;
        }

        const richest = rows[0];
        richNameEl.innerText = richest.name;
        richMoneyEl.innerText = formatMoney(richest.money);

        listEl.innerHTML = rows.map((row, idx) => `
            <div class="city-row">
                <span class="city-rank">#${idx + 1}</span>
                <span style="flex:1;">${row.name}</span>
                <span class="city-money">${formatMoney(row.money)}</span>
            </div>
        `).join("");
    };
    const startSehircilikListeners = () => {
        if (sehircilikUnsubs.length) return;
        const gameModalVisible = document.getElementById("gameModeModal")?.style.display === "block";
        if (!gameModalVisible) return;
        const classInfo = getCurrentClassInfo();
        if (!classInfo.full) return;

        const collectionsToWatch = ["cityEconomy", "cityPlayers", "sehircilikEconomy", "sehircilikPlayers"];
        const queryDefs = [
            { field: "className", value: classInfo.full },
            { field: "class", value: classInfo.full },
            { field: "classNumber", value: classInfo.number },
            { field: "classNumber", value: String(classInfo.number) }
        ].filter((item) => item.value !== "" && item.value !== undefined && item.value !== null && !Number.isNaN(item.value));

        collectionsToWatch.forEach((colName) => {
            queryDefs.forEach((qDef) => {
                const sourceKey = `${colName}:${qDef.field}:${qDef.value}`;
                const qRef = query(collection(db, colName), where(qDef.field, "==", qDef.value));
                const unsub = onSnapshot(qRef, (snap) => {
                    const mapped = [];
                    snap.forEach((docSnap) => {
                        const row = mapCityRow(docSnap, classInfo);
                        if (row) mapped.push(row);
                    });
                    sehircilikRowsBySource[sourceKey] = mapped;
                    sehircilikReady = true;
                    refreshSehircilikBoard();
                }, () => {
                    sehircilikRowsBySource[sourceKey] = [];
                    refreshSehircilikBoard();
                });
                sehircilikUnsubs.push(unsub);
            });
        });
    };
    const renderGameBoard = () => {
        if (activeGameMode === "vampirkoylu") {
            stopSehircilikListeners();
            renderVampirKoyluBoard();
            return;
        }
        if (activeGameMode === "sehircilik") {
            renderSehircilikBoard();
            return;
        }
        stopSehircilikListeners();
        renderDefaultBoard();
    };

    window.generateVampirRoles = () => {
        const peopleCount = parseInt(document.getElementById("vkPeopleCount")?.value, 10) || 0;
        const vampirCount = parseInt(document.getElementById("vkVampireCount")?.value, 10) || 0;
        const doktorCount = parseInt(document.getElementById("vkDoctorCount")?.value, 10) || 0;

        const resultHolder = document.getElementById("vkResult");
        if (!resultHolder) return;

        if (peopleCount < 4) {
            resultHolder.innerHTML = `<div style="font-size:0.78rem; color:#fca5a5;">Kişi sayısı en az 4 olmalı.</div>`;
            return;
        }
        if (vampirCount < 1) {
            resultHolder.innerHTML = `<div style="font-size:0.78rem; color:#fca5a5;">En az 1 vampir olmalı.</div>`;
            return;
        }
        if (vampirCount + doktorCount >= peopleCount) {
            resultHolder.innerHTML = `<div style="font-size:0.78rem; color:#fca5a5;">Vampir + doktor toplamı kişi sayısından küçük olmalı.</div>`;
            return;
        }

        const roles = [];
        for (let i = 0; i < vampirCount; i++) roles.push("Vampir");
        for (let i = 0; i < doktorCount; i++) roles.push("Doktor");
        while (roles.length < peopleCount) roles.push("Köylü");

        const mixedRoles = shuffleArray(roles);
        const people = Array.from({ length: peopleCount }, (_, i) => `Kişi ${i + 1}`);

        vampirRoleResult = people.map((person, idx) => ({
            player: person,
            role: mixedRoles[idx]
        }));
        renderVampirRoleResult();
    };
    window.clearVampirRoles = () => {
        vampirRoleResult = [];
        renderVampirRoleResult();
    };

    const renderGameModes = () => {
        const list = document.getElementById("gameModeList");
        if (!list) return;
        list.innerHTML = Object.entries(gameModes).map(([key, mode]) => {
            const activeClass = key === activeGameMode ? "active" : "";
            return `<button class="game-option ${activeClass}" onclick="selectGameMode('${key}')">
                        <div style="font-weight:700; font-size:0.95rem;">${mode.title}</div>
                        <div style="font-size:0.78rem; opacity:0.8; margin-top:4px;">Varsayılan süre: ${formatGameTime(mode.timer)}</div>
                    </button>`;
        }).join("");

        const summary = document.getElementById("selectedGameSummary");
        if (summary) {
            const mode = gameModes[activeGameMode];
            summary.innerText = `${mode.title} (${formatGameTime(mode.timer)})`;
        }
    };

    const updateGameScreen = () => {
        const mode = gameModes[activeGameMode];
        if (!mode) return;

        const titleEl = document.getElementById("gameModeTitle");
        const timerEl = document.getElementById("gameTimerDisplay");
        const previewEl = document.getElementById("gameModePreview");
        const topEl = document.getElementById("gameModeTop");
        const toggleBtn = document.getElementById("gameTimerToggleBtn");

        if (titleEl) titleEl.innerText = mode.title;
        if (timerEl) timerEl.innerText = formatGameTime(gameSecondsLeft);
        if (previewEl) previewEl.innerText = mode.preview;
        if (topEl) topEl.style.background = mode.topBg;
        if (toggleBtn) toggleBtn.innerText = gameTimerInterval ? "DURDUR" : "BAŞLAT";
        if (gameBoardRenderedFor !== activeGameMode) {
            renderGameBoard();
            gameBoardRenderedFor = activeGameMode;
        } else if (activeGameMode === "sehircilik") {
            refreshSehircilikBoard();
            if (!sehircilikUnsubs.length) startSehircilikListeners();
        }
    };

    window.selectGameMode = (modeKey) => {
        if (!gameModes[modeKey]) return;
        activeGameMode = modeKey;
        gameBoardRenderedFor = "";
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
        gameSecondsLeft = gameModes[modeKey].timer;
        renderGameModes();
        updateGameScreen();
    };

    window.openGameMode = () => {
        closeModal("gameSelectModal");
        openModal("gameModeModal");
        updateGameScreen();
    };

    window.toggleGameTimer = () => {
        const toggleBtn = document.getElementById("gameTimerToggleBtn");
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
            gameTimerInterval = null;
            if (toggleBtn) toggleBtn.innerText = "BAŞLAT";
            return;
        }

        if (gameSecondsLeft <= 0) {
            gameSecondsLeft = gameModes[activeGameMode].timer;
        }

        if (toggleBtn) toggleBtn.innerText = "DURDUR";
        gameTimerInterval = setInterval(() => {
            gameSecondsLeft -= 1;
            updateGameScreen();

            if (gameSecondsLeft <= 0) {
                clearInterval(gameTimerInterval);
                gameTimerInterval = null;
                gameSecondsLeft = 0;
                updateGameScreen();
                if (typeof window.playChime === "function") window.playChime();
            }
        }, 1000);
    };

    window.resetGameTimer = () => {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
        gameSecondsLeft = gameModes[activeGameMode].timer;
        updateGameScreen();
    };

    window.closeGameMode = () => {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
        stopSehircilikListeners();
        const modalEl = document.getElementById("gameModeModal");
        if (modalEl) modalEl.style.display = "none";
        const toggleBtn = document.getElementById("gameTimerToggleBtn");
        if (toggleBtn) toggleBtn.innerText = "BAŞLAT";
    };

    const origOpenModal = (id) => document.getElementById(id).style.display = 'block';
    window.openModal = (id) => {
        if (id !== "settingsModal" && modalSettingMap[id] && !uiSettings[modalSettingMap[id]]) {
            return;
        }
        if (id === "settingsModal") {
            renderUiSettingsForm();
            syncPanelDesignControls();
            if (typeof renderPanelStyleForm === "function") renderPanelStyleForm();
        }
        origOpenModal(id);
        if(id === 'paintModal') {
            setTimeout(() => {
                const canvas = document.getElementById('paintCanvas');
                if(canvas) {
                    ctx = canvas.getContext('2d');
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight || 400;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }, 50);
        }
        if (id === 'themeModal') {
            renderThemeMenu();
        }
        if (id === 'themeCreatorModal') {
            setThemeCreatorStatus("Kaydettiğin tema listede görünecek.");
        }
        if (id === 'gameSelectModal') {
            renderGameModes();
        }
        if (id === 'gameModeModal') {
            updateGameScreen();
        }
        if (id === 'officeModal') {
            renderBiroOffice();
        }
    };
    window.closeModal = (id) => {
        if (id === "gameModeModal") {
            closeGameMode();
            return;
        }
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    };
    
    window.toggleTheme = () => {
        const current = localStorage.getItem("panelTheme") || 'dark';
        const safeIndex = themeNames.includes(current) ? themeNames.indexOf(current) : 0;
        const next = themeNames[(safeIndex + 1) % themeNames.length];
        applyTheme(next);
    };

    window.toggleFullScreen = () => {
        const runRelayout = () => {
            const grid = getDashboardGrid();
            if (grid) {
                if (document.fullscreenElement) {
                    // In fullscreen mode
                    grid.style.height = "100vh";
                    grid.style.padding = `${getDashboardPaddingValue()}px`;
                    grid.style.overflow = "auto";
                } else {
                    // Normal mode
                    grid.style.height = `calc(100vh - ${getDashboardViewportOffset()}px)`;
                    grid.style.padding = `${getDashboardPaddingValue()}px`;
                    grid.style.overflow = "auto";
                }
            }
            if (typeof handleDashboardViewportChange === "function") {
                setTimeout(() => handleDashboardViewportChange(), 80);
                setTimeout(() => handleDashboardViewportChange(), 200);
                setTimeout(() => handleDashboardViewportChange(), 420);
            }
        };
        if (!document.fullscreenElement) {
            const req = document.documentElement.requestFullscreen?.();
            if (req && typeof req.then === "function") req.then(runRelayout).catch(() => {});
            else runRelayout();
        } else {
            const ext = document.exitFullscreen?.();
            if (ext && typeof ext.then === "function") ext.then(runRelayout).catch(() => {});
            else runRelayout();
        }
    };

    let swInterval, swSeconds = 0;
    window.toggleStopwatch = () => {
        const btn = document.getElementById('swBtn');
        if (swInterval) { clearInterval(swInterval); swInterval = null; btn.innerText = "DEVAM ET"; }
        else {
            swInterval = setInterval(() => {
                swSeconds++;
                const m = Math.floor(swSeconds/60).toString().padStart(2,'0');
                const s = (swSeconds%60).toString().padStart(2,'0');
                document.getElementById('stopwatchDisplay').innerText = `${m}:${s}`;
            }, 1000);
            btn.innerText = "DURDUR";
        }
    };
    window.resetStopwatch = () => {
        clearInterval(swInterval); swInterval = null; swSeconds = 0;
        document.getElementById('stopwatchDisplay').innerText = "00:00";
        document.getElementById('swBtn').innerText = "BAŞLAT";
    };

    window.playChime = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
        osc.start(); osc.stop(audioCtx.currentTime + 1);
    };

    window.generateGroups = () => {
        const total = parseInt(document.getElementById('groupTotal').value) || 30;
        const groupSize = parseInt(document.getElementById('groupSize').value) || 5;
        const resultDiv = document.getElementById('groupResult');

        if (groupSize > total) {
            resultDiv.innerHTML = '<div style="color:#ef4444;">❌ Grup büyüklüğü mevcuddan fazla olamaz!</div>';
            return;
        }

        const students = Array.from({length: total}, (_, i) => i + 1);
        
        for (let i = students.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [students[i], students[j]] = [students[j], students[i]];
        }

        const groups = [];
        for (let i = 0; i < students.length; i += groupSize) {
            groups.push(students.slice(i, i + groupSize));
        }

        let html = '';
        groups.forEach((group, idx) => {
            html += `<div style="background:rgba(56,189,248,0.15); padding:8px; border-radius:8px; margin-bottom:8px; border-left:4px solid var(--accent);">
                        <strong>Grup ${idx + 1}:</strong> ${group.join(', ')}
                     </div>`;
        });
        
        resultDiv.innerHTML = html;
    };

    let isDrawing = false;
    let ctx = null;

    setTimeout(() => {
        const canvas = document.getElementById('paintCanvas');
        if(!canvas) return;

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });

        canvas.addEventListener('mousemove', (e) => {
            if(!isDrawing || !ctx) return;
            const rect = canvas.getBoundingClientRect();
            ctx.strokeStyle = document.getElementById('paintColor').value;
            ctx.lineWidth = document.getElementById('paintSize').value;
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        });

        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('mouseout', () => { isDrawing = false; });

        document.getElementById('paintSize').addEventListener('input', (e) => {
            document.getElementById('sizeDisplay').innerText = e.target.value;
        });
    }, 100);

    window.clearPaint = () => {
        const canvas = document.getElementById('paintCanvas');
        if(canvas && ctx) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    window.toggleTheater = () => {
        const o = document.getElementById('theaterOverlay');
        o.style.display = (o.style.display === 'none') ? 'block' : 'none';
    };

    document.getElementById('focusMode').style.display = 'none';
    
    let focusActive = false;
    let focusInterval = null;
    let ambientOsc = null;

    const handleFocusEsc = (e) => {
        if (e.key === 'Escape' && focusActive) toggleFocusMode();
    };

    window.toggleFocusMode = () => {
        const focusDiv = document.getElementById('focusMode');
        focusActive = !focusActive;

        if (focusActive) {
            focusDiv.style.display = 'flex';
            startAmbientSound();
            updateFocusClock();
            focusInterval = setInterval(updateFocusClock, 1000);
            document.addEventListener('keydown', handleFocusEsc);
        } else {
            focusDiv.style.display = 'none';
            stopAmbientSound();
            clearInterval(focusInterval);
            document.removeEventListener('keydown', handleFocusEsc);
        }
    };

    const updateFocusClock = () => {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
        document.getElementById('focusClock').innerText = timeStr;
    };

    const startAmbientSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            
            const bufferSize = audioCtx.sampleRate * 2;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noiseSource = audioCtx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            
            const noiseGain = audioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, audioCtx.currentTime);
            filter.Q.setValueAtTime(0.5, audioCtx.currentTime);
            
            noiseSource.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);
            noiseSource.start(0);
            
     
            const bass = audioCtx.createOscillator();
            const bassGain = audioCtx.createGain();
            bass.type = 'sine';
            bass.frequency.setValueAtTime(40, audioCtx.currentTime);
            bassGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
            
            bass.connect(bassGain);
            bassGain.connect(audioCtx.destination);
            bass.start();
            
            ambientOsc = { noiseSource, bass, audioCtx, noiseGain, bassGain };
        } catch(e) {
            console.log('Ambient sound error:', e);
        }
    };

    const stopAmbientSound = () => {
        if (ambientOsc) {
            try {
                if (ambientOsc.noiseSource) ambientOsc.noiseSource.stop();
                if (ambientOsc.bass) ambientOsc.bass.stop();
            } catch(e) {}
            ambientOsc = null;
        }
    };


    const startBtn = document.getElementById('startBtn');
    if(startBtn) startBtn.onclick = window.finishSetup;
    applyThemeMenuProfile(localStorage.getItem("panelTheme") || "dark", { persistUi: false, reapplyUi: false });
    renderThemeMenu();
    initDashboardWidgets();
    initEditModeHudDrag();
    applyUiSettings();
    renderGameModes();
    updateGameScreen();

    async function getWeather() {
        try {
            const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.89&longitude=32.99&current_weather=true");
            const d = await r.json();
            document.getElementById("wTemp").innerText = Math.round(d.current_weather.temperature) + "°C";
            const icons = { 0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 61: "🌧️", 95: "⛈️" };
            document.getElementById("wIcon").innerText = icons[d.current_weather.weathercode] || "⛅";
        } catch(e) {}
    }
