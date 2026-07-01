const display = document.getElementById("display");
const menu = document.getElementById("menu");
const buttons = document.querySelectorAll("button");
const historyBox = document.getElementById("history");

let raw = "";

// 🔊 Sound
const clickSound = new Audio("click.mp3");
clickSound.volume = 0.3;

function playSound() {
    clickSound.currentTime = 0;
    clickSound.play();
}

// ➕ append
function append(v) {
    raw += v;
    playSound();
    update();
}

// ❌ clear
function clearAll() {
    raw = "";
    playSound();
    update();
}

// ⌫ delete
function del() {
    raw = raw.slice(0, -1);
    playSound();
    update();
}

// 🧠 format (display only)
function formatExpression(expr) {
    return expr
        .replaceAll("*", "×")
        .replaceAll("/", "÷")
        .split(/([+\-×÷])/g)
        .map(part => {
            if (!isNaN(part) && part !== "") {
                return Number(part).toLocaleString("en-US");
            }
            return part;
        })
        .join("");
}

// 🔄 update display
function update() {
    display.value = formatExpression(raw);

    display.classList.remove("display-anim");
    void display.offsetWidth; // ریست انیمیشن (ترفند مهم 😎)
    display.classList.add("display-anim");
}

// 🧠 calculate
function calculate() {
    try {
        const result = eval(raw).toString();

        addHistory(raw, result);

        raw = result;
        playSound();
        update();
    } catch {
        display.value = "Error";
        raw = "";
    }
}

// 🎨 menu
function toggleMenu() {
    menu.classList.toggle("hidden");
}

function setTheme(theme) {
    document.body.className = theme === "dark" ? "" : theme;
    menu.classList.add("hidden");
}

// ⌨️ keyboard
document.addEventListener("keydown", function (e) {
    const key = e.key;

    if (!isNaN(key) || ["+", "-", "*", "/", "."].includes(key)) {
        append(key);
        animateKey(key);
    }

    if (key === "Enter") {
        calculate();
        animateKey("=");
    }

    if (key === "Backspace") {
        del();
        animateKey("DEL");
    }

    if (key.toLowerCase() === "c") {
        clearAll();
    }
});

// 🎬 animation
function animateKey(key) {
    let btn = Array.from(buttons).find(b => b.textContent === key);
    if (!btn) return;

    btn.classList.add("active");

    setTimeout(() => {
        btn.classList.remove("active");
    }, 120);
}

/* =======================
   🧠 HISTORY SYSTEM (FIXED)
======================= */

let historyData = JSON.parse(localStorage.getItem("history")) || [];

function renderHistory() {
    historyBox.innerHTML = "";

    historyData.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "history-item";

        div.innerHTML = `
            <span onclick="useHistory('${item.result}')">
                ${item.expression} = ${item.result}
            </span>
            <button onclick="deleteHistory(${index})">❌</button>
        `;

        historyBox.prepend(div);
    });
}

function addHistory(expression, result) {
    historyData.push({ expression, result });
    localStorage.setItem("history", JSON.stringify(historyData));
    renderHistory();
}

function clearHistory() {
    historyData = [];
    localStorage.removeItem("history");
    renderHistory();
}

function deleteHistory(index) {
    historyData.splice(index, 1);
    localStorage.setItem("history", JSON.stringify(historyData));
    renderHistory();
}

function useHistory(value) {
    raw = value;
    update();
}

// init
renderHistory();

function createRipple(event) {
    const button = event.currentTarget;

    const circle = document.createElement("span");
    circle.classList.add("ripple");

    const rect = button.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    circle.style.width = circle.style.height = size + "px";
    circle.style.left = x + "px";
    circle.style.top = y + "px";

    // 💥 تعیین رنگ بر اساس نوع دکمه
    const value = button.textContent.trim();

    let color = "rgba(255,255,255,0.4)"; // پیشفرض

    if (!isNaN(value)) {
        color = "rgba(0, 200, 255, 0.4)"; // عدد → آبی
    } 
    else if (["+", "-", "×", "*", "÷", "/"].includes(value)) {
        color = "rgba(255, 165, 0, 0.4)"; // عملیات → نارنجی
    } 
    else if (value === "=") {
        color = "rgba(0, 255, 120, 0.4)"; // نتیجه → سبز
    } 
    else if (value === "C" || value === "⌫") {
        color = "rgba(255, 60, 60, 0.4)"; // حذف → قرمز
    } 
    else if (value === "🎨") {
        color = "rgba(180, 80, 255, 0.4)"; // تم → بنفش
    }

    circle.style.background = color;

    button.appendChild(circle);

    setTimeout(() => {
        circle.remove();
    }, 600);
}

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", createRipple);
});