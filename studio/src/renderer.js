// This file is required by the editor.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.onload = () => {
    window.studio.instance = new window.studio.Editor();
    window.feather.replace();
};
