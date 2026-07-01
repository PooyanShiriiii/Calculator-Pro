self.addEventListener("install", () => {
  console.log("App installed");
});

self.addEventListener("fetch", () => {});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}