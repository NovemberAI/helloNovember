const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const wave = () => Array.from({ length: 9 }, (_, i) => `<i style="--height:${[6, 11, 16, 9, 18, 13, 7, 14, 8][i]}px;--delay:${-i * .13}s"></i>`).join('');
const renderWaves = () => $$('.waveform').forEach(el => { el.innerHTML = wave(); });
const steps = ['Ready to listen', 'Listening', 'Making a plan', 'Working · speaking', 'Reporting back', 'Done'];
const examples = [
  {
    prompt: '“Sign me up for the Fall Career Fair.”',
    plans: ['Open the career fair page', 'Fill in your details', 'Choose your interests', 'Complete registration', 'Add it to your calendar'],
    memory: 'Computer science · Class of ’28',
    urls: ['about:blank', 'about:blank', 'careers.asu.edu', 'careers.asu.edu', 'calendar.google.com', 'calendar.google.com'],
    speech: ['“Hey. What can I do for you?”', '“I’m listening.”', '“I’ll sign you up using your saved details.”', '“I’ve got your details. Picking your interests now.”', '“You’re registered. Wednesday at ten — it’s on your calendar.”', '“All done. Your afternoon is still free.”'],
    activities: ['Waiting for your voice', 'Understanding your request', 'Opening the registration page', 'Filling in your interests…', 'Registration confirmed · calendar updated', 'Result saved to your history'],
  },
  {
    prompt: '“Put every due date from my syllabi in one doc.”',
    plans: ['Open your course dashboard', 'Read all three syllabi', 'Collect the due dates', 'Sort and write one document', 'Save it to your Drive'],
    memory: 'CSE 310 · MAT 343 · ENG 302',
    urls: ['about:blank', 'about:blank', 'canvas.asu.edu', 'docs.google.com', 'docs.google.com', 'docs.google.com'],
    speech: ['“Hey. What are we working on?”', '“Every course, in one place. Got it.”', '“I’ll read your three syllabi and organize the deadlines.”', '“I found thirty-one dates. Putting them in order now.”', '“Your semester is in one doc, sorted by date.”', '“Saved to your Drive. You can ask me about any deadline.”'],
    activities: ['Waiting for your voice', 'Understanding your request', 'Reading 3 syllabi', 'Writing 18 of 31 deadlines…', 'All 31 deadlines saved', 'Document ready to revisit'],
  },
  {
    prompt: '“Tell me when my new video hits ten thousand views.”',
    plans: ['Open YouTube Studio', 'Find your latest video', 'Read the current view count', 'Watch for the milestone', 'Tell you when it happens'],
    memory: 'Latest upload · Milestone: 10K views',
    urls: ['about:blank', 'about:blank', 'studio.youtube.com', 'studio.youtube.com', 'studio.youtube.com', 'studio.youtube.com'],
    speech: ['“Hey. I’m here.”', '“Ten thousand views. I’m on it.”', '“I’ll find your latest upload and keep an eye on it.”', '“You’re at nine thousand eight hundred. I’ll let you know.”', '“Your video just passed ten thousand views.”', '“A milestone worth stepping away from your screen for.”'],
    activities: ['Waiting for your voice', 'Understanding your request', 'Opening YouTube Studio', 'Watching for your milestone…', '10,024 views · milestone reached', 'Spoken update delivered'],
  },
];
let scenario = 0;
let step = 3;
let isPlaying = !reduceMotion.matches;
let timer;
let speechUtterance;
let feature = 0;

function field(label, value, filled) {
  return `<label>${label}<div class="mock-field ${filled ? 'filled' : ''}">${filled ? value : '—'}</div></label>`;
}

function browserMarkup() {
  const executing = step >= 3;
  const complete = step >= 4;
  if (scenario === 0) {
    if (complete) return '<div class="browser-brand"><b style="background:#377cf1">31</b> Calendar · Wed, Oct 21</div><div class="success-mark">✓</div><h4>Fall Career Fair</h4><p class="browser-subtitle">10:00 AM – 3:00 PM · Memorial Union</p><p class="success-copy">Registration confirmed.<br> Added to your calendar by November.</p>';
    return `<div class="browser-brand"><b>ASU</b> Career Services</div><h4>Fall Career Fair</h4><p class="browser-subtitle">A next step, taken for you.</p><div class="mock-fields">${field('FULL NAME', 'Maya Patel', executing)}${field('MAJOR', 'Computer science', executing)}</div><div class="mock-tags"><span class="${executing ? 'selected' : ''}">Software</span><span class="${executing ? 'selected' : ''}">Product</span><span>Data</span><span>Design</span></div><div class="mock-submit">${executing ? 'Completing registration →' : 'Registration'}</div>`;
  }
  if (scenario === 1) return `<div class="browser-brand"><b style="background:#377cf1">▤</b> ${step < 3 ? 'Canvas · Course documents' : 'Google Docs · Saved to Drive'}</div><h4>Every deadline. One place.</h4><p class="browser-subtitle">Fall semester · ${complete ? '31 of 31' : executing ? '18 of 31' : 'Collecting'} due dates</p><div class="doc-line"><b>Oct 16</b><span>CSE 310 · Graph algorithms</span></div><div class="doc-line ${executing ? '' : 'dim'}"><b>Oct 19</b><span>MAT 343 · Problem set 6</span></div><div class="doc-line ${executing ? '' : 'dim'}"><b>Oct 23</b><span>ENG 302 · Research draft</span></div><div class="mock-submit">${complete ? '✓ All deadlines organized' : executing ? 'Writing your document…' : 'Reading your syllabi…'}</div>`;
  return `<div class="browser-brand"><b style="background:#d3424a">▶</b> YouTube Studio</div><p class="browser-subtitle">YOUR LATEST UPLOAD · VIEWS</p><div class="milestone-number">${complete ? '10,024' : executing ? '9,800' : '9,642'}</div><div class="chart" aria-hidden="true">${[17, 24, 21, 34, 42, 38, 52, 57, 67, 80, 91, 100].map(h => `<i style="--bar:${h}%"></i>`).join('')}</div><p class="browser-subtitle">${complete ? '↗ 10K milestone reached' : 'Watching for 10,000 views'}</p>`;
}

function renderDemo() {
  const example = examples[scenario];
  const done = [0, 0, 0, 2, 5, 5][step];
  $('#user-prompt').textContent = step === 0 ? '“Hey November.”' : example.prompt;
  $('#voice-state').textContent = steps[step].toUpperCase();
  $('#spoken-response').textContent = example.speech[step];
  $('#memory-context').textContent = example.memory;
  $('#browser-url').textContent = example.urls[step];
  $('#browser-activity').textContent = example.activities[step];
  $('#browser-content').innerHTML = browserMarkup();
  $('#plan-counter').textContent = `${step >= 4 ? 5 : done} OF 5`;
  $('#plan-list').innerHTML = example.plans.map((plan, index) => {
    const state = index < done ? 'complete' : index === done && step >= 2 ? 'active' : '';
    return `<li class="${state}"><span class="step-icon" aria-hidden="true">${state === 'complete' ? '✓' : state === 'active' ? '•' : String(index + 1).padStart(2, '0')}</span>${plan}</li>`;
  }).join('');
  $$('.timeline-steps button').forEach((button, index) => {
    if (index === step) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $('.execution-demo').dataset.speaking = String([1, 3, 4].includes(step));
  $('.execution-demo').dataset.paused = String(!isPlaying);
  $('#play-toggle').innerHTML = isPlaying ? 'Ⅱ <span>Pause</span>' : '▷ <span>Play</span>';
  $('#play-toggle').setAttribute('aria-label', isPlaying ? 'Pause demo' : 'Play demo');
  $('#hear-demo').setAttribute('aria-label', 'Hear November’s response');
}

function schedule() {
  clearTimeout(timer);
  if (!isPlaying || document.hidden) return;
  timer = setTimeout(() => {
    step = (step + 1) % 6;
    if (step === 0) setScenario((scenario + 1) % examples.length, false);
    renderDemo();
    schedule();
  }, step === 3 ? 6500 : step === 4 || step === 5 ? 4400 : 2500);
}

function stopSpeech() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  speechUtterance = undefined;
  $('#hear-demo').setAttribute('aria-label', 'Hear November’s response');
}

function pauseDemo() {
  isPlaying = false;
  clearTimeout(timer);
  stopSpeech();
}

function setScenario(index, manual = true) {
  if (manual) { pauseDemo(); step = 3; }
  scenario = index;
  $$('[data-scenario]').forEach((button, i) => {
    button.setAttribute('aria-selected', String(index === i));
    button.tabIndex = index === i ? 0 : -1;
  });
  $('#scenario-panel').setAttribute('aria-labelledby', `scenario-${index}`);
  renderDemo();
}

$$('[data-scenario]').forEach(button => button.addEventListener('click', () => setScenario(Number(button.dataset.scenario))));
$$('[data-step]').forEach(button => button.addEventListener('click', () => { pauseDemo(); step = Number(button.dataset.step); renderDemo(); }));
$('#play-toggle').addEventListener('click', () => {
  stopSpeech();
  isPlaying = !isPlaying;
  renderDemo();
  schedule();
});

function speak(text, onEnd) {
  if (!('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();
  speechUtterance = new SpeechSynthesisUtterance(text.replace(/[“”]/g, ''));
  speechUtterance.lang = 'en-US';
  speechUtterance.rate = .96;
  speechUtterance.onend = onEnd;
  speechUtterance.onerror = onEnd;
  speechSynthesis.speak(speechUtterance);
  return true;
}

$('#hear-demo').addEventListener('click', () => {
  if ('speechSynthesis' in window && speechSynthesis.speaking) { stopSpeech(); return; }
  isPlaying = false;
  clearTimeout(timer);
  renderDemo();
  if (speak(examples[scenario].speech[step], () => {
    $('.execution-demo').dataset.paused = 'true';
    $('#hear-demo').setAttribute('aria-label', 'Hear November’s response');
  })) {
    $('.execution-demo').dataset.paused = 'false';
    $('.execution-demo').dataset.speaking = 'true';
    $('#hear-demo').setAttribute('aria-label', 'Stop spoken response');
  } else {
    $('#hear-demo').title = 'Audio playback is unavailable in this browser. Read the response below.';
  }
});

const features = [
  {
    title: 'A conversation.<br> Not a command line.',
    description: 'You talk, it talks back. Carry on with your day while November works — and speaks up when something worth knowing happens.',
    bullets: ['Hands-free, in both directions', 'Talks back while it works', 'Speaks up when things happen'],
    visual: `<div class="chat-you"><div class="chat-label">YOU</div>“Hey November, anything new?”</div><div class="chat-november"><img src="assets/november-mascot.png" alt=""><div class="chat-message"><div class="speech-heading"><span class="waveform" aria-hidden="true"></span><span class="mono">NOVEMBER · SPEAKING</span></div>“Your video just passed 10,000 views. And that brand deal? It’s signed.”</div></div><div class="proactive-alert"><div class="proactive-label mono">SPEAKS FIRST. WATCHING FOR YOU.</div><div class="alert-line"><span class="alert-icon">𝕏</span><span>Your post just crossed 1,000 likes.</span><time>JUST NOW</time></div><div class="alert-line"><span class="alert-icon">↗</span><span>Saturday’s tickets dropped below $150.</span><time>2 MIN AGO</time></div></div>`,
  },
  {
    title: 'Your words.<br> A working plan.',
    description: 'Say it the way you normally would. November picks out what matters, turns it into steps, and follows through.',
    bullets: ['Natural language, down to the details', 'One request across multiple sites', 'A running conversation as it executes'],
    visual: `<div class="chat-label">ONE SENTENCE → FOUR STEPS</div><div class="sentence-parts"><div>“Book a study room<span>TASK</span></div><div>at Hayden<span>WHERE</span></div><div>tomorrow at 3<span>WHEN</span></div><div>for two hours.”<span>DURATION</span></div></div><div class="feature-plan"><div><b>✓</b> Open the library’s booking page</div><div><b>✓</b> Filter: Hayden · 3–5 PM</div><div><b>✓</b> Find a quiet room</div><div class="working"><span class="waveform" aria-hidden="true"></span> “Room 412 is open. Booking it now.”</div></div>`,
  },
  {
    title: 'The whole browser.<br> Without the tab juggling.',
    description: 'A real browser in the cloud. November signs in, reads, clicks, types, and moves between sites. Your laptop can sleep.',
    bullets: ['Works across the sites you already use', 'Reads documents and fills forms', 'Keeps going in the cloud'],
    visual: `<div class="log-window"><div class="log-title"><span>◉ CHROMIUM / CLOUD SESSION</span><span>US-WEST</span></div><div class="log-row"><span>00:04</span><b>sign in</b><em>canvas.asu.edu · ••••••••</em></div><div class="log-row"><span>00:11</span><b>read</b><em>CSE 310 › Syllabus.pdf</em></div><div class="log-row"><span>00:26</span><b>extract</b><em>3 syllabi · 31 due dates</em></div><div class="log-row"><span>00:33</span><b>open</b><em>docs.google.com · new doc</em></div><div class="log-row current"><span>00:42</span><b>write</b><em>Sorted by date · 18 of 31</em></div></div><div class="cloud-footnote mono"><span>YOUR LAPTOP: ASLEEP</span><span>NOVEMBER: WORKING ↗</span></div>`,
  },
  {
    title: 'Picks up where<br> you left off.',
    description: 'An ongoing conversation, with local, stateful memory. November remembers your preferences and takes corrections in stride.',
    bullets: ['Remembers the details that matter', 'Takes a change of plan mid-task', 'Context stays with you, locally'],
    visual: `<div class="chat-you"><div class="chat-label">YOU · MID-TASK</div>“Actually, make it 4 to 6. Somewhere quiet.”</div><div class="chat-november"><img src="assets/november-mascot.png" alt=""><div class="chat-message"><div class="speech-heading"><span class="waveform" aria-hidden="true"></span><span class="mono">NOVEMBER</span></div>“Four to six at Hayden. Quiet floor, like last time.”</div></div><div class="memory-box"><div class="mono"><span>YOUR MEMORY</span><span>ON DEVICE ↗</span></div><div class="memory-pairs"><span>library</span><b>Hayden</b><span>preference</span><b>Quiet floors</b><span>study time</span><b>Afternoons</b></div></div>`,
  },
  {
    title: 'In the loop.<br> Out of the browser.',
    description: 'It narrates as it works. Ask “how’s it going?” anytime, or come back to a result when you’re ready.',
    bullets: ['Spoken updates during execution', 'Follow along on your devices', 'Results you can revisit and replay'],
    visual: `<div class="progress-card"><div><span>WORKING · SPEAKING</span><span>02 / 03</span></div><h4>Renewing your library books</h4><div class="progress-meter"><span></span></div><div class="speech-heading"><span class="waveform" aria-hidden="true"></span>“Two done. About a minute left.”</div></div><div class="history-item"><div>Registered for Fall Career Fair<span>WED, OCT 21 · 10 AM</span></div><button data-replay="0">▷ REPLAY</button></div><div class="history-item"><div>31 due dates → one document<span>SAVED TO YOUR DRIVE</span></div><button data-replay="1">▷ REPLAY</button></div><p id="replay-status" class="replay-status" role="status"></p>`,
  },
];

function renderFeature(index) {
  feature = index;
  const item = features[index];
  $('#feature-title').innerHTML = item.title;
  $('#feature-description').textContent = item.description;
  $('#feature-number').textContent = `0${index + 1} / 05`;
  $('#feature-bullets').innerHTML = item.bullets.map(text => `<li>${text}</li>`).join('');
  $('#feature-visual').innerHTML = item.visual;
  $('#feature-panel').setAttribute('aria-labelledby', `feature-${index}`);
  $$('[data-feature]').forEach((button, i) => {
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
  });
  renderWaves();
}
$$('[data-feature]').forEach(button => button.addEventListener('click', () => renderFeature(Number(button.dataset.feature))));

// Tabs support the standard Left/Right/Home/End keyboard pattern.
function keyboardTabs(selector, select) {
  const buttons = $$(selector);
  buttons.forEach((button, i) => button.addEventListener('keydown', event => {
    const indices = { ArrowRight: (i + 1) % buttons.length, ArrowLeft: (i + buttons.length - 1) % buttons.length, Home: 0, End: buttons.length - 1 };
    if (!(event.key in indices)) return;
    event.preventDefault();
    const index = indices[event.key];
    select(index);
    buttons[index].focus();
  }));
}
keyboardTabs('[data-scenario]', setScenario);
keyboardTabs('[data-feature]', renderFeature);

$('#feature-visual').addEventListener('click', event => {
  const button = event.target.closest('[data-replay]');
  if (!button) return;
  const text = examples[Number(button.dataset.replay)].speech[4];
  const status = $('#replay-status');
  status.textContent = text;
  isPlaying = false;
  clearTimeout(timer);
  renderDemo();
  speak(text, () => {});
});

$$('[data-hardware]').forEach(button => button.addEventListener('click', () => {
  const mode = button.dataset.hardware;
  $$('[data-hardware]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  $('.device-scene').dataset.mode = mode;
  $('.device-scene').setAttribute('aria-label', `Concept illustration of the NovemberAI ${mode === 'desk' ? 'desk stand' : 'pendant'}`);
  $('#hardware-form').textContent = mode === 'desk' ? 'Desk-side dock' : 'Wearable pendant';
  $('#setup-number').textContent = mode === 'desk' ? '02' : '01';
  $('#device-caption').textContent = mode === 'desk' ? 'ON YOUR DESK. ALWAYS WITHIN REACH.' : 'CLIPS ON. GOES EVERYWHERE.';
}));

$('#waitlist-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  $('#form-status').textContent = 'Thanks for trying the preview. Your email has not been sent or saved; registration will open when the waitlist is connected.';
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { clearTimeout(timer); stopSpeech(); }
  else schedule();
});
reduceMotion.addEventListener('change', event => {
  if (event.matches) { pauseDemo(); renderDemo(); }
});
window.addEventListener('pagehide', () => { clearTimeout(timer); stopSpeech(); });

renderDemo();
renderFeature(feature);
schedule();
