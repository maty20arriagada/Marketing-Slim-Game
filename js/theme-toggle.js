/**
 * MKT SLIM GAME — theme-toggle.js
 * Gestiona el cambio entre tema oscuro y claro.
 * Persiste la preferencia en localStorage.
 * Se incluye en todas las páginas.
 */

"use strict";

(function () {
    const STORAGE_KEY = "ag_theme";

    // Apply saved theme immediately (before paint)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        document.documentElement.setAttribute("data-theme", saved);
    }

    // Inject toggle button when DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
        // Find the topnav__meta container or topnav__inner
        const meta = document.querySelector(".topnav__meta");
        const inner = document.querySelector(".topnav__inner");
        const target = meta || inner;

        if (!target) return;

        const btn = document.createElement("button");
        btn.className = "theme-toggle";
        btn.setAttribute("id", "theme-toggle-btn");
        btn.setAttribute("title", "Cambiar tema");
        btn.setAttribute("aria-label", "Cambiar tema claro/oscuro");

        function updateIcon() {
            const current = document.documentElement.getAttribute("data-theme");
            btn.textContent = current === "light" ? "🌙" : "☀️";
        }

        btn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem(STORAGE_KEY, next);
            updateIcon();
        });

        updateIcon();

        // Insert toggle button in appropriate position
        if (meta) {
            meta.insertBefore(btn, meta.firstChild);
        } else {
            inner.appendChild(btn);
        }
    });
})();
