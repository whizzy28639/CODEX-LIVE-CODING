/**
 * CODEX PLAYGROUND
 * Professional browser-based HTML/CSS/JS development environment
 */

(function () {
  'use strict';

  // ========== CONFIG & STATE ==========
  const CONFIG = {
    debounceDelay: 400,
    autoRun: true,
    fontSize: 14,
    theme: 'vs-dark',
    wordWrap: true,
    minimap: false,
    defaultHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CODEX PLAYGROUND</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Start building something amazing.</p>
</body>
</html>`,
    defaultCss: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f12 0%, #1a1a24 100%);
  color: #e8e8ed;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #00d4ff, #7b61ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  color: #9898a6;
  font-size: 1.1rem;
}`,
    defaultJs: `// Welcome to CODEX PLAYGROUND
console.log('Ready to code!');

document.querySelector('h1')?.addEventListener('click', () => {
  alert('You clicked the title!');
});`
  };

  const state = {
    projectId: null,
    projectName: 'Untitled Project',
    html: CONFIG.defaultHtml,
    css: CONFIG.defaultCss,
    js: CONFIG.defaultJs,
    isDirty: false,
    isRunning: false,
    currentTab: 'html',
    editors: { html: null, css: null, js: null },
    monacoReady: false,
    debounceTimer: null,
    consoleCollapsed: false,
    viewport: '100%'
  };

  // ========== TEMPLATES ==========
  const TEMPLATES = [
    {
      id: 'blank',
      name: 'Blank Project',
      icon: '📄',
      html: CONFIG.defaultHtml,
      css: CONFIG.defaultCss,
      js: CONFIG.defaultJs
    },
    {
      id: 'portfolio',
      name: 'Personal Portfolio',
      icon: '👤',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Rivera — Portfolio</title>
</head>
<body>
  <nav>
    <div class="logo">AR</div>
    <ul>
      <li><a href="#about">About</a></li>
      <li><a href="#work">Work</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>
  <header class="hero">
    <h1>Alex Rivera</h1>
    <p class="tagline">Frontend Engineer & Designer</p>
    <a href="#work" class="btn">View Work</a>
  </header>
  <section id="about">
    <h2>About</h2>
    <p>I craft clean, accessible interfaces with modern web technologies. Passionate about performance, design systems, and delightful user experiences.</p>
  </section>
  <section id="work">
    <h2>Selected Work</h2>
    <div class="grid">
      <article class="card"><h3>Fintech Dashboard</h3><p>Real-time analytics platform</p></article>
      <article class="card"><h3>Design System</h3><p>Component library used by 50+ teams</p></article>
      <article class="card"><h3>Mobile App</h3><p>Cross-platform productivity tool</p></article>
    </div>
  </section>
  <section id="contact">
    <h2>Get in Touch</h2>
    <p>hello@alexrivera.dev</p>
  </section>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0c0c0f; color: #e4e4e7; line-height: 1.6; }
nav { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 5%; position: fixed; width: 100%; top: 0; background: rgba(12,12,15,0.85); backdrop-filter: blur(12px); z-index: 100; border-bottom: 1px solid #27272a; }
.logo { font-weight: 700; font-size: 1.25rem; color: #22d3ee; }
nav ul { display: flex; list-style: none; gap: 2rem; }
nav a { color: #a1a1aa; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
nav a:hover { color: #fff; }
.hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; }
.hero h1 { font-size: clamp(2.5rem, 8vw, 4.5rem); font-weight: 700; letter-spacing: -0.03em; margin-bottom: 0.5rem; }
.tagline { color: #a1a1aa; font-size: 1.25rem; margin-bottom: 2rem; }
.btn { display: inline-block; padding: 0.75rem 1.75rem; background: #22d3ee; color: #0c0c0f; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(34,211,238,0.3); }
section { padding: 5rem 5%; max-width: 1100px; margin: 0 auto; }
section h2 { font-size: 1.75rem; margin-bottom: 1.5rem; color: #22d3ee; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
.card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 1.5rem; transition: border-color 0.2s, transform 0.2s; }
.card:hover { border-color: #22d3ee; transform: translateY(-4px); }
.card h3 { margin-bottom: 0.5rem; }
.card p { color: #a1a1aa; font-size: 0.9rem; }
#contact { text-align: center; padding-bottom: 6rem; }
@media (max-width: 600px) { nav ul { gap: 1rem; } }`,
      js: `document.querySelectorAll('nav a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});`
    },
    {
      id: 'landing',
      name: 'Landing Page',
      icon: '🚀',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova — Ship faster</title>
</head>
<body>
  <header>
    <div class="container nav">
      <div class="logo">Nova</div>
      <button class="cta">Get Started</button>
    </div>
  </header>
  <main>
    <section class="hero container">
      <h1>Build products your users love</h1>
      <p>The modern platform for shipping beautiful web experiences in record time.</p>
      <div class="actions">
        <button class="cta primary">Start free trial</button>
        <button class="cta secondary">Watch demo</button>
      </div>
    </section>
    <section class="features container">
      <div class="feature"><div class="icon">⚡</div><h3>Blazing fast</h3><p>Optimized for performance out of the box.</p></div>
      <div class="feature"><div class="icon">🎨</div><h3>Beautiful UI</h3><p>Design system that scales with your team.</p></div>
      <div class="feature"><div class="icon">🔒</div><h3>Secure by default</h3><p>Enterprise-grade security without the complexity.</p></div>
    </section>
  </main>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #09090b; color: #fafafa; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
header { border-bottom: 1px solid #27272a; }
.nav { display: flex; justify-content: space-between; align-items: center; height: 64px; }
.logo { font-weight: 700; font-size: 1.35rem; }
.cta { padding: 0.5rem 1.1rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
.cta.primary { background: #8b5cf6; color: white; }
.cta.primary:hover { background: #7c3aed; }
.cta.secondary { background: transparent; color: #a1a1aa; border: 1px solid #3f3f46; }
.cta.secondary:hover { border-color: #71717a; color: #fff; }
.hero { text-align: center; padding: 6rem 1.5rem 4rem; }
.hero h1 { font-size: clamp(2.2rem, 6vw, 3.75rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1.25rem; max-width: 700px; margin-left: auto; margin-right: auto; }
.hero p { color: #a1a1aa; font-size: 1.2rem; max-width: 520px; margin: 0 auto 2.5rem; }
.actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; padding: 4rem 1.5rem 6rem; }
.feature { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 2rem; }
.feature .icon { font-size: 2rem; margin-bottom: 1rem; }
.feature h3 { margin-bottom: 0.5rem; }
.feature p { color: #a1a1aa; font-size: 0.95rem; }`,
      js: `document.querySelectorAll('.cta').forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('CTA clicked:', btn.textContent);
  });
});`
    },
    {
      id: 'login',
      name: 'Login & Registration',
      icon: '🔐',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auth — CODEX</title>
</head>
<body>
  <div class="auth-container">
    <div class="card">
      <div class="tabs">
        <button class="tab active" data-tab="login">Sign In</button>
        <button class="tab" data-tab="register">Sign Up</button>
      </div>
      <form id="login-form" class="form active">
        <div class="field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" required>
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" required>
        </div>
        <button type="submit" class="submit">Sign In</button>
      </form>
      <form id="register-form" class="form">
        <div class="field">
          <label>Name</label>
          <input type="text" placeholder="Your name" required>
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" required>
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" required>
        </div>
        <button type="submit" class="submit">Create Account</button>
      </form>
    </div>
  </div>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, #0f0f13, #1a1525); color: #e4e4e7; }
.auth-container { width: 100%; max-width: 400px; padding: 1.5rem; }
.card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1.75rem; background: #09090b; padding: 4px; border-radius: 10px; }
.tab { flex: 1; padding: 0.6rem; border: none; background: transparent; color: #71717a; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.tab.active { background: #27272a; color: #fff; }
.form { display: none; }
.form.active { display: block; }
.field { margin-bottom: 1.25rem; }
.field label { display: block; font-size: 0.85rem; color: #a1a1aa; margin-bottom: 0.4rem; }
.field input { width: 100%; padding: 0.75rem 1rem; background: #09090b; border: 1px solid #3f3f46; border-radius: 8px; color: #fff; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
.field input:focus { border-color: #8b5cf6; }
.submit { width: 100%; padding: 0.85rem; background: #8b5cf6; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
.submit:hover { background: #7c3aed; }`,
      js: `const tabs = document.querySelectorAll('.tab');
const forms = document.querySelectorAll('.form');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + '-form').classList.add('active');
  });
});
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  console.log('Login submitted');
  alert('Signed in! (demo)');
});
document.getElementById('register-form').addEventListener('submit', e => {
  e.preventDefault();
  console.log('Register submitted');
  alert('Account created! (demo)');
});`
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: '🧮',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculator</title>
</head>
<body>
  <div class="calculator">
    <div class="display" id="display">0</div>
    <div class="keys">
      <button class="key func" data-action="clear">AC</button>
      <button class="key func" data-action="sign">±</button>
      <button class="key func" data-action="percent">%</button>
      <button class="key op" data-action="divide">÷</button>
      <button class="key" data-num="7">7</button>
      <button class="key" data-num="8">8</button>
      <button class="key" data-num="9">9</button>
      <button class="key op" data-action="multiply">×</button>
      <button class="key" data-num="4">4</button>
      <button class="key" data-num="5">5</button>
      <button class="key" data-num="6">6</button>
      <button class="key op" data-action="subtract">−</button>
      <button class="key" data-num="1">1</button>
      <button class="key" data-num="2">2</button>
      <button class="key" data-num="3">3</button>
      <button class="key op" data-action="add">+</button>
      <button class="key zero" data-num="0">0</button>
      <button class="key" data-num=".">.</button>
      <button class="key op equals" data-action="equals">=</button>
    </div>
  </div>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0c0c0f; font-family: system-ui, sans-serif; }
.calculator { background: #18181b; border-radius: 24px; padding: 1.5rem; width: 320px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); border: 1px solid #27272a; }
.display { background: #09090b; border-radius: 12px; padding: 1.5rem 1.25rem; text-align: right; font-size: 2.5rem; font-weight: 300; color: #fff; margin-bottom: 1rem; min-height: 80px; overflow: hidden; word-break: break-all; }
.keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; }
.key { height: 64px; border: none; border-radius: 14px; font-size: 1.4rem; font-weight: 500; cursor: pointer; background: #27272a; color: #fff; transition: all 0.15s; }
.key:hover { background: #3f3f46; }
.key:active { transform: scale(0.95); }
.key.func { background: #3f3f46; color: #a1a1aa; }
.key.op { background: #f59e0b; color: #000; }
.key.op:hover { background: #d97706; }
.key.equals { background: #22c55e; }
.key.equals:hover { background: #16a34a; }
.key.zero { grid-column: span 2; }`,
      js: `let current = '0';
let previous = null;
let operation = null;
let resetNext = false;
const display = document.getElementById('display');

function updateDisplay() {
  display.textContent = current;
}

document.querySelectorAll('.key').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.num !== undefined) {
      if (resetNext) { current = '0'; resetNext = false; }
      if (btn.dataset.num === '.' && current.includes('.')) return;
      current = current === '0' && btn.dataset.num !== '.' ? btn.dataset.num : current + btn.dataset.num;
      updateDisplay();
    } else {
      const action = btn.dataset.action;
      if (action === 'clear') {
        current = '0'; previous = null; operation = null;
      } else if (action === 'sign') {
        current = String(parseFloat(current) * -1);
      } else if (action === 'percent') {
        current = String(parseFloat(current) / 100);
      } else if (['add','subtract','multiply','divide'].includes(action)) {
        if (previous !== null && operation) compute();
        previous = current;
        operation = action;
        resetNext = true;
      } else if (action === 'equals') {
        compute();
        operation = null;
        previous = null;
        resetNext = true;
      }
      updateDisplay();
    }
  });
});

function compute() {
  const a = parseFloat(previous);
  const b = parseFloat(current);
  if (isNaN(a) || isNaN(b)) return;
  let result;
  switch (operation) {
    case 'add': result = a + b; break;
    case 'subtract': result = a - b; break;
    case 'multiply': result = a * b; break;
    case 'divide': result = b === 0 ? 'Error' : a / b; break;
  }
  current = String(result);
}`
    },
    {
      id: 'clock',
      name: 'Digital Clock',
      icon: '🕐',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Clock</title>
</head>
<body>
  <div class="clock">
    <div class="time" id="time">00:00:00</div>
    <div class="date" id="date">Monday, January 1</div>
  </div>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0c; font-family: 'SF Mono', 'Fira Code', monospace; }
.clock { text-align: center; padding: 3rem; background: #121216; border-radius: 24px; border: 1px solid #2a2a34; box-shadow: 0 0 60px rgba(0,212,255,0.08); }
.time { font-size: clamp(3rem, 12vw, 6rem); font-weight: 300; letter-spacing: 0.05em; color: #00d4ff; text-shadow: 0 0 40px rgba(0,212,255,0.4); }
.date { margin-top: 1rem; font-size: 1.1rem; color: #6a6a78; letter-spacing: 0.1em; text-transform: uppercase; }`,
      js: `function update() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  document.getElementById('time').textContent = time;
  document.getElementById('date').textContent = date;
}
update();
setInterval(update, 1000);`
    },
    {
      id: 'todo',
      name: 'To-do Application',
      icon: '✅',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
</head>
<body>
  <div class="app">
    <h1>Tasks</h1>
    <form id="todo-form">
      <input type="text" id="todo-input" placeholder="What needs to be done?" autocomplete="off">
      <button type="submit">Add</button>
    </form>
    <ul id="todo-list"></ul>
    <div class="footer">
      <span id="count">0 items left</span>
      <button id="clear-completed">Clear completed</button>
    </div>
  </div>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; background: #0c0c0f; color: #e4e4e7; font-family: system-ui, sans-serif; display: flex; justify-content: center; padding: 3rem 1rem; }
.app { width: 100%; max-width: 480px; }
h1 { font-size: 2rem; margin-bottom: 1.5rem; font-weight: 600; }
#todo-form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
#todo-input { flex: 1; padding: 0.85rem 1rem; background: #18181b; border: 1px solid #27272a; border-radius: 10px; color: #fff; font-size: 1rem; outline: none; }
#todo-input:focus { border-color: #22d3ee; }
button { padding: 0.85rem 1.25rem; background: #22d3ee; color: #0c0c0f; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
#todo-list { list-style: none; }
.todo-item { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: #18181b; border: 1px solid #27272a; border-radius: 10px; margin-bottom: 0.5rem; }
.todo-item.done span { text-decoration: line-through; color: #71717a; }
.todo-item input[type=checkbox] { width: 18px; height: 18px; accent-color: #22d3ee; }
.todo-item span { flex: 1; }
.todo-item .delete { background: transparent; color: #71717a; padding: 0.25rem 0.5rem; font-size: 0.85rem; }
.todo-item .delete:hover { color: #ef4444; }
.footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; color: #71717a; font-size: 0.9rem; }
#clear-completed { background: transparent; color: #71717a; padding: 0.4rem 0.8rem; }
#clear-completed:hover { color: #fff; }`,
      js: `let todos = JSON.parse(localStorage.getItem('codex-todos') || '[]');
const list = document.getElementById('todo-list');
const countEl = document.getElementById('count');

function save() { localStorage.setItem('codex-todos', JSON.stringify(todos)); }
function render() {
  list.innerHTML = todos.map((t, i) => \`
    <li class="todo-item \${t.done ? 'done' : ''}">
      <input type="checkbox" \${t.done ? 'checked' : ''} data-i="\${i}">
      <span>\${t.text}</span>
      <button class="delete" data-i="\${i}">✕</button>
    </li>
  \`).join('');
  const left = todos.filter(t => !t.done).length;
  countEl.textContent = left + ' item' + (left !== 1 ? 's' : '') + ' left';
  list.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => { todos[cb.dataset.i].done = cb.checked; save(); render(); });
  });
  list.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', () => { todos.splice(btn.dataset.i, 1); save(); render(); });
  });
}
document.getElementById('todo-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  if (!input.value.trim()) return;
  todos.push({ text: input.value.trim(), done: false });
  input.value = '';
  save(); render();
});
document.getElementById('clear-completed').addEventListener('click', () => {
  todos = todos.filter(t => !t.done); save(); render();
});
render();`
    },
    {
      id: 'navbar',
      name: 'Responsive Nav Bar',
      icon: '📱',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Navbar</title>
</head>
<body>
  <nav class="navbar">
    <div class="brand">Brand</div>
    <button class="hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="nav-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">Products</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
      <li><a href="#" class="btn">Sign Up</a></li>
    </ul>
  </nav>
  <main>
    <h1>Responsive Navigation</h1>
    <p>Resize the window or open on mobile to see the hamburger menu.</p>
  </main>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0f0f12; color: #e4e4e7; min-height: 100vh; }
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 5%; background: #18181b; border-bottom: 1px solid #27272a; position: relative; }
.brand { font-weight: 700; font-size: 1.25rem; color: #22d3ee; }
.nav-links { display: flex; list-style: none; gap: 2rem; align-items: center; }
.nav-links a { color: #a1a1aa; text-decoration: none; font-size: 0.95rem; transition: color 0.2s; }
.nav-links a:hover { color: #fff; }
.nav-links .btn { background: #22d3ee; color: #0f0f12 !important; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; }
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
.hamburger span { width: 24px; height: 2px; background: #fff; transition: 0.3s; }
main { padding: 4rem 5%; text-align: center; }
main h1 { margin-bottom: 1rem; }
main p { color: #71717a; }
@media (max-width: 768px) {
  .hamburger { display: flex; }
  .nav-links { position: absolute; top: 100%; left: 0; right: 0; background: #18181b; flex-direction: column; padding: 1.5rem; gap: 1.25rem; border-bottom: 1px solid #27272a; transform: translateY(-120%); opacity: 0; pointer-events: none; transition: all 0.3s; }
  .nav-links.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
}`,
      js: `const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});`
    },
    {
      id: 'animated',
      name: 'Animated Website',
      icon: '✨',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animated</title>
</head>
<body>
  <div class="hero">
    <div class="orb orb1"></div>
    <div class="orb orb2"></div>
    <div class="orb orb3"></div>
    <h1 class="title">Motion Design</h1>
    <p class="subtitle">Smooth animations with pure CSS</p>
    <button class="pulse-btn">Explore</button>
  </div>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; background: #050508; overflow: hidden; font-family: system-ui, sans-serif; }
.hero { position: relative; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5; animation: float 12s ease-in-out infinite; }
.orb1 { width: 400px; height: 400px; background: #7c3aed; top: 10%; left: 10%; animation-delay: 0s; }
.orb2 { width: 300px; height: 300px; background: #06b6d4; bottom: 15%; right: 15%; animation-delay: -4s; }
.orb3 { width: 250px; height: 250px; background: #ec4899; top: 40%; right: 30%; animation-delay: -8s; }
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}
.title { font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 800; color: #fff; z-index: 1; animation: fadeUp 1s ease; }
.subtitle { color: #a1a1aa; font-size: 1.2rem; margin: 1rem 0 2.5rem; z-index: 1; animation: fadeUp 1s ease 0.2s both; }
.pulse-btn { z-index: 1; padding: 1rem 2.5rem; background: #fff; color: #050508; border: none; border-radius: 50px; font-weight: 700; font-size: 1rem; cursor: pointer; animation: fadeUp 1s ease 0.4s both, pulse 2s ease infinite 1.5s; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
  50% { box-shadow: 0 0 0 20px rgba(255,255,255,0); }
}`,
      js: `document.querySelector('.pulse-btn').addEventListener('click', () => {
  console.log('Explore clicked!');
});`
    },
    {
      id: 'quiz',
      name: 'Interactive Quiz',
      icon: '❓',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz</title>
</head>
<body>
  <div class="quiz" id="quiz">
    <div class="progress"><div class="bar" id="progress-bar"></div></div>
    <h2 id="question">Loading...</h2>
    <div class="options" id="options"></div>
    <div class="result hidden" id="result">
      <h2>Score: <span id="score">0</span>/<span id="total">0</span></h2>
      <button id="restart">Try Again</button>
    </div>
  </div>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0c0c0f; font-family: system-ui, sans-serif; color: #e4e4e7; padding: 1rem; }
.quiz { width: 100%; max-width: 500px; background: #18181b; border-radius: 20px; padding: 2rem; border: 1px solid #27272a; }
.progress { height: 6px; background: #27272a; border-radius: 3px; margin-bottom: 2rem; overflow: hidden; }
.bar { height: 100%; background: #8b5cf6; width: 0%; transition: width 0.3s; }
h2 { margin-bottom: 1.5rem; font-size: 1.35rem; line-height: 1.4; }
.options { display: flex; flex-direction: column; gap: 0.75rem; }
.option { padding: 1rem 1.25rem; background: #09090b; border: 2px solid #27272a; border-radius: 12px; cursor: pointer; transition: all 0.2s; font-size: 1rem; }
.option:hover { border-color: #8b5cf6; }
.option.correct { border-color: #22c55e; background: rgba(34,197,94,0.1); }
.option.wrong { border-color: #ef4444; background: rgba(239,68,68,0.1); }
.result { text-align: center; }
.result h2 { font-size: 2rem; margin-bottom: 1.5rem; }
#restart { padding: 0.85rem 2rem; background: #8b5cf6; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
.hidden { display: none; }`,
      js: `const questions = [
  { q: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], a: 0 },
  { q: 'Which property is used to change text color in CSS?', options: ['text-color', 'font-color', 'color', 'text-style'], a: 2 },
  { q: 'What is the correct way to declare a JavaScript variable?', options: ['v myVar;', 'variable myVar;', 'let myVar;', 'dim myVar;'], a: 2 },
  { q: 'Which HTML tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<head>'], a: 2 },
  { q: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], a: 1 }
];
let current = 0, score = 0;
const qEl = document.getElementById('question');
const optEl = document.getElementById('options');
const bar = document.getElementById('progress-bar');
const result = document.getElementById('result');

function load() {
  if (current >= questions.length) {
    document.getElementById('score').textContent = score;
    document.getElementById('total').textContent = questions.length;
    qEl.classList.add('hidden');
    optEl.classList.add('hidden');
    result.classList.remove('hidden');
    return;
  }
  const q = questions[current];
  qEl.textContent = q.q;
  bar.style.width = ((current / questions.length) * 100) + '%';
  optEl.innerHTML = q.options.map((o, i) => \`<div class="option" data-i="\${i}">\${o}</div>\`).join('');
  optEl.querySelectorAll('.option').forEach(opt => {
    opt.addEventListener('click', () => {
      const i = +opt.dataset.i;
      if (i === q.a) { opt.classList.add('correct'); score++; }
      else { opt.classList.add('wrong'); optEl.children[q.a].classList.add('correct'); }
      setTimeout(() => { current++; load(); }, 800);
    }, { once: true });
  });
}
document.getElementById('restart').addEventListener('click', () => {
  current = 0; score = 0;
  result.classList.add('hidden');
  qEl.classList.remove('hidden');
  optEl.classList.remove('hidden');
  load();
});
load();`
    },
    {
      id: 'game',
      name: 'Simple Browser Game',
      icon: '🎮',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catch the Dot</title>
</head>
<body>
  <div class="game">
    <div class="hud">
      <span>Score: <strong id="score">0</strong></span>
      <span>Time: <strong id="time">30</strong>s</span>
    </div>
    <div class="area" id="area">
      <div class="dot" id="dot"></div>
    </div>
    <button id="start">Start Game</button>
  </div>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0c0c0f; font-family: system-ui, sans-serif; color: #e4e4e7; }
.game { text-align: center; }
.hud { display: flex; justify-content: space-between; width: 320px; margin-bottom: 1rem; font-size: 1.1rem; }
.area { width: 320px; height: 320px; background: #18181b; border: 2px solid #27272a; border-radius: 16px; position: relative; overflow: hidden; margin-bottom: 1.25rem; }
.dot { width: 40px; height: 40px; background: #22d3ee; border-radius: 50%; position: absolute; cursor: pointer; transition: transform 0.1s; box-shadow: 0 0 20px rgba(34,211,238,0.5); }
.dot:hover { transform: scale(1.1); }
#start { padding: 0.75rem 2rem; background: #22d3ee; color: #0c0c0f; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem; }
#start:hover { background: #06b6d4; }`,
      js: `const area = document.getElementById('area');
const dot = document.getElementById('dot');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start');
let score = 0, time = 30, timer = null, playing = false;

function moveDot() {
  const maxX = area.clientWidth - 40;
  const maxY = area.clientHeight - 40;
  dot.style.left = Math.random() * maxX + 'px';
  dot.style.top = Math.random() * maxY + 'px';
}

dot.addEventListener('click', () => {
  if (!playing) return;
  score++;
  scoreEl.textContent = score;
  moveDot();
});

startBtn.addEventListener('click', () => {
  if (playing) return;
  playing = true;
  score = 0; time = 30;
  scoreEl.textContent = 0;
  timeEl.textContent = 30;
  startBtn.textContent = 'Playing...';
  moveDot();
  timer = setInterval(() => {
    time--;
    timeEl.textContent = time;
    if (time <= 0) {
      clearInterval(timer);
      playing = false;
      startBtn.textContent = 'Start Game';
      alert('Game Over! Score: ' + score);
    }
  }, 1000);
});
moveDot();`
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Landing',
      icon: '🛒',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shop — Minimal</title>
</head>
<body>
  <header>
    <div class="container nav">
      <div class="logo">MINIMAL</div>
      <nav>
        <a href="#">Shop</a>
        <a href="#">About</a>
        <a href="#" class="cart">Cart (0)</a>
      </nav>
    </div>
  </header>
  <section class="hero container">
    <h1>Timeless design<br>for modern living</h1>
    <p>Curated essentials crafted with care.</p>
  </section>
  <section class="products container">
    <article class="product">
      <div class="img" style="background:#3f3f46"></div>
      <h3>Ceramic Vase</h3>
      <p class="price">$48</p>
      <button>Add to Cart</button>
    </article>
    <article class="product">
      <div class="img" style="background:#52525b"></div>
      <h3>Linen Throw</h3>
      <p class="price">$89</p>
      <button>Add to Cart</button>
    </article>
    <article class="product">
      <div class="img" style="background:#71717a"></div>
      <h3>Oak Side Table</h3>
      <p class="price">$210</p>
      <button>Add to Cart</button>
    </article>
  </section>
</body>
</html>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #fafafa; color: #18181b; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
header { border-bottom: 1px solid #e4e4e7; }
.nav { display: flex; justify-content: space-between; align-items: center; height: 64px; }
.logo { font-weight: 700; letter-spacing: 0.15em; font-size: 0.95rem; }
nav { display: flex; gap: 2rem; }
nav a { color: #52525b; text-decoration: none; font-size: 0.9rem; }
nav a:hover { color: #18181b; }
.cart { font-weight: 600; }
.hero { padding: 5rem 1.5rem 3rem; text-align: center; }
.hero h1 { font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 500; line-height: 1.2; margin-bottom: 1rem; letter-spacing: -0.02em; }
.hero p { color: #71717a; }
.products { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; padding: 2rem 1.5rem 5rem; }
.product { text-align: center; }
.img { aspect-ratio: 1; border-radius: 8px; margin-bottom: 1rem; }
.product h3 { font-weight: 500; margin-bottom: 0.25rem; }
.price { color: #71717a; margin-bottom: 1rem; }
.product button { padding: 0.6rem 1.5rem; background: #18181b; color: #fff; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: background 0.2s; }
.product button:hover { background: #3f3f46; }`,
      js: `let cart = 0;
document.querySelectorAll('.product button').forEach(btn => {
  btn.addEventListener('click', () => {
    cart++;
    document.querySelector('.cart').textContent = 'Cart (' + cart + ')';
    btn.textContent = 'Added ✓';
    setTimeout(() => btn.textContent = 'Add to Cart', 1200);
  });
});`
    }
  ];

  // ========== DOM REFS ==========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ========== INDEXEDDB ==========
  const DB_NAME = 'CodexPlayground';
  const DB_VERSION = 1;
  const STORE = 'projects';
  let db = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE)) {
          const store = database.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
      req.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      req.onerror = () => reject(req.error);
    });
  }

  function saveProject(project) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(project);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function getAllProjects() {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  function getProject(id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function deleteProject(id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ========== MONACO EDITOR ==========
  function initMonaco() {
    return new Promise((resolve) => {
      require.config({
        paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' }
      });
      require(['vs/editor/editor.main'], () => {
        // Custom theme
        monaco.editor.defineTheme('codex-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#121216',
            'editor.lineHighlightBackground': '#1a1a20',
            'editorLineNumber.foreground': '#4a4a56',
            'editorLineNumber.activeForeground': '#9898a6',
            'editor.selectionBackground': '#00d4ff33',
            'editorCursor.foreground': '#00d4ff'
          }
        });
        monaco.editor.defineTheme('codex-light', {
          base: 'vs',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#ffffff',
            'editor.lineHighlightBackground': '#f0f0f2'
          }
        });

        const commonOpts = {
          automaticLayout: true,
          fontSize: CONFIG.fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: CONFIG.minimap },
          wordWrap: CONFIG.wordWrap ? 'on' : 'off',
          scrollBeyondLastLine: false,
          padding: { top: 12 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          tabSize: 2,
          insertSpaces: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          folding: true,
          bracketPairColorization: { enabled: true }
        };

        state.editors.html = monaco.editor.create($('#html-editor'), {
          ...commonOpts,
          value: state.html,
          language: 'html',
          theme: document.body.classList.contains('theme-light') ? 'codex-light' : 'codex-dark'
        });

        state.editors.css = monaco.editor.create($('#css-editor'), {
          ...commonOpts,
          value: state.css,
          language: 'css',
          theme: document.body.classList.contains('theme-light') ? 'codex-light' : 'codex-dark'
        });

        state.editors.js = monaco.editor.create($('#js-editor'), {
          ...commonOpts,
          value: state.js,
          language: 'javascript',
          theme: document.body.classList.contains('theme-light') ? 'codex-light' : 'codex-dark'
        });

        // Change listeners
        ['html', 'css', 'js'].forEach(lang => {
          state.editors[lang].onDidChangeModelContent(() => {
            state[lang] = state.editors[lang].getValue();
            markDirty();
            if (CONFIG.autoRun) schedulePreview();
          });
        });

        // Keyboard shortcuts
        state.editors.html.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runPreview);
        state.editors.css.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runPreview);
        state.editors.js.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runPreview);
        state.editors.html.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e) => { e.preventDefault(); saveCurrentProject(); });
        state.editors.css.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e) => { e.preventDefault(); saveCurrentProject(); });
        state.editors.js.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e) => { e.preventDefault(); saveCurrentProject(); });

        state.monacoReady = true;
        $$('.editor-wrapper').forEach(el => el.classList.remove('loading'));
        resolve();
      });
    });
  }

  // ========== PREVIEW ==========
  function buildPreviewDocument() {
    const html = state.editors.html ? state.editors.html.getValue() : state.html;
    const css = state.editors.css ? state.editors.css.getValue() : state.css;
    const js = state.editors.js ? state.editors.js.getValue() : state.js;

    // Inject console bridge and error handling
    const consoleBridge = `
<script>
(function() {
  const methods = ['log', 'info', 'warn', 'error', 'debug'];
  methods.forEach(method => {
    const original = console[method];
    console[method] = function(...args) {
      original.apply(console, args);
      try {
        parent.postMessage({
          type: 'console',
          method: method,
          args: args.map(a => {
            try {
              if (a instanceof Error) return a.message + '\\n' + a.stack;
              if (typeof a === 'object') return JSON.stringify(a, null, 2);
              return String(a);
            } catch(e) { return String(a); }
          })
        }, '*');
      } catch(e) {}
    };
  });
  window.addEventListener('error', function(e) {
    parent.postMessage({ type: 'console', method: 'error', args: [e.message + ' (line ' + e.lineno + ')'] }, '*');
  });
  window.addEventListener('unhandledrejection', function(e) {
    parent.postMessage({ type: 'console', method: 'error', args: ['Unhandled: ' + e.reason] }, '*');
  });
})();
</script>`;

    // Parse HTML and inject CSS + JS
    let doc = html;
    if (!doc.includes('<html') && !doc.includes('<!DOCTYPE')) {
      doc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${doc}</body></html>`;
    }

    // Inject CSS
    if (css.trim()) {
      if (doc.includes('</head>')) {
        doc = doc.replace('</head>', `<style>${css}</style></head>`);
      } else if (doc.includes('<head>')) {
        doc = doc.replace('<head>', `<head><style>${css}</style>`);
      } else {
        doc = `<style>${css}</style>` + doc;
      }
    }

    // Inject console bridge and JS before </body>
    const scriptBlock = consoleBridge + (js.trim() ? `<script>${js}</script>` : '');
    if (doc.includes('</body>')) {
      doc = doc.replace('</body>', scriptBlock + '</body>');
    } else {
      doc += scriptBlock;
    }

    return doc;
  }

  function runPreview() {
    const frame = $('#preview-frame');
    const doc = buildPreviewDocument();
    clearConsole();
    logToConsole('system', 'Preview updated');
    try {
      frame.srcdoc = doc;
      state.isRunning = true;
    } catch (e) {
      logToConsole('error', 'Failed to run preview: ' + e.message);
    }
  }

  function stopPreview() {
    const frame = $('#preview-frame');
    frame.srcdoc = '<!DOCTYPE html><html><body style="background:#1e1e1e;color:#666;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">Preview stopped</body></html>';
    state.isRunning = false;
    logToConsole('system', 'Preview stopped');
  }

  function schedulePreview() {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(runPreview, CONFIG.debounceDelay);
  }

  // ========== CONSOLE ==========
  function logToConsole(method, ...args) {
    const output = $('#console-output');
    const line = document.createElement('div');
    line.className = 'console-line ' + method;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    line.textContent = `[${time}] ${args.join(' ')}`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function clearConsole() {
    $('#console-output').innerHTML = '';
  }

  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'console') {
      logToConsole(e.data.method, ...e.data.args);
    }
  });

  // ========== PROJECT MANAGEMENT ==========
  function markDirty() {
    state.isDirty = true;
    const status = $('#save-status');
    status.textContent = 'Unsaved';
    status.className = 'save-status unsaved';
  }

  function markSaved() {
    state.isDirty = false;
    const status = $('#save-status');
    status.textContent = 'Saved';
    status.className = 'save-status';
  }

  async function saveCurrentProject() {
    if (!db) return;
    const status = $('#save-status');
    status.textContent = 'Saving...';
    status.className = 'save-status saving';

    const name = $('#project-name').value.trim() || 'Untitled Project';
    state.projectName = name;

    if (!state.projectId) {
      state.projectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }

    const project = {
      id: state.projectId,
      name: name,
      html: state.editors.html.getValue(),
      css: state.editors.css.getValue(),
      js: state.editors.js.getValue(),
      updatedAt: Date.now(),
      createdAt: state.createdAt || Date.now()
    };
    state.createdAt = project.createdAt;

    try {
      await saveProject(project);
      markSaved();
      showToast('Project saved', 'success');
    } catch (e) {
      showToast('Save failed: ' + e.message, 'error');
      status.textContent = 'Error';
    }
  }

  function loadProjectData(html, css, js, name, id) {
    state.html = html;
    state.css = css;
    state.js = js;
    state.projectName = name || 'Untitled Project';
    state.projectId = id || null;
    state.createdAt = null;
    $('#project-name').value = state.projectName;
    if (state.monacoReady) {
      state.editors.html.setValue(html);
      state.editors.css.setValue(css);
      state.editors.js.setValue(js);
    }
    markSaved();
    runPreview();
  }

  function newProject() {
    if (state.isDirty) {
      showConfirm('Unsaved changes will be lost. Continue?', () => {
        loadProjectData(CONFIG.defaultHtml, CONFIG.defaultCss, CONFIG.defaultJs, 'Untitled Project', null);
        showToast('New project created');
      });
    } else {
      loadProjectData(CONFIG.defaultHtml, CONFIG.defaultCss, CONFIG.defaultJs, 'Untitled Project', null);
      showToast('New project created');
    }
  }

  async function loadProjectsList() {
    const list = $('#projects-list');
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">Loading...</p>';
    try {
      const projects = await getAllProjects();
      projects.sort((a, b) => b.updatedAt - a.updatedAt);
      if (projects.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">No saved projects yet</p>';
        return;
      }
      list.innerHTML = projects.map(p => `
        <div class="project-item" data-id="${p.id}">
          <div class="project-item-info">
            <h3>${escapeHtml(p.name)}</h3>
            <span>${formatDate(p.updatedAt)}</span>
          </div>
          <div class="project-item-actions">
            <button class="dup" data-id="${p.id}" title="Duplicate">⎘</button>
            <button class="delete" data-id="${p.id}" title="Delete">✕</button>
          </div>
        </div>
      `).join('');

      list.querySelectorAll('.project-item').forEach(item => {
        item.addEventListener('click', async (e) => {
          if (e.target.closest('button')) return;
          const id = item.dataset.id;
          const proj = await getProject(id);
          if (proj) {
            loadProjectData(proj.html, proj.css, proj.js, proj.name, proj.id);
            state.createdAt = proj.createdAt;
            closeModal('projects');
            showToast('Project loaded');
          }
        });
      });

      list.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          showConfirm('Delete this project?', async () => {
            await deleteProject(btn.dataset.id);
            loadProjectsList();
            showToast('Project deleted');
          });
        });
      });

      list.querySelectorAll('.dup').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const proj = await getProject(btn.dataset.id);
          if (proj) {
            const newId = 'proj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            await saveProject({
              ...proj,
              id: newId,
              name: proj.name + ' (Copy)',
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
            loadProjectsList();
            showToast('Project duplicated');
          }
        });
      });
    } catch (e) {
      list.innerHTML = '<p style="color:var(--error)">Failed to load projects</p>';
    }
  }

  // ========== TEMPLATES ==========
  function renderTemplates() {
    const grid = $('#templates-grid');
    grid.innerHTML = TEMPLATES.map(t => `
      <div class="template-card" data-id="${t.id}">
        <div class="icon">${t.icon}</div>
        <h3>${t.name}</h3>
      </div>
    `).join('');

    grid.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const t = TEMPLATES.find(x => x.id === card.dataset.id);
        if (t) {
          if (state.isDirty) {
            showConfirm('Load template? Unsaved changes will be lost.', () => {
              loadProjectData(t.html, t.css, t.js, t.name, null);
              closeModal('templates');
              showToast('Template loaded: ' + t.name);
            });
          } else {
            loadProjectData(t.html, t.css, t.js, t.name, null);
            closeModal('templates');
            showToast('Template loaded: ' + t.name);
          }
        }
      });
    });
  }

  // ========== EXPORT / IMPORT ==========
  async function exportZip() {
    const zip = new JSZip();
    const name = (state.projectName || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const html = state.editors.html.getValue();
    const css = state.editors.css.getValue();
    const js = state.editors.js.getValue();

    // Build complete HTML file
    let fullHtml = html;
    if (!fullHtml.includes('<html')) {
      fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${escapeHtml(state.projectName)}</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n${html}\n<script src="script.js"><\/script>\n</body>\n</html>`;
    } else {
      // Inject links if not present
      if (!fullHtml.includes('styles.css') && css.trim()) {
        fullHtml = fullHtml.replace('</head>', '  <link rel="stylesheet" href="styles.css">\n</head>');
      }
      if (!fullHtml.includes('script.js') && js.trim()) {
        fullHtml = fullHtml.replace('</body>', '  <script src="script.js"><\/script>\n</body>');
      }
    }

    zip.file('index.html', fullHtml);
    zip.file('styles.css', css);
    zip.file('script.js', js);
    zip.file('README.md', `# ${state.projectName}\n\nExported from CODEX PLAYGROUND\n`);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, name + '.zip');
    showToast('Project exported as ZIP');
  }

  function downloadFile(lang) {
    const content = state.editors[lang].getValue();
    const ext = { html: 'html', css: 'css', js: 'js' }[lang];
    const mime = { html: 'text/html', css: 'text/css', js: 'text/javascript' }[lang];
    const blob = new Blob([content], { type: mime });
    saveAs(blob, `index.${ext}`);
    showToast(`${lang.toUpperCase()} downloaded`);
  }

  function importFiles(files) {
    const readers = [];
    let html = state.html, css = state.css, js = state.js;
    let name = state.projectName;

    Array.from(files).forEach(file => {
      readers.push(new Promise((resolve) => {
        if (file.name.endsWith('.zip')) {
          JSZip.loadAsync(file).then(zip => {
            const promises = [];
            zip.forEach((path, entry) => {
              if (path.endsWith('.html') || path === 'index.html') {
                promises.push(entry.async('string').then(c => { html = c; }));
              } else if (path.endsWith('.css') || path === 'styles.css') {
                promises.push(entry.async('string').then(c => { css = c; }));
              } else if (path.endsWith('.js') || path === 'script.js') {
                promises.push(entry.async('string').then(c => { js = c; }));
              }
            });
            Promise.all(promises).then(resolve);
          });
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result;
            if (file.name.endsWith('.html')) html = content;
            else if (file.name.endsWith('.css')) css = content;
            else if (file.name.endsWith('.js')) js = content;
            resolve();
          };
          reader.readAsText(file);
        }
      }));
    });

    Promise.all(readers).then(() => {
      loadProjectData(html, css, js, name, null);
      showToast('Files imported');
    });
  }

  // ========== UI HELPERS ==========
  function showToast(msg, type = '') {
    const toast = $('#toast');
    toast.textContent = msg;
    toast.className = type;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), 2500);
  }

  function showConfirm(message, onConfirm) {
    $('#confirm-message').textContent = message;
    openModal('confirm');
    const ok = $('#confirm-ok');
    const cancel = $('#confirm-cancel');
    const handler = () => {
      ok.removeEventListener('click', handler);
      closeModal('confirm');
      onConfirm();
    };
    ok.onclick = handler;
    cancel.onclick = () => closeModal('confirm');
  }

  function openModal(name) {
    $('#modal-overlay').classList.remove('hidden');
    $(`#${name}-modal`).classList.remove('hidden');
    if (name === 'projects') loadProjectsList();
    if (name === 'templates') renderTemplates();
  }

  function closeModal(name) {
    $(`#${name}-modal`).classList.add('hidden');
    const anyOpen = $$('.modal:not(.hidden)').length > 0;
    if (!anyOpen) $('#modal-overlay').classList.add('hidden');
  }

  function closeAllModals() {
    $$('.modal').forEach(m => m.classList.add('hidden'));
    $('#modal-overlay').classList.add('hidden');
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString();
  }

  // ========== RESIZERS ==========
  function initResizers() {
    // Horizontal resizer (editors | preview)
    const hResizer = $('#resizer-main');
    const editorsPanel = $('#editors-panel');
    let startX, startWidth;

    hResizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startX = e.clientX;
      startWidth = editorsPanel.offsetWidth;
      hResizer.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMove = (e) => {
        const dx = e.clientX - startX;
        const newWidth = Math.max(200, Math.min(window.innerWidth - 200, startWidth + dx));
        editorsPanel.style.width = newWidth + 'px';
      };
      const onUp = () => {
        hResizer.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        // Trigger Monaco layout
        Object.values(state.editors).forEach(ed => ed && ed.layout());
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Vertical resizers between editors
    ['resizer-html-css', 'resizer-css-js'].forEach(id => {
      const resizer = $(`#${id}`);
      if (!resizer) return;
      resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const containers = $$('#editors-panel .editor-container:not(.collapsed)');
        // Simplified: just allow flex growth
        resizer.classList.add('active');
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        const onUp = () => {
          resizer.classList.remove('active');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mouseup', onUp);
          Object.values(state.editors).forEach(ed => ed && ed.layout());
        };
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  // ========== MOBILE TABS ==========
  function initMobileTabs() {
    $$('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        state.currentTab = tab;
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Hide all
        $$('.editor-container').forEach(c => c.classList.remove('mobile-active'));
        $('#preview-panel').classList.remove('mobile-active');
        $('#console-panel').classList.remove('mobile-active');

        if (tab === 'html' || tab === 'css' || tab === 'js') {
          $(`#${tab}-container`).classList.add('mobile-active');
          if (state.editors[tab]) state.editors[tab].layout();
        } else if (tab === 'preview') {
          $('#preview-panel').classList.add('mobile-active');
        } else if (tab === 'console') {
          $('#console-panel').classList.add('mobile-active');
          $('#preview-panel').classList.add('mobile-active'); // show console under preview context
          // On mobile console tab, show only console
          $('#preview-panel').style.display = 'flex';
          $('#preview-frame-wrapper').style.display = 'none';
          $('#console-panel').style.display = 'flex';
          $('#console-panel').style.height = '100%';
        }

        // Reset preview display when leaving console
        if (tab !== 'console') {
          $('#preview-frame-wrapper').style.display = '';
          $('#console-panel').style.height = '';
        }
      });
    });
  }

  // ========== VIEWPORT CONTROLS ==========
  function setViewport(size) {
    const frame = $('#preview-frame');
    const wrapper = $('#preview-frame-wrapper');
    $$('.viewport-btn').forEach(b => b.classList.remove('active'));
    event?.target?.closest('.viewport-btn')?.classList.add('active') || 
      $$(`.viewport-btn[data-size="${size}"]`)[0]?.classList.add('active');

    if (size === '100%') {
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.classList.remove('viewport-constrained');
      wrapper.style.padding = '0';
    } else {
      const [w, h] = size.split('x').map(Number);
      frame.style.width = w + 'px';
      frame.style.height = h + 'px';
      frame.classList.add('viewport-constrained');
      wrapper.style.padding = '16px';
    }
    state.viewport = size;
  }

  // ========== SETTINGS ==========
  function applySettings() {
    const fontSize = +$('#font-size').value;
    CONFIG.fontSize = fontSize;
    $('#font-size-value').textContent = fontSize + 'px';
    CONFIG.autoRun = $('#auto-run').checked;
    CONFIG.debounceDelay = +$('#debounce-delay').value || 400;
    CONFIG.wordWrap = $('#word-wrap').checked;
    CONFIG.minimap = $('#minimap').checked;
    const theme = $('#editor-theme').value;

    Object.values(state.editors).forEach(ed => {
      if (!ed) return;
      ed.updateOptions({
        fontSize: fontSize,
        wordWrap: CONFIG.wordWrap ? 'on' : 'off',
        minimap: { enabled: CONFIG.minimap }
      });
      const isLight = document.body.classList.contains('theme-light');
      ed.updateOptions({ theme: isLight ? 'codex-light' : (theme === 'vs' ? 'codex-light' : theme === 'hc-black' ? 'hc-black' : 'codex-dark') });
    });

    localStorage.setItem('codex-settings', JSON.stringify({
      fontSize, autoRun: CONFIG.autoRun, debounceDelay: CONFIG.debounceDelay,
      wordWrap: CONFIG.wordWrap, minimap: CONFIG.minimap, theme
    }));
  }

  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem('codex-settings') || '{}');
      if (s.fontSize) { CONFIG.fontSize = s.fontSize; $('#font-size').value = s.fontSize; $('#font-size-value').textContent = s.fontSize + 'px'; }
      if (typeof s.autoRun === 'boolean') { CONFIG.autoRun = s.autoRun; $('#auto-run').checked = s.autoRun; }
      if (s.debounceDelay) { CONFIG.debounceDelay = s.debounceDelay; $('#debounce-delay').value = s.debounceDelay; }
      if (typeof s.wordWrap === 'boolean') { CONFIG.wordWrap = s.wordWrap; $('#word-wrap').checked = s.wordWrap; }
      if (typeof s.minimap === 'boolean') { CONFIG.minimap = s.minimap; $('#minimap').checked = s.minimap; }
      if (s.theme) $('#editor-theme').value = s.theme;
    } catch (e) {}
  }

  // ========== THEME ==========
  function toggleTheme() {
    document.body.classList.toggle('theme-light');
    document.body.classList.toggle('theme-dark');
    const isLight = document.body.classList.contains('theme-light');
    Object.values(state.editors).forEach(ed => {
      if (ed) ed.updateOptions({ theme: isLight ? 'codex-light' : 'codex-dark' });
    });
    localStorage.setItem('codex-theme', isLight ? 'light' : 'dark');
  }

  // ========== FORMAT ==========
  function formatCode() {
    Object.values(state.editors).forEach(ed => {
      if (ed) {
        ed.getAction('editor.action.formatDocument')?.run();
      }
    });
    showToast('Code formatted');
  }

  // ========== EVENT BINDINGS ==========
  function bindEvents() {
    $('#btn-run').addEventListener('click', runPreview);
    $('#btn-stop').addEventListener('click', stopPreview);
    $('#btn-refresh').addEventListener('click', runPreview);
    $('#btn-new').addEventListener('click', newProject);
    $('#btn-save').addEventListener('click', saveCurrentProject);
    $('#btn-projects').addEventListener('click', () => openModal('projects'));
    $('#btn-templates').addEventListener('click', () => openModal('templates'));
    $('#btn-export').addEventListener('click', exportZip);
    $('#btn-import').addEventListener('click', () => $('#import-file').click());
    $('#btn-format').addEventListener('click', formatCode);
    $('#btn-theme').addEventListener('click', toggleTheme);
    $('#btn-settings').addEventListener('click', () => openModal('settings'));
    $('#btn-clear-console').addEventListener('click', clearConsole);
    $('#btn-toggle-console').addEventListener('click', () => {
      $('#console-panel').classList.toggle('collapsed');
    });
    $('#btn-fullscreen-preview').addEventListener('click', () => {
      document.body.classList.toggle('preview-fullscreen');
    });

    // Viewport buttons
    $$('.viewport-btn[data-size]').forEach(btn => {
      btn.addEventListener('click', () => setViewport(btn.dataset.size));
    });

    // Editor actions
    $$('.editor-btn[data-action="copy"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        navigator.clipboard.writeText(state.editors[lang].getValue());
        showToast(lang.toUpperCase() + ' copied');
      });
    });
    $$('.editor-btn[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', () => downloadFile(btn.dataset.lang));
    });
    $$('.collapse-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const container = $(`#${btn.dataset.lang}-container`);
        container.classList.toggle('collapsed');
        btn.textContent = container.classList.contains('collapsed') ? '+' : '−';
        Object.values(state.editors).forEach(ed => ed && ed.layout());
      });
    });

    // Project name
    $('#project-name').addEventListener('input', () => {
      state.projectName = $('#project-name').value;
      markDirty();
    });
    $('#project-name').addEventListener('change', () => {
      if (state.projectId) saveCurrentProject();
    });

    // Settings
    $('#font-size').addEventListener('input', applySettings);
    $('#auto-run').addEventListener('change', applySettings);
    $('#debounce-delay').addEventListener('change', applySettings);
    $('#word-wrap').addEventListener('change', applySettings);
    $('#minimap').addEventListener('change', applySettings);
    $('#editor-theme').addEventListener('change', applySettings);

    // Modals
    $$('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.modal));
    });
    $('#modal-overlay').addEventListener('click', (e) => {
      if (e.target === $('#modal-overlay')) closeAllModals();
    });

    // Import
    $('#import-file').addEventListener('change', (e) => {
      if (e.target.files.length) importFiles(e.target.files);
      e.target.value = '';
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runPreview();
      }
      if (e.key === 'Escape') {
        if (document.body.classList.contains('preview-fullscreen')) {
          document.body.classList.remove('preview-fullscreen');
        } else {
          closeAllModals();
        }
      }
    });

    // Auto-save on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && state.isDirty && state.projectId) {
        saveCurrentProject();
      }
    });
  }

  // ========== INIT ==========
  async function init() {
    if (window.CODEX_ACCESS_READY) {
      const allowed = await window.CODEX_ACCESS_READY;
      if (!allowed) return;
    }
    // Theme
    const savedTheme = localStorage.getItem('codex-theme');
    if (savedTheme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }

    loadSettings();
    $$('.editor-wrapper').forEach(el => el.classList.add('loading'));

    try {
      await openDB();
    } catch (e) {
      console.warn('IndexedDB unavailable', e);
    }

    bindEvents();
    initResizers();
    initMobileTabs();

    // Default mobile tab
    if (window.innerWidth <= 768) {
      $('#html-container').classList.add('mobile-active');
    }

    await initMonaco();
    runPreview();
    showToast('CODEX PLAYGROUND ready');
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
