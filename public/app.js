const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const wave = () => Array.from({ length: 9 }, (_, i) => `<i style="--height:${[6, 11, 16, 9, 18, 13, 7, 14, 8][i]}px;--delay:${-i * .13}s"></i>`).join('');
const renderWaves = () => $$('.waveform').forEach(el => { el.innerHTML = wave(); });
const examples = [
  {
    url: 'walmart.com/cart',
    activity: 'Adding your usual groceries',
    result: '4 items narrated · approved by voice',
    turns: [
      ['you', 'Hey November, add my usual groceries to my Walmart cart.'],
      ['november', 'Of course. Your usual milk, medium-roast coffee, wholegrain bread, and blueberries?'],
      ['you', 'Yes, but make the milk oat. Remember that for next time, too.'],
      ['november', 'Oat milk remembered. Your cart has oat milk, medium-roast coffee, wholegrain bread, and blueberries. Does that all sound right?'],
      ['you', 'Yes, that all sounds right. I approve.'],
      ['november', 'Got it — all four items approved. Your cart is saved, and oat milk is your usual from now on.'],
    ],
  },
  {
    url: 'airtable.com/partnerships',
    activity: 'Updating your signed partnerships',
    result: '2 deals updated · reminders set',
    turns: [
      ['you', 'November, update Airtable with the brand deals that just signed.'],
      ['november', 'I found your YouTube deal and the X partnership. Shall I add the next deliverables too?'],
      ['you', 'Yes. And remind me a day before each one is due.'],
      ['november', 'YouTube is marked signed. I’m updating the X deal and adding the deliverables now.'],
      ['you', 'Keep them in my usual partnership tracker.'],
      ['november', 'Done. Both records are updated in your tracker, with a reminder a day before each deadline.'],
    ],
  },
  {
    url: 'studio.youtube.com',
    activity: 'Watching for your 10K milestone',
    result: '10,024 views · spoken update delivered',
    turns: [
      ['you', 'Tell me when my new video hits ten thousand views.'],
      ['november', 'Your latest upload is at 9,800. I can keep an eye on it while you get on with your day.'],
      ['you', 'Great. Just tell me when it crosses ten thousand.'],
      ['november', 'You’ve got it. I’ll speak up when it happens.'],
      ['you', 'Thanks, I’m stepping away from my laptop.'],
      ['november', 'Quick update — your video just passed 10,000 views! It’s at 10,024. A milestone worth hearing about.'],
    ],
  },
];
let scenario = 0;
let step = 0;
let isPlaying = false;
let timer;
let audioRun = 0;
let audioPlaying = false;
let speechUtterance;
let feature = 0;

function browserMarkup() {
  const executing = step >= 4;
  const complete = step >= 6;
  if (scenario === 0) {
    return `<div class="browser-brand"><b class="walmart-mark">✳</b> Walmart · Your cart</div><h4>${complete ? 'Your usuals, approved.' : 'A little less to do.'}</h4><p class="browser-subtitle">${complete ? '4 items · approved by voice' : 'Adding your preferred brands'}</p><div class="cart-items">${[['🥛', 'Oat milk', 'Your usual brand'], ['☕', 'Ground coffee', 'Medium roast'], ['🍞', 'Wholegrain bread', 'Your usual loaf'], ['🫐', 'Blueberries', 'Fresh · 1 pack']].map(([icon, name, detail], i) => `<div class="cart-item ${!complete && (!executing || i > 1) ? 'cart-pending' : ''}"><span class="cart-thumb" aria-hidden="true">${icon}</span><span><b>${name}</b><small>${detail}</small></span><span class="cart-state">${complete || executing && i < 2 ? '✓' : '…'}</span></div>`).join('')}</div><div class="mock-submit">${complete ? '✓ Cart approved by voice' : 'Building your cart…'}</div>`;
  }
  if (scenario === 1) return `<div class="browser-brand"><b class="airtable-mark">▦</b> Airtable · Partnerships</div><h4>Your deals, in sync.</h4><p class="browser-subtitle">${complete ? '2 of 2 records updated' : 'Matching signed agreements'}</p><div class="airtable-grid"><div class="airtable-row table-head"><span>Partnership</span><span>Status</span></div><div class="airtable-row"><span>YouTube brand deal</span><span class="deal-status ${executing ? 'signed' : ''}">${executing ? 'Signed' : 'Review'}</span></div><div class="airtable-row"><span>X partnership</span><span class="deal-status ${complete ? 'signed' : ''}">${complete ? 'Signed' : 'Updating'}</span></div></div><p class="success-copy">${complete ? 'Next deliverables added. Reminders set.' : 'Checking agreement details and next deliverables.'}</p><div class="mock-submit">${complete ? '✓ Your tracker is up to date' : 'Updating your records…'}</div>`;
  return `<div class="browser-brand"><b style="background:#d3424a">▶</b> YouTube Studio</div><p class="browser-subtitle">YOUR LATEST UPLOAD · VIEWS</p><div class="milestone-number">${complete ? '10,024' : executing ? '9,800' : '9,642'}</div><div class="chart" aria-hidden="true">${[17, 24, 21, 34, 42, 38, 52, 57, 67, 80, 91, 100].map(h => `<i style="--bar:${h}%"></i>`).join('')}</div><p class="browser-subtitle">${complete ? '↗ 10K milestone reached' : 'Watching for 10,000 views'}</p>`;
}

function renderDemo() {
  const example = examples[scenario];
  $('#conversation-welcome').hidden = step > 0;
  const transcript = $('#conversation-transcript');
  while (transcript.children.length < step) {
    const index = transcript.children.length;
    const [speaker, text] = example.turns[index];
    const turn = document.createElement('div');
    turn.className = `conversation-turn turn-${speaker}`;
    turn.innerHTML = `<div class="turn-meta"><span class="mono">${speaker === 'you' ? 'YOU' : 'NOVEMBER'}</span><span class="waveform" aria-hidden="true">${wave()}</span><span class="turn-speaking mono">SPEAKING</span></div><p></p>`;
    turn.querySelector('p').textContent = text;
    transcript.append(turn);
  }
  [...transcript.children].forEach((turn, i) => { turn.dataset.active = String(isPlaying && i === step - 1); });
  $('#voice-state').textContent = !step ? 'READY TO LISTEN' : step === 6 && !isPlaying ? 'ALL TAKEN CARE OF' : isPlaying ? (example.turns[step - 1][0] === 'you' ? 'LISTENING TO YOU' : 'WORKING · SPEAKING') : 'PAUSED';
  $('#conversation-action').hidden = step < 4;
  $('#browser-url').textContent = example.url;
  $('#browser-activity').textContent = step === 6 ? example.result : example.activity;
  $('#browser-content').innerHTML = browserMarkup();
  $('#conversation-status').textContent = !step ? 'CHOOSE AN EXAMPLE TO BEGIN' : step === 6 ? 'CONVERSATION COMPLETE' : `VOICE TRANSCRIPT · ${step} / 6`;
  $('#play-toggle').disabled = !step;
  $('#play-toggle').textContent = !step ? '▷ Play' : isPlaying ? 'Ⅱ Pause' : step === 6 ? '↻ Replay' : '▷ Continue';
  $('#show-conversation').disabled = !step || step === 6;
  $('#hear-demo').disabled = !step;
  $('.execution-demo').dataset.paused = String(!isPlaying && !audioPlaying);
  $('.execution-demo').dataset.speaking = String(isPlaying || audioPlaying);
}

function schedule() {
  clearTimeout(timer);
  if (!isPlaying || document.hidden) return;
  timer = setTimeout(() => {
    if (step === 6) { isPlaying = false; renderDemo(); return; }
    step += 1;
    renderDemo();
    const newest = $('#conversation-transcript').lastElementChild;
    // Only the transcript scrolls; the workspace and scenario choices stay in place.
    const viewport = $('#conversation-scroll');
    if (newest) viewport.scrollTo({ top: newest.offsetTop - viewport.offsetTop - 20, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    schedule();
  }, step === 6 ? 6500 : step === 4 ? 5000 : 3800);
}

function stopSpeech() {
  audioRun += 1;
  audioPlaying = false;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  speechUtterance = undefined;
  $('#hear-demo').setAttribute('aria-label', 'Hear the conversation');
  $('#hear-demo').innerHTML = '◖)) <span>Hear conversation</span>';
  $$('.conversation-turn').forEach(turn => { turn.dataset.active = 'false'; });
  $('.execution-demo').dataset.paused = String(!isPlaying);
}

function pauseDemo() {
  isPlaying = false;
  clearTimeout(timer);
  stopSpeech();
}

function setScenario(index) {
  pauseDemo();
  scenario = index;
  step = reduceMotion.matches ? 6 : 1;
  isPlaying = !reduceMotion.matches;
  $('#conversation-transcript').replaceChildren();
  $('#conversation-scroll').scrollTop = 0;
  $$('[data-scenario]').forEach((button, i) => button.setAttribute('aria-pressed', String(index === i)));
  renderDemo();
  schedule();
}

$$('[data-scenario]').forEach(button => button.addEventListener('click', () => setScenario(Number(button.dataset.scenario))));
$('#play-toggle').addEventListener('click', () => {
  if (step === 6 && !isPlaying) { setScenario(scenario); return; }
  stopSpeech();
  isPlaying = !isPlaying;
  renderDemo();
  schedule();
});
$('#show-conversation').addEventListener('click', () => {
  pauseDemo();
  step = 6;
  renderDemo();
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
  if (audioPlaying) { stopSpeech(); renderDemo(); return; }
  pauseDemo();
  step = 6;
  renderDemo();
  if (!('speechSynthesis' in window)) {
    $('#conversation-status').textContent = 'AUDIO UNAVAILABLE · READ THE TRANSCRIPT ABOVE';
    return;
  }
  const run = audioRun;
  audioPlaying = true;
  $('#hear-demo').setAttribute('aria-label', 'Stop conversation audio');
  $('#hear-demo').innerHTML = '■ <span>Stop audio</span>';
  const playTurn = index => {
    if (run !== audioRun) return;
    if (index === 6) { stopSpeech(); renderDemo(); return; }
    const [speaker, text] = examples[scenario].turns[index];
    $$('.conversation-turn').forEach((turn, i) => { turn.dataset.active = String(i === index); });
    $('.execution-demo').dataset.paused = 'false';
    $('.execution-demo').dataset.speaking = 'true';
    $('#voice-state').textContent = speaker === 'you' ? 'YOU · SPEAKING' : 'NOVEMBER · SPEAKING';
    const viewport = $('#conversation-scroll');
    viewport.scrollTo({ top: $('#conversation-transcript').children[index].offsetTop - viewport.offsetTop - 20, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = 'en-US';
    speechUtterance.rate = speaker === 'you' ? 1 : .96;
    speechUtterance.pitch = speaker === 'you' ? 1.1 : .9;
    speechUtterance.onend = () => playTurn(index + 1);
    speechUtterance.onerror = () => { if (run === audioRun) { stopSpeech(); renderDemo(); $('#conversation-status').textContent = 'AUDIO UNAVAILABLE · READ THE TRANSCRIPT ABOVE'; } };
    speechSynthesis.speak(speechUtterance);
  };
  playTurn(0);
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

keyboardTabs('[data-feature]', renderFeature);

$('#feature-visual').addEventListener('click', event => {
  const button = event.target.closest('[data-replay]');
  if (!button) return;
  const text = replayMessages[button.dataset.replay];
  const status = $('#replay-status');
  status.textContent = text;
  pauseDemo();
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
