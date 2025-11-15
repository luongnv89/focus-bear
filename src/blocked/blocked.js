/**
 * FocusBear Blocked Page Script
 */

// Playful message variations - brand-aligned (supportive, not shameful)
const messages = [
  {
    heading: 'Whoa there, friend!',
    subtext: "Maybe it's time for a breather? Your focus bear thinks so.",
  },
  {
    heading: 'Hold up! 🐾',
    subtext: 'Your brain deserves a break from this rabbit hole. How about a walk?',
  },
  {
    heading: 'Limit reached! 🎯',
    subtext: "You set this limit for a reason. Future you says 'thank you!'",
  },
  {
    heading: 'Nope, not today! 🚫',
    subtext: 'This site has had enough of your time today. Go do something awesome!',
  },
  {
    heading: 'Bear wall activated! 🐻',
    subtext: "Time to redirect that focus energy elsewhere. You've got this!",
  },
  {
    heading: 'Your limit, your rules! 📏',
    subtext: 'You decided this boundary. Stick with it—you'll thank yourself later.',
  },
];

// Get domain from URL params
const urlParams = new URLSearchParams(window.location.search);
const domain = urlParams.get('domain') || 'this site';
const count = urlParams.get('count') || '?';
const limit = urlParams.get('limit') || '?';

// Select random message
const randomMessage = messages[Math.floor(Math.random() * messages.length)];

// Update page content
document.getElementById('page-heading').textContent = randomMessage.heading;
document.getElementById('subtext').textContent = randomMessage.subtext;
document.getElementById('domain-name').textContent = domain;
document.getElementById('visit-count').textContent = count;
document.getElementById('limit-value').textContent = limit;

// Apply high contrast mode if enabled
chrome.storage.local.get(['settings'], (data) => {
  const settings = data.settings || {};
  if (settings.highContrastMode) {
    document.body.classList.add('high-contrast');
  }
});

const container = document.querySelector('.container');
const settingsHelp = document.createElement('section');
settingsHelp.id = 'settings-help';
settingsHelp.className = 'settings-help';
settingsHelp.setAttribute('role', 'status');
settingsHelp.hidden = true;
settingsHelp.tabIndex = -1;

const helpTitle = document.createElement('p');
helpTitle.className = 'settings-help-title';
helpTitle.textContent = 'To adjust limits:';

const instructionsList = document.createElement('ol');
[
  'Click the FocusBear icon in your toolbar',
  'Click the ⚙️ settings button',
  'Configure your limits',
].forEach((instruction) => {
  const listItem = document.createElement('li');
  listItem.textContent = instruction;
  instructionsList.appendChild(listItem);
});

const alternateInstruction = document.createElement('p');
alternateInstruction.className = 'settings-help-alt';
alternateInstruction.textContent = 'Or right-click the FocusBear icon and select "Options".';

settingsHelp.append(helpTitle, instructionsList, alternateInstruction);
container.appendChild(settingsHelp);

// Back button - close tab or go to new tab page
document.getElementById('back-btn').addEventListener('click', () => {
  window.close();
  // If window.close() doesn't work (not opened by script), redirect
  setTimeout(() => {
    window.location.href = 'about:blank';
  }, 100);
});

document.getElementById('settings-btn').addEventListener('click', () => {
  if (settingsHelp.hidden) {
    settingsHelp.hidden = false;
    settingsHelp.focus();
    settingsHelp.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
