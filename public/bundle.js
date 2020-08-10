import {html, render} from 'https://unpkg.com/lit-html?module';

function speak(msg) {
  const voices = window.speechSynthesis.getVoices().filter(v => {
    const lang = v.lang.replace('_', '-').toLowerCase();
    return lang == 'en-gb';
  });
  const voiceToUse = voices[0];
  window.speechSynthesis.cancel();
  const m = new SpeechSynthesisUtterance();
  m.voice = voiceToUse;
  m.lang = voiceToUse.lang;
  m.rate = 1.0;
  m.text = msg;
  window.speechSynthesis.speak(m);
}

const vocabs = `accident
actual
address
answer
appear
arrive
believe
bicycle
breath
breathe
build
busy
business
calendar
caught
centre
century
certain
circle
complete
consider
continue
decide
describe
different
difficult
disappear
early
earth
eight
eighth
enough
exercise
experience
experiment
extreme
famous
favourite
February
forward(s)
fruit
grammar
group
guard
guide
heard
heart
height
history
imagine
increase
important
interest
island
knowledge
learn
length
library
material
medicine
mention
minute
natural
naughty
notice
occasion
often
opposite
ordinary
particular
peculiar
perhaps
popular
position
possess
possible
potatoes
pressure
probably
promise
purpose
quarter
question
recent
regular
reign
remember
sentence
separate
special
straight
strange
strength
suppose
surprise
therefore
though
although
thought
through
various
weight
woman
women`.split('\n');

function run() {
  let index = 0;
  let starving = true;
  let inputArray;

  const template = (vocabToDisplay, vocab, isCorrect, isIncorrect) => html`
  <h1 @click=${() => speak(vocab)}>${vocabToDisplay}</h1>
  <div class="correct" style="${isCorrect ? '' : 'display:none'}">Correct!<button @click=${() => {
    starving = true;
    index++;
    generator.next();
  }}>Next</button></div>
  <div class="incorrect" style="${isIncorrect ? '' : 'display:none'}">Incorrect!<button @click=${() => {
    starving = true;
    generator.next();
  }}>Try again</button></div>
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
        if (vocab == vocabToDisplay) {
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
}

window.speechSynthesis.onvoiceschanged = function() {
  run();
};
