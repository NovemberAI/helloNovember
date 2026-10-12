const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const wave = () => Array.from({ length: 9 }, (_, i) => `<i style="--height:${[6, 11, 16, 9, 18, 13, 7, 14, 8][i]}px;--delay:${-i * .13}s"></i>`).join('');
const renderWaves = () => $$('.waveform').forEach(el => { el.innerHTML = wave(); });
const steps = ['Ready to listen', 'Listening', 'Making a plan', 'Working · speaking', 'Reporting back', 'Done'];
const examples = [
  {
    prompt: '“Add my usual groceries to my Walmart cart.”',
    plans: ['Open your Walmart account', 'Recall your usual groceries', 'Find your preferred brands', 'Add everything to your cart', 'Read back what’s ready'],
    memory: 'Oat milk · Wholegrain · Your usual brands',
    urls: ['about:blank', 'about:blank', 'walmart.com', 'walmart.com/cart', 'walmart.com/cart', 'walmart.com/cart'],
    speech: ['“Hey. What can I do for you?”', '“Your usual groceries. Got it.”', '“I’ll find your usual brands and build your cart.”', '“Oat milk and coffee are in. Finding your usual bread.”', '“Your cart is ready: oat milk, coffee, bread, and blueberries.”', '“Everything’s in your cart, ready when you are.”'],
    activities: ['Waiting for your voice', 'Understanding your request', 'Finding your preferred brands', 'Adding your usual groceries…', '4 items ready in your cart', 'Cart saved · ready to review'],
  },
  {
    prompt: '“Update Airtable with the brand deals that just signed.”',
    plans: ['Open your brand deals base', 'Find the signed agreements', 'Match them to your records', 'Update status and next steps', 'Report what changed'],
    memory: 'Creator partnerships · Your deal tracker',
    urls: ['about:blank', 'about:blank', 'airtable.com', 'airtable.com/partnerships', 'airtable.com/partnerships', 'airtable.com/partnerships'],
    speech: ['“Hey. What are we working on?”', '“Your signed brand deals. I’m on it.”', '“I’ll match the agreements to your partnership records.”', '“The YouTube deal is marked signed. Updating the X partnership next.”', '“Both deals are marked signed, with the next deliverables added.”', '“Your Airtable is up to date. I’ll remind you before the deliverables are due.”'],
    activities: ['Waiting for your voice', 'Understanding your request', 'Matching signed agreements', 'Updating 1 of 2 deal records…', '2 deals updated · next steps added', 'Partnership tracker is up to date'],
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

function browserMarkup() {
  const executing = step >= 3;
  const complete = step >= 4;
  if (scenario === 0) {
    return `<div class="browser-brand"><b class="walmart-mark">✳</b> Walmart · Your cart</div><h4>${complete ? 'Your usuals, ready.' : 'A little less to do.'}</h4><p class="browser-subtitle">${complete ? '4 items · ready to review' : 'Adding your preferred brands'}</p><div class="cart-items">${[['🥛', 'Oat milk', 'Your usual brand'], ['☕', 'Ground coffee', 'Medium roast'], ['🍞', 'Wholegrain bread', 'Your usual loaf'], ['🫐', 'Blueberries', 'Fresh · 1 pack']].map(([icon, name, detail], i) => `<div class="cart-item ${!complete && (!executing || i > 1) ? 'cart-pending' : ''}"><span class="cart-thumb" aria-hidden="true">${icon}</span><span><b>${name}</b><small>${detail}</small></span><span class="cart-state">${complete || executing && i < 2 ? '✓' : '…'}</span></div>`).join('')}</div><div class="mock-submit">${complete ? '✓ Cart ready — review anytime' : 'Building your cart…'}</div>`;
  }
  if (scenario === 1) return `<div class="browser-brand"><b class="airtable-mark">▦</b> Airtable · Partnerships</div><h4>Your deals, in sync.</h4><p class="browser-subtitle">${complete ? '2 of 2 records updated' : 'Matching signed agreements'}</p><div class="airtable-grid"><div class="airtable-row table-head"><span>Partnership</span><span>Status</span></div><div class="airtable-row"><span>YouTube brand deal</span><span class="deal-status ${executing ? 'signed' : ''}">${executing ? 'Signed' : 'Review'}</span></div><div class="airtable-row"><span>X partnership</span><span class="deal-status ${complete ? 'signed' : ''}">${complete ? 'Signed' : 'Updating'}</span></div></div><p class="success-copy">${complete ? 'Next deliverables added. Reminders set.' : 'Checking agreement details and next deliverables.'}</p><div class="mock-submit">${complete ? '✓ Your tracker is up to date' : 'Updating your records…'}</div>`;
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
    title: 'Just ask.<br> It gets moving.',
    description: 'Hands-free conversation and voice execution, together. Say what you need, make changes as you go, and hear November talk you through the work.',
    bullets: ['Your words become a working plan', 'Listens and talks back while it acts', 'Takes corrections without starting over'],
    visual: `<div class="chat-you"><div class="chat-label">YOU</div>“Add my usual groceries to Walmart. Make the milk oat this time.”</div><div class="chat-november"><img src="assets/november-mascot.png" alt=""><div class="chat-message"><div class="speech-heading"><span class="waveform" aria-hidden="true"></span><span class="mono">NOVEMBER · WORKING & SPEAKING</span></div>“Oat milk it is. Coffee’s in your cart — finding your usual bread now.”</div></div><div class="feature-plan merged-plan"><div><b>✓</b> Find your preferred brands</div><div><b>✓</b> Swap dairy milk for oat</div><div class="working"><span class="waveform" aria-hidden="true"></span> Add the rest to your cart</div></div>`,
  },
  {
    title: 'The whole browser.<br> Without the tab juggling.',
    description: 'A real browser in the cloud. November signs in, reads, clicks, types, and moves between sites. Your laptop can sleep.',
    bullets: ['Works across the sites you already use', 'Updates records and fills forms', 'Keeps going in the cloud'],
    visual: `<div class="log-window"><div class="log-title"><span>◉ CHROMIUM / CLOUD SESSION</span><span>US-WEST</span></div><div class="log-row"><span>00:04</span><b>open</b><em>Airtable · Partnerships</em></div><div class="log-row"><span>00:11</span><b>read</b><em>2 signed brand agreements</em></div><div class="log-row"><span>00:26</span><b>match</b><em>YouTube + X partnerships</em></div><div class="log-row"><span>00:33</span><b>update</b><em>YouTube deal → Signed</em></div><div class="log-row current"><span>00:42</span><b>write</b><em>X deal · next deliverables</em></div></div><div class="cloud-footnote mono"><span>YOUR LAPTOP: ASLEEP</span><span>NOVEMBER: WORKING ↗</span></div>`,
  },
  {
    title: 'Picks up where<br> you left off.',
    description: 'An ongoing conversation, with local, stateful memory. November remembers your preferences and takes corrections in stride.',
    bullets: ['Remembers the details that matter', 'Takes a change of plan mid-task', 'Context stays with you, locally'],
    visual: `<div class="chat-you"><div class="chat-label">YOU · MID-TASK</div>“Actually, oat milk from now on. Same coffee as last time.”</div><div class="chat-november"><img src="assets/november-mascot.png" alt=""><div class="chat-message"><div class="speech-heading"><span class="waveform" aria-hidden="true"></span><span class="mono">NOVEMBER</span></div>“Oat milk, remembered. Your usual medium roast is already in the cart.”</div></div><div class="memory-box"><div class="mono"><span>YOUR MEMORY</span><span>ON DEVICE ↗</span></div><div class="memory-pairs"><span>milk</span><b>Oat</b><span>coffee</span><b>Medium roast</b><span>bread</span><b>Wholegrain</b></div></div>`,
  },
  {
    title: 'The update you<br> were waiting for.',
    description: 'Hear what’s happening while November works — and when something changes. A brand deal signed. A video passing 10K. No dashboard refresh required.',
    bullets: ['Live progress on your brand deals', 'Speaks up at the milestones you set', 'Revisit and replay the results'],
    visual: `<div class="progress-card"><div><span>UPDATING AIRTABLE · SPEAKING</span><span>01 / 02</span></div><h4>Your brand deals are moving.</h4><div class="progress-meter"><span></span></div><div class="speech-heading"><span class="waveform" aria-hidden="true"></span>“YouTube deal marked signed. Updating the X partnership next.”</div></div><div class="history-item"><div>YouTube brand deal signed<span>AGREEMENT CONFIRMED · TRACKER UPDATED</span></div><button data-replay="deal">▷ REPLAY</button></div><div class="history-item"><div>Your video just passed 10,000 views<span>YOUTUBE · MILESTONE REACHED</span></div><button data-replay="views">▷ REPLAY</button></div><div class="history-item"><div>X partnership signed<span>NEXT DELIVERABLES ADDED TO AIRTABLE</span></div><button data-replay="partnership">▷ REPLAY</button></div><p id="replay-status" class="replay-status" role="status"></p>`,
  },
];
const replayMessages = {
  deal: '“Your YouTube brand deal is signed. I’ve updated the status in Airtable.”',
  views: '“Your video just passed ten thousand views.”',
  partnership: '“Your X partnership is signed too. The next deliverables are in your tracker.”',
};

function renderFeature(index) {
  feature = index;
  const item = features[index];
  $('#feature-title').innerHTML = item.title;
  $('#feature-description').textContent = item.description;
  $('#feature-number').textContent = `0${index + 1} / 0${features.length}`;
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
  const text = replayMessages[button.dataset.replay];
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
  $('#hardware-form').textContent = mode === 'desk' ? 'Desktop droplet' : 'Droplet pendant';
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
