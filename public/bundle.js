import {html, render} from 'https://unpkg.com/lit-html?module';

function speak(msg) {
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter(v => {
    const lang = v.lang.replace('_', '-').toLowerCase();
    return lang === 'en-gb';
  });
  const voiceToUse = englishVoices[0] || voices[0];
  window.speechSynthesis.cancel();
  const m = new SpeechSynthesisUtterance();
  m.voice = voiceToUse;
  m.lang = (voiceToUse && voiceToUse.lang) || 'en-GB';
  m.rate = 1.0;
  m.text = msg;
  window.speechSynthesis.speak(m);
}

const vocabs = `information
adoration
sensation
preparation
admiration
fixation
inflammation
elevation
restoration`.split('\n');

const locationUrl = new URL(window.location.href);
const startedAt = +locationUrl.searchParams.get('s') || 0;
let index = startedAt;
let starving = true;
let inputArray;

const template = (vocabToDisplay, vocab, isCorrect, isIncorrect) => html`
<h1 @click=${() => speak(vocab)}>${vocabToDisplay}</h1>
<div class="correct" style="${isCorrect ? '' : 'display:none'}">
  <div>Correct!</div>
  <button @click=${() => {
    starving = true;
    index++;
    generator.next();
  }}>Next</button>
</div>
<div class="incorrect" style="${isIncorrect ? '' : 'display:none'}">
  <div>Incorrect!</div>
  <button @click=${() => {
    starving = true;
    generator.next();
  }}>Try again</button>
</div>
<div class="alphas" @click=${e => {
  if (!e.target.id) return;
  inputArray.push(e.target.id);
  generator.next();
}}>
  <button id="a">A</button>
  <button id="e">E</button>
  <button id="i">I</button>
  <button id="o">O</button>
  <button id="u">U</button>
</div>
<div class="status">Question ${index + 1} of ${vocabs.length}</div>
${ startedAt > 0 ? html`<div>Started at ${startedAt}</div>` : null}
`;

function* infinite() {
  while (true) {
    if (starving) {
      inputArray = [];
      starving = false;
      speak(vocabs[index]);
    }
    let vocab = vocabs[index];
    let destructedVocab = vocab.replace(/[aeiou]/g, '_').split('_');
    let vocabToDisplay = '';
    let inputIndex = 0;

    for (const part of destructedVocab) {
      vocabToDisplay += part;
      if (inputIndex < destructedVocab.length - 1) {
        vocabToDisplay += inputArray[inputIndex++] || '_';
      }
    }
    let isCorrect = false;
    let isIncorrect = false;
    if (!vocabToDisplay.includes('_')) {
      if (vocab === vocabToDisplay) {
        isCorrect = true;
      } else {
        isIncorrect = true;
      }
    }
    render(template(vocabToDisplay, vocab, isCorrect, isIncorrect), document.getElementById('app'));
    yield;
  }
}

const generator = infinite();
generator.next();
