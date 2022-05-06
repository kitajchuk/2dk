// This file is required by the editor.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.onload = () => {
    const _2dk = window._2dk;

    window.editor = new _2dk.Editor();
};
