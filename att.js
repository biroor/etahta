// att.js
export const attList = [
    { sira: 1, isim: "BOŞ" },
    { sira: 2, isim: "BOŞ" },
    { sira: 3, isim: "BOŞ" },
    { sira: 4, isim: "BOŞ" },
    { sira: 5, isim: "BOŞ" },
    { sira: 6, isim: "BOŞ" },
    { sira: 7, isim: "BOŞ" },
    { sira: 8, isim: "BOŞ" },
    { sira: 9, isim: "BOŞ" },
    { sira: 10, isim: "BOŞ" },
    { sira: 11, isim: "BOŞ" }, 
    { sira: 12, isim: "BOŞ" },
    { sira: 13, isim: "BOŞ" },
    { sira: 14, isim: "BOŞ" },
    { sira: 15, isim: "BOŞ" },
    { sira: 16, isim: "BOŞ" },
    { sira: 17, isim: "BOŞ" },
    { sira: 18, isim: "BOŞ" },
    { sira: 19, isim: "BOŞ" },
    { sira: 20, isim: "BOŞ" },
    { sira: 21, isim: "BOŞ" },
    { sira: 22, isim: "BOŞ" },
    { sira: 23, isim: "BOŞ" },
    { sira: 24, isim: "BOŞ" },
    { sira: 25, isim: "BOŞ" },
    { sira: 26, isim: "BOŞ" },
    { sira: 27, isim: "BOŞ" },
    { sira: 28, isim: "BOŞ" },
    { sira: 29, isim: "BOŞ" },
    { sira: 30, isim: "BOŞ" },
    { sira: 31, isim: "BOŞ" },
    { sira: 32, isim: "BOŞ" },
    { sira: 33, isim: "BOŞ" },
    { sira: 34, isim: "BOŞ" },
    { sira: 35, isim: "BOŞ" },
    { sira: 36, isim: "BOŞ" },
    { sira: 37, isim: "BOŞ" },
    { sira: 38, isim: "BOŞ" },
    { sira: 39, isim: "BOŞ" },
    { sira: 40, isim: "BOŞ" },
    { sira: 41, isim: "BOŞ" },
    { sira: 42, isim: "BOŞ" },
    { sira: 43, isim: "BOŞ" },
    { sira: 44, isim: "BOŞ" },
    { sira: 45, isim: "BOŞ" },
    { sira: 46, isim: "BOŞ" },
    { sira: 47, isim: "BOŞ" },
    { sira: 48, isim: "BOŞ" },
    { sira: 49, isim: "BOŞ" },
    { sira: 50, isim: "BOŞ" },
    { sira: 51, isim: "BOŞ" },
    { sira: 52, isim: "BOŞ" },
    { sira: 53, isim: "BOŞ" },
    { sira: 54, isim: "BOŞ" },
    { sira: 55, isim: "BOŞ" },
    { sira: 56, isim: "BOŞ" },
    { sira: 57, isim: "BOŞ" },
    { sira: 58, isim: "BOŞ" },
    { sira: 59, isim: "BOŞ" },
    { sira: 60, isim: "BOŞ" }


    
];

// Render ATT list into the modal container
export function loadATT() {
    try {
        const container = document.getElementById('attListContent');
        if (!container) return;

        // Allow saved names in localStorage under 'attNames' (optional)
        const saved = JSON.parse(localStorage.getItem('attNames') || 'null');
        const source = Array.isArray(saved) && saved.length === attList.length ? saved : attList;

        container.innerHTML = source.map(item => {
            const name = item.isim || item;
            return `<div style="display:flex; justify-content:space-between; padding:8px 6px; border-bottom:1px solid rgba(255,255,255,0.04);">
                        <div style="font-weight:700; opacity:0.9;">${item.sira}.</div>
                        <div style="flex:1; padding-left:10px;">${name}</div>
                    </div>`;
        }).join('');
    } catch (e) {
        console.error('loadATT error', e);
    }
}