import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    addDoc,
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
import { schoolData, lessonHours, lessonIcons } from "./data.js";

const firebaseConfig = { projectId: "birooretap" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const classIds = Object.keys(schoolData).sort((a, b) => {
    const gradeA = Number.parseInt(a, 10);
    const gradeB = Number.parseInt(b, 10);
    if (gradeA !== gradeB) return gradeA - gradeB;
    return a.localeCompare(b, "tr");
});

const CLASS_KEY = "myClass";
const HOME_DATA_KEY = "biroorHomePlannerV1";
const DAILY_NOTE_COLLECTION = "classDailyNotes";
const STUDENT_CHECKIN_COLLECTION = "studentCheckins";
const STUDENT_NAME_KEY = "biroorStudentName";
const state = {
    selectedClass: localStorage.getItem(CLASS_KEY) || classIds[0],
    todos: [],
    note: "",
    homeworkCount: 0,
    studentName: localStorage.getItem(STUDENT_NAME_KEY) || ""
};

const els = {
    classSelect: document.getElementById("classSelect"),
    syncButton: document.getElementById("syncButton"),
    currentStat: document.getElementById("currentStat"),
    timerStat: document.getElementById("timerStat"),
    homeworkCountStat: document.getElementById("homeworkCountStat"),
    dailyLogMeta: document.getElementById("dailyLogMeta"),
    dailyLogPreview: document.getElementById("dailyLogPreview"),
    todaySubtitle: document.getElementById("todaySubtitle"),
    todayChip: document.getElementById("todayChip"),
    todayList: document.getElementById("todayList"),
    weeklyGrid: document.getElementById("weeklyGrid"),
    homeworkStatus: document.getElementById("homeworkStatus"),
    homeworkList: document.getElementById("homeworkList"),
    homeworkForm: document.getElementById("homeworkForm"),
    toggleHomeworkForm: document.getElementById("toggleHomeworkForm"),
    closeHomeworkForm: document.getElementById("closeHomeworkForm"),
    hwTitle: document.getElementById("hwTitle"),
    hwDesc: document.getElementById("hwDesc"),
    saveHomeworkButton: document.getElementById("saveHomeworkButton"),
    studentNameInput: document.getElementById("studentNameInput"),
    studentLoginButton: document.getElementById("studentLoginButton"),
    studentLoginStatus: document.getElementById("studentLoginStatus"),
    todoInput: document.getElementById("todoInput"),
    addTodoButton: document.getElementById("addTodoButton"),
    todoList: document.getElementById("todoList"),
    studyNote: document.getElementById("studyNote"),
    noteStatus: document.getElementById("noteStatus")
};

let timeInterval = null;
let unsubscribeHomework = null;
let unsubscribeDailyLog = null;

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatClassLabel(classId) {
    return `${classId.charAt(0)}-${classId.slice(1)}`;
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

function slugifyStudentName(name) {
    return (name || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ş/g, "s")
        .replace(/ç/g, "c")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 42) || "ogrenci";
}

function getStudentCheckinId(classId, studentName) {
    return `${classId}_${getTodayKey()}_${slugifyStudentName(studentName)}`;
}

function toDateObject(rawValue) {
    if (!rawValue) return null;
    if (rawValue instanceof Date) return rawValue;
    if (typeof rawValue.toDate === "function") return rawValue.toDate();
    return null;
}

function formatTimestampLabel(rawValue) {
    const date = toDateObject(rawValue);
    if (!date) return "Canli";
    return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderDailyLog(payload = null) {
    const text = (payload?.text || "").toString().trim();
    if (els.dailyLogPreview) {
        els.dailyLogPreview.textContent = text || "Bugun icin paylasilan ders ozeti henuz yok.";
    }
    if (els.dailyLogMeta) {
        els.dailyLogMeta.textContent = text ? formatTimestampLabel(payload?.updatedAt) : "Bos";
    }
}

function subscribeDailyLog() {
    if (typeof unsubscribeDailyLog === "function") {
        unsubscribeDailyLog();
    }

    try {
        unsubscribeDailyLog = onSnapshot(
            doc(db, DAILY_NOTE_COLLECTION, getDailyNoteDocId(state.selectedClass)),
            (docSnap) => {
                renderDailyLog(docSnap.exists() ? docSnap.data() : null);
            },
            () => renderDailyLog(null)
        );
    } catch (_) {
        renderDailyLog(null);
    }
}

function setStudentLoginStatus(message, isError = false) {
    if (!els.studentLoginStatus) return;
    els.studentLoginStatus.textContent = message;
    els.studentLoginStatus.classList.toggle("error", isError);
}

async function saveStudentCheckin() {
    const studentName = (els.studentNameInput?.value || "").trim();
    if (!studentName) {
        setStudentLoginStatus("Ismini yazarak giris yapmalisin.", true);
        return;
    }

    const classId = state.selectedClass.toUpperCase();
    state.studentName = studentName;
    localStorage.setItem(STUDENT_NAME_KEY, studentName);

    try {
        await setDoc(doc(db, STUDENT_CHECKIN_COLLECTION, getStudentCheckinId(classId, studentName)), {
            classId,
            dateKey: getTodayKey(),
            studentName,
            createdAt: serverTimestamp(),
            source: "phone"
        }, { merge: true });
        setStudentLoginStatus("Adin ogretmen paneline kaydedildi.");
    } catch (_) {
        setStudentLoginStatus("Giris kaydedilemedi. Baglanti veya Firebase ayarini kontrol et.", true);
    }
}

function getStoragePayload() {
    try {
        const parsed = JSON.parse(localStorage.getItem(HOME_DATA_KEY) || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
        return {};
    }
}

function saveStoragePayload(payload) {
    localStorage.setItem(HOME_DATA_KEY, JSON.stringify(payload));
}

function loadPersonalData() {
    const payload = getStoragePayload();
    const classData = payload[state.selectedClass] || {};
    state.todos = Array.isArray(classData.todos) ? classData.todos : [];
    state.note = typeof classData.note === "string" ? classData.note : "";
    els.studyNote.value = state.note;
    renderTodos();
}

function persistPersonalData() {
    const payload = getStoragePayload();
    payload[state.selectedClass] = {
        todos: state.todos,
        note: state.note
    };
    saveStoragePayload(payload);
}

function getDayIndex(now = new Date()) {
    const jsDay = now.getDay();
    if (jsDay === 0 || jsDay === 6) return -1;
    return jsDay - 1;
}

function getDisplayDay(now = new Date()) {
    const index = getDayIndex(now);
    if (index >= 0) {
        return { name: days[index], weekend: false };
    }
    return { name: "Pazartesi", weekend: true };
}

function getScheduleForDay(classId, dayName) {
    const classSchedule = schoolData[classId] || {};
    return Array.isArray(classSchedule[dayName]) ? classSchedule[dayName] : [];
}

function getLessonState(now = new Date()) {
    const { name: dayName, weekend } = getDisplayDay(now);
    const schedule = getScheduleForDay(state.selectedClass, dayName);
    if (weekend) {
        return {
            dayName,
            weekend: true,
            schedule,
            activeIndex: -1,
            nextIndex: schedule.length ? 0 : -1,
            countdown: "--:--",
            remainingCount: schedule.length
        };
    }

    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    let activeIndex = -1;
    let nextIndex = -1;
    let countdown = "--:--";

    schedule.forEach((lesson, index) => {
        const { s, e } = lessonHours[index];
        if (timeStr >= s && timeStr <= e) {
            activeIndex = index;
            const [endHour, endMinute] = e.split(":").map(Number);
            const target = new Date(now);
            target.setHours(endHour, endMinute, 0, 0);
            const diffSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
            countdown = `${String(Math.floor(diffSeconds / 60)).padStart(2, "0")}:${String(diffSeconds % 60).padStart(2, "0")}`;
        }
        if (nextIndex === -1 && timeStr < s) {
            nextIndex = index;
        }
    });

    const remainingCount = activeIndex >= 0
        ? schedule.length - activeIndex
        : nextIndex >= 0
            ? schedule.length - nextIndex
            : 0;

    return {
        dayName,
        weekend,
        schedule,
        activeIndex,
        nextIndex,
        countdown,
        remainingCount
    };
}

function renderToday() {
    const now = new Date();
    const lessonState = getLessonState(now);
    const dateLabel = now.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        weekday: "long"
    });

    els.todayChip.textContent = lessonState.weekend ? "Hafta Sonu" : lessonState.dayName;
    els.todaySubtitle.textContent = lessonState.weekend
        ? `Bugun okul yok. Pazartesi programi gosteriliyor. ${dateLabel}`
        : `${dateLabel} icin sinif akisi.`;

    if (!lessonState.schedule.length) {
        els.todayList.innerHTML = "<div class=\"empty-state\">Secili sinif icin ders akisi bulunamadi.</div>";
        els.currentStat.textContent = "Program bos";
        els.timerStat.textContent = "--:--";
        return;
    }

    let currentText = "Bugun dersler tamamlandi";
    if (lessonState.activeIndex >= 0) {
        currentText = lessonState.schedule[lessonState.activeIndex];
    } else if (lessonState.nextIndex >= 0) {
        currentText = `Sonraki: ${lessonState.schedule[lessonState.nextIndex]}`;
    }

    els.currentStat.textContent = currentText;
    els.timerStat.textContent = lessonState.activeIndex >= 0 ? lessonState.countdown : `${lessonState.remainingCount} ders`;

    els.todayList.innerHTML = lessonState.schedule.map((lesson, index) => {
        const isActive = index === lessonState.activeIndex;
        const isNext = lessonState.activeIndex === -1 && index === lessonState.nextIndex;
        const badge = isActive ? "Su an aktif" : isNext ? "Siradaki ders" : "Planlandi";
        const icon = lessonIcons[lesson] || "📘";
        return `
            <article class="lesson-item${isActive ? " active" : ""}">
                <div class="lesson-icon">${icon}</div>
                <div class="lesson-copy">
                    <strong>${escapeHtml(lesson)}</strong>
                    <small>${badge}</small>
                </div>
                <div class="lesson-time">${lessonHours[index].s} - ${lessonHours[index].e}</div>
            </article>
        `;
    }).join("");
}

function renderWeekly() {
    els.weeklyGrid.innerHTML = days.map((dayName) => {
        const lessons = getScheduleForDay(state.selectedClass, dayName);
        const subjectHtml = lessons.map((lesson, index) => `
            <span class="subject-pill">
                <span>${lessonIcons[lesson] || "📘"}</span>
                <span>${escapeHtml(lesson)}</span>
                <span class="helper">${lessonHours[index].s}</span>
            </span>
        `).join("");

        return `
            <article class="day-card">
                <div class="day-top">
                    <strong>${dayName}</strong>
                    <span class="chip">${lessons.length} ders</span>
                </div>
                <div class="subject-pills">
                    ${subjectHtml || '<span class="empty-state">Program bulunamadi.</span>'}
                </div>
            </article>
        `;
    }).join("");
}

function renderTodos() {
    if (!state.todos.length) {
        els.todoList.innerHTML = "<div class=\"empty-state\">Evde yapilacaklar burada gorunur. Ilk gorevini ekleyebilirsin.</div>";
        return;
    }

    els.todoList.innerHTML = state.todos.map((todo) => `
        <article class="todo-item${todo.done ? " done" : ""}">
            <input class="todo-check" type="checkbox" data-action="toggle-todo" data-id="${todo.id}" ${todo.done ? "checked" : ""}>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" type="button" data-action="delete-todo" data-id="${todo.id}" aria-label="Gorevi sil">X</button>
        </article>
    `).join("");
}

function setHomeworkStatus(message, isError = false) {
    els.homeworkStatus.textContent = message;
    els.homeworkStatus.classList.toggle("error", isError);
}

function renderHomework(items) {
    state.homeworkCount = items.length;
    els.homeworkCountStat.textContent = String(items.length);

    if (!items.length) {
        els.homeworkList.innerHTML = "<div class=\"empty-state\">Bu sinif icin kayitli odev gorunmuyor.</div>";
        return;
    }

    els.homeworkList.innerHTML = items.map((item) => `
        <article class="homework-item">
            <div class="item-row">
                <div>
                    <strong>${escapeHtml(item.title || "Odev")}</strong>
                    <p>${escapeHtml(item.desc || "Detay eklenmemis.")}</p>
                </div>
                <button class="delete-btn" type="button" data-action="delete-homework" data-id="${item.id}" aria-label="Odevi sil">X</button>
            </div>
        </article>
    `).join("");
}

function subscribeHomework() {
    if (typeof unsubscribeHomework === "function") {
        unsubscribeHomework();
    }

    const classId = state.selectedClass.toUpperCase();
    const classNumber = Number.parseInt(classId.charAt(0), 10);
    const classSection = classId.charAt(1);

    setHomeworkStatus("Odevler baglaniyor...");

    try {
        const homeworkQuery = query(
            collection(db, "homeworks"),
            where("classNumber", "==", classNumber),
            where("classSection", "==", classSection)
        );

        unsubscribeHomework = onSnapshot(
            homeworkQuery,
            (snapshot) => {
                const items = [];
                snapshot.forEach((docSnap) => {
                    items.push({ id: docSnap.id, ...docSnap.data() });
                });
                renderHomework(items);
                setHomeworkStatus(items.length ? `${items.length} odev listelendi.` : "Yeni odev ekleyebilirsin.");
            },
            () => {
                renderHomework([]);
                setHomeworkStatus("Odevler alinamadi. Baglanti veya Firebase ayarini kontrol et.", true);
            }
        );
    } catch (_) {
        renderHomework([]);
        setHomeworkStatus("Odevler acilamadi. Firebase baglantisi kurulamadi.", true);
    }
}

async function saveHomework() {
    const title = els.hwTitle.value.trim();
    const desc = els.hwDesc.value.trim();
    if (!title || !desc) {
        setHomeworkStatus("Odev kaydi icin ders adi ve detay gerekli.", true);
        return;
    }

    const classId = state.selectedClass.toUpperCase();

    try {
        await addDoc(collection(db, "homeworks"), {
            title,
            desc,
            classNumber: Number.parseInt(classId.charAt(0), 10),
            classSection: classId.charAt(1),
            timestamp: serverTimestamp()
        });
        els.hwTitle.value = "";
        els.hwDesc.value = "";
        els.homeworkForm.hidden = true;
        setHomeworkStatus("Odev kaydedildi.");
    } catch (_) {
        setHomeworkStatus("Odev kaydedilemedi. Firebase erisimi kontrol edilmeli.", true);
    }
}

async function deleteHomeworkItem(id) {
    const approved = window.confirm("Bu odevi silmek istiyor musun?");
    if (!approved) return;

    try {
        await deleteDoc(doc(db, "homeworks", id));
        setHomeworkStatus("Odev silindi.");
    } catch (_) {
        setHomeworkStatus("Odev silinemedi.", true);
    }
}

function handleClassChange(nextClass) {
    state.selectedClass = nextClass;
    localStorage.setItem(CLASS_KEY, nextClass);
    loadPersonalData();
    renderToday();
    renderWeekly();
    subscribeDailyLog();
    subscribeHomework();
}

function addTodo() {
    const text = els.todoInput.value.trim();
    if (!text) return;

    state.todos.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        done: false
    });
    els.todoInput.value = "";
    persistPersonalData();
    renderTodos();
}

function toggleTodo(id) {
    state.todos = state.todos.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo);
    persistPersonalData();
    renderTodos();
}

function deleteTodo(id) {
    state.todos = state.todos.filter((todo) => todo.id !== id);
    persistPersonalData();
    renderTodos();
}

function populateClasses() {
    els.classSelect.innerHTML = classIds.map((classId) => `
        <option value="${classId}" ${classId === state.selectedClass ? "selected" : ""}>${formatClassLabel(classId)}</option>
    `).join("");
}

function bindEvents() {
    els.classSelect.addEventListener("change", (event) => {
        handleClassChange(event.target.value);
    });

    els.syncButton.addEventListener("click", () => {
        localStorage.setItem(CLASS_KEY, state.selectedClass);
        els.syncButton.textContent = "Kaydedildi";
        window.setTimeout(() => {
            els.syncButton.textContent = "Sinifi Kaydet";
        }, 1400);
    });

    els.toggleHomeworkForm.addEventListener("click", () => {
        els.homeworkForm.hidden = !els.homeworkForm.hidden;
    });

    els.closeHomeworkForm.addEventListener("click", () => {
        els.homeworkForm.hidden = true;
    });

    els.saveHomeworkButton.addEventListener("click", saveHomework);
    els.studentLoginButton.addEventListener("click", saveStudentCheckin);
    els.addTodoButton.addEventListener("click", addTodo);
    els.studentNameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            saveStudentCheckin();
        }
    });
    els.todoInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addTodo();
        }
    });

    els.studyNote.addEventListener("input", (event) => {
        state.note = event.target.value;
        persistPersonalData();
        els.noteStatus.textContent = "Not kaydedildi.";
    });

    els.todoList.addEventListener("click", (event) => {
        const actionEl = event.target.closest("[data-action]");
        if (!actionEl) return;
        if (actionEl.dataset.action === "delete-todo") {
            deleteTodo(actionEl.dataset.id);
        }
    });

    els.todoList.addEventListener("change", (event) => {
        const actionEl = event.target.closest("[data-action='toggle-todo']");
        if (!actionEl) return;
        toggleTodo(actionEl.dataset.id);
    });

    els.homeworkList.addEventListener("click", (event) => {
        const actionEl = event.target.closest("[data-action='delete-homework']");
        if (!actionEl) return;
        deleteHomeworkItem(actionEl.dataset.id);
    });

    window.addEventListener("storage", (event) => {
        if (event.key === CLASS_KEY && event.newValue && event.newValue !== state.selectedClass) {
            state.selectedClass = event.newValue;
            populateClasses();
            loadPersonalData();
            renderToday();
            renderWeekly();
            subscribeDailyLog();
            subscribeHomework();
        }
    });
}

function bootClock() {
    if (timeInterval) {
        window.clearInterval(timeInterval);
    }
    renderToday();
    timeInterval = window.setInterval(renderToday, 1000);
}

function init() {
    if (!classIds.includes(state.selectedClass)) {
        state.selectedClass = classIds[0];
    }

    populateClasses();
    if (els.studentNameInput) {
        els.studentNameInput.value = state.studentName;
    }
    loadPersonalData();
    renderWeekly();
    renderTodos();
    subscribeDailyLog();
    subscribeHomework();
    bindEvents();
    bootClock();
}

init();
