import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    collection,
    deleteDoc,
    doc,
    getFirestore,
    onSnapshot,
    query,
    setDoc,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { schoolData } from "./data.js";

const STORAGE_KEY = "biroor_auth_user_v2";
const CLASS_KEY = "myClass";
const AUTH_PAGE_PATH = "../biroor/auth.html";
const DAILY_NOTE_COLLECTION = "classDailyNotes";
const STUDENT_CHECKIN_COLLECTION = "studentCheckins";

const firebaseConfig = { projectId: "birooretap" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const classIds = Object.keys(schoolData).sort((a, b) => {
    const gradeA = Number.parseInt(a, 10);
    const gradeB = Number.parseInt(b, 10);
    if (gradeA !== gradeB) return gradeA - gradeB;
    return a.localeCompare(b, "tr");
});

const els = {
    gateView: document.getElementById("gateView"),
    dashboardView: document.getElementById("dashboardView"),
    gateMessage: document.getElementById("gateMessage"),
    gateStatus: document.getElementById("gateStatus"),
    gateRefreshButton: document.getElementById("gateRefreshButton"),
    teacherUserSummary: document.getElementById("teacherUserSummary"),
    teacherLogoutButton: document.getElementById("teacherLogoutButton"),
    teacherClassSelect: document.getElementById("teacherClassSelect"),
    teacherClassLabel: document.getElementById("teacherClassLabel"),
    teacherStudentCount: document.getElementById("teacherStudentCount"),
    teacherHomeworkCount: document.getElementById("teacherHomeworkCount"),
    teacherDailyUpdated: document.getElementById("teacherDailyUpdated"),
    teacherTodayInput: document.getElementById("teacherTodayInput"),
    teacherTodayStatus: document.getElementById("teacherTodayStatus"),
    saveDailyNoteButton: document.getElementById("saveDailyNoteButton"),
    teacherDailyMeta: document.getElementById("teacherDailyMeta"),
    teacherDailyPreview: document.getElementById("teacherDailyPreview"),
    teacherStudentMeta: document.getElementById("teacherStudentMeta"),
    teacherStudentList: document.getElementById("teacherStudentList"),
    teacherHomeworkList: document.getElementById("teacherHomeworkList")
};

let currentUser = null;
let activeClassId = localStorage.getItem(CLASS_KEY) || classIds[0];
let noteUnsubscribe = null;
let studentUnsubscribe = null;
let homeworkUnsubscribe = null;

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function restoreUser() {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
            localStorage.setItem(STORAGE_KEY, raw);
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (_) {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    currentUser = null;
}

function showGateView() {
    els.gateView?.classList.remove("hidden");
    els.dashboardView?.classList.add("hidden");
}

function showDashboardView() {
    els.gateView?.classList.add("hidden");
    els.dashboardView?.classList.remove("hidden");
}

function setGateStatus(message) {
    if (els.gateStatus) {
        els.gateStatus.innerHTML = message;
    }
}

function setDailyStatus(message, isOk = false) {
    if (!els.teacherTodayStatus) return;
    els.teacherTodayStatus.textContent = message;
    els.teacherTodayStatus.style.color = isOk ? "#15803d" : "#64748b";
}

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

function formatClassLabel(classId) {
    return `${classId.charAt(0)}-${classId.slice(1)}`;
}

function toDateObject(rawValue) {
    if (!rawValue) return null;
    if (rawValue instanceof Date) return rawValue;
    if (typeof rawValue.toDate === "function") return rawValue.toDate();
    return null;
}

function formatTimestampLabel(rawValue) {
    const date = toDateObject(rawValue);
    if (!date) return "Bekleniyor";
    return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function sortTimestampDesc(a, b) {
    const aDate = toDateObject(a?.createdAt)?.getTime() || 0;
    const bDate = toDateObject(b?.createdAt)?.getTime() || 0;
    return bDate - aDate;
}

function setTeacherUserSummary(user) {
    if (!els.teacherUserSummary) return;
    if (!user) {
        els.teacherUserSummary.textContent = "Oturum kapali";
        return;
    }
    const name = user.name || "Kullanici";
    const email = user.email || "";
    els.teacherUserSummary.textContent = email ? `${name} | ${email}` : name;
}

function renderDailyNote(payload = null) {
    const text = (payload?.text || "").toString().trim();
    if (els.teacherDailyPreview) {
        els.teacherDailyPreview.textContent = text || "Bugun icin paylasilan ders ozeti henuz yok.";
    }
    if (els.teacherDailyMeta) {
        els.teacherDailyMeta.textContent = text ? `Son guncelleme: ${formatTimestampLabel(payload?.updatedAt)}` : "Canli";
    }
    if (els.teacherDailyUpdated) {
        els.teacherDailyUpdated.textContent = text ? formatTimestampLabel(payload?.updatedAt) : "Bekleniyor";
    }
    if (els.teacherTodayInput && document.activeElement !== els.teacherTodayInput) {
        els.teacherTodayInput.value = text;
    }
}

function renderStudentList(items = []) {
    if (els.teacherStudentCount) els.teacherStudentCount.textContent = String(items.length);
    if (els.teacherStudentMeta) {
        els.teacherStudentMeta.textContent = items.length ? `${items.length} kayit` : "0 kayit";
    }
    if (!els.teacherStudentList) return;

    if (!items.length) {
        els.teacherStudentList.innerHTML = "<div class=\"teacher-empty\">Telefondan isim giren ogrenci henuz yok.</div>";
        return;
    }

    els.teacherStudentList.innerHTML = items.map((item) => `
        <article class="teacher-list-item">
            <div class="teacher-list-row">
                <div>
                    <strong>${escapeHtml(item.studentName || "Isimsiz giris")}</strong>
                    <div class="teacher-list-time">${formatTimestampLabel(item.createdAt)}</div>
                </div>
                <button class="teacher-delete-btn" type="button" data-action="delete-student" data-id="${escapeHtml(item.id)}">Sil</button>
            </div>
        </article>
    `).join("");
}

function renderHomeworkList(items = []) {
    if (els.teacherHomeworkCount) els.teacherHomeworkCount.textContent = String(items.length);
    if (!els.teacherHomeworkList) return;

    if (!items.length) {
        els.teacherHomeworkList.innerHTML = "<div class=\"teacher-empty\">Bu sinif icin kayitli odev gorunmuyor.</div>";
        return;
    }

    els.teacherHomeworkList.innerHTML = items.map((item) => `
        <article class="teacher-list-item">
            <strong>${escapeHtml(item.title || "Odev")}</strong>
            <p>${escapeHtml(item.desc || "Detay eklenmedi.")}</p>
        </article>
    `).join("");
}

function populateClasses() {
    if (!els.teacherClassSelect) return;
    els.teacherClassSelect.innerHTML = classIds.map((classId) => `
        <option value="${classId}" ${classId === activeClassId ? "selected" : ""}>${formatClassLabel(classId)}</option>
    `).join("");
}

function cleanupTeacherSubscriptions() {
    if (typeof noteUnsubscribe === "function") noteUnsubscribe();
    if (typeof studentUnsubscribe === "function") studentUnsubscribe();
    if (typeof homeworkUnsubscribe === "function") homeworkUnsubscribe();
    noteUnsubscribe = null;
    studentUnsubscribe = null;
    homeworkUnsubscribe = null;
}

function loadTeacherClass(classId) {
    activeClassId = classId;
    localStorage.setItem(CLASS_KEY, classId);

    if (els.teacherClassLabel) els.teacherClassLabel.textContent = classId;
    renderDailyNote(null);
    renderStudentList([]);
    renderHomeworkList([]);
    setDailyStatus("Kaydettigin not etahta ve telefonda canli gorunur.");

    cleanupTeacherSubscriptions();

    noteUnsubscribe = onSnapshot(
        doc(db, DAILY_NOTE_COLLECTION, getDailyNoteDocId(classId)),
        (docSnap) => renderDailyNote(docSnap.exists() ? docSnap.data() : null),
        () => renderDailyNote(null)
    );

    studentUnsubscribe = onSnapshot(
        query(
            collection(db, STUDENT_CHECKIN_COLLECTION),
            where("classId", "==", classId),
            where("dateKey", "==", getTodayKey())
        ),
        (snap) => {
            const items = [];
            snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() }));
            renderStudentList(items.sort(sortTimestampDesc));
        },
        () => renderStudentList([])
    );

    homeworkUnsubscribe = onSnapshot(
        query(
            collection(db, "homeworks"),
            where("classNumber", "==", Number.parseInt(classId.charAt(0), 10)),
            where("classSection", "==", classId.charAt(1))
        ),
        (snap) => {
            const items = [];
            snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() }));
            renderHomeworkList(items);
        },
        () => renderHomeworkList([])
    );
}

async function saveDailyNote() {
    const noteText = (els.teacherTodayInput?.value || "").trim();
    try {
        await setDoc(doc(db, DAILY_NOTE_COLLECTION, getDailyNoteDocId(activeClassId)), {
            classId: activeClassId,
            dateKey: getTodayKey(),
            text: noteText,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser?.email || currentUser?.name || "teacher-panel"
        }, { merge: true });
        setDailyStatus("Gunluk ders notu kaydedildi ve yayinlandi.", true);
    } catch (_) {
        setDailyStatus("Gunluk ders notu kaydedilemedi.");
    }
}

async function deleteStudentEntry(id) {
    const approved = window.confirm("Bu ogrenci girisini silmek istiyor musun?");
    if (!approved) return;
    try {
        await deleteDoc(doc(db, STUDENT_CHECKIN_COLLECTION, id));
    } catch (_) {
        setDailyStatus("Ogrenci girisi silinemedi.");
    }
}

function bootTeacherDashboard(user) {
    currentUser = user;
    showDashboardView();
    setTeacherUserSummary(user);
    populateClasses();
    loadTeacherClass(activeClassId);
}

function ensureUserState() {
    const restored = restoreUser();
    if (!restored) {
        currentUser = null;
        cleanupTeacherSubscriptions();
        showGateView();
        if (els.gateMessage) {
            els.gateMessage.textContent = "Kayitli kullanici bulunamadi. Ana sistemde oturum actiginda bu sayfa ayni tarayicida otomatik hazir olur.";
        }
        setGateStatus(`Bekleniyor: <code>${STORAGE_KEY}</code> | <a href="${AUTH_PAGE_PATH}" target="_blank" rel="noopener noreferrer">auth.html ac</a>`);
        return false;
    }

    if (els.gateMessage) {
        const name = restored.name || "Kullanici";
        els.gateMessage.textContent = `${name} icin ana sistem oturumu bulundu. Ogretmen paneli aciliyor.`;
    }
    setGateStatus(`Oturum bulundu: <code>${escapeHtml(restored.email || restored.name || "aktif kullanici")}</code>`);
    bootTeacherDashboard(restored);
    return true;
}

function performLogout() {
    cleanupTeacherSubscriptions();
    clearUser();
    showGateView();
    if (els.gateMessage) {
        els.gateMessage.textContent = "Oturum kapatildi. Tekrar kullanmak icin auth.html uzerinden giris yap.";
    }
    setGateStatus(`Oturum kapatildi | <a href="${AUTH_PAGE_PATH}" target="_blank" rel="noopener noreferrer">auth.html ac</a>`);
}

function bindEvents() {
    els.gateRefreshButton?.addEventListener("click", () => {
        ensureUserState();
    });

    els.teacherLogoutButton?.addEventListener("click", performLogout);
    els.teacherClassSelect?.addEventListener("change", (event) => {
        loadTeacherClass(event.target.value);
    });
    els.saveDailyNoteButton?.addEventListener("click", saveDailyNote);
    els.teacherStudentList?.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-action='delete-student']");
        if (!trigger) return;
        deleteStudentEntry(trigger.dataset.id);
    });

    window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY) {
            ensureUserState();
        }
        if (event.key === CLASS_KEY && event.newValue && event.newValue !== activeClassId && currentUser) {
            activeClassId = event.newValue;
            populateClasses();
            loadTeacherClass(activeClassId);
        }
    });
}

function init() {
    bindEvents();
    ensureUserState();
}

init();
