// Define audioCtx globally but don't create it immediately
let audioCtx;

// Function to initialize or resume AudioContext
function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Add event listeners for user interactions to initialize or resume AudioContext
document.addEventListener('click', initAudioContext, { once: true });
document.addEventListener('keydown', initAudioContext, { once: true });

const oscillators = {};

function playFrequency(key, frequency) {
    initAudioContext();

    if (!frequency) {
        console.error(`Invalid or undefined frequency for key: ${key}`);
        return;
    }

    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();

    oscillators[key] = oscillator;
}

function stopFrequency(key) {
    if (oscillators[key]) {
        oscillators[key].stop();
        delete oscillators[key];
    }
}

const noteToFrequencyMap = {
    "KeyA": 256.87,
    "KeyS": 288.33,
    "KeyD": 323.63,
    "KeyF": 342.88,
    "KeyJ": 384.87,
    "KeyK": 432,
    "KeyL": 484.90,
    "Semicolon": 513.74
};

function playNoteForKey(key) {
    const frequency = noteToFrequencyMap[key];
    if (frequency) {
        playFrequency(key, frequency);
    } else {
        console.error(`No frequency mapping found for key: ${key}`);
    }
}

// Event listeners for playing and stopping notes based on physical keyboard interaction
document.addEventListener('keydown', function(event) {
    if (event.repeat) return; // Ignore repeated events
    const frequency = noteToFrequencyMap[event.code];
    if (frequency) {
        playFrequency(event.code, frequency);
    } else {
        console.log(`Key down: ${event.code} does not have a mapped frequency.`);
    }
});

document.addEventListener('keyup', function(event) {
    if (noteToFrequencyMap[event.code]) {
        stopFrequency(event.code);
    }
});

// Add interactions for virtual keyboard keys
document.querySelectorAll('.keyboard-key').forEach(keyElement => {
    const key = keyElement.getAttribute('data-key');
    const frequency = noteToFrequencyMap[key];

    const startNote = () => playFrequency(key, frequency);
    const stopNote = () => stopFrequency(key);

    keyElement.addEventListener('mousedown', startNote);
    keyElement.addEventListener('mouseup', stopNote);
    keyElement.addEventListener('touchstart', startNote, { passive: true });
    keyElement.addEventListener('touchend', stopNote);
    
});

// Define the two frequencies
const frequencyLeft = 1000; // Frequency for the left ear
const frequencyRight = 1006; // Frequency for the right ear to create a 6 Hz binaural beat

function playBinauralBeats(frequencyLeft, frequencyRight) {
    initAudioContext();

    const oscillatorLeft = audioCtx.createOscillator();
    const oscillatorRight = audioCtx.createOscillator();

    oscillatorLeft.type = 'sine';
    oscillatorRight.type = 'sine';

    oscillatorLeft.frequency.setValueAtTime(frequencyLeft, audioCtx.currentTime);
    oscillatorRight.frequency.setValueAtTime(frequencyRight, audioCtx.currentTime);

    const pannerLeft = new StereoPannerNode(audioCtx, { pan: -1 });
    const pannerRight = new StereoPannerNode(audioCtx, { pan: 1 });

    oscillatorLeft.connect(pannerLeft).connect(audioCtx.destination);
    oscillatorRight.connect(pannerRight).connect(audioCtx.destination);

    oscillatorLeft.start();
    oscillatorRight.start();

    oscillatorLeft.stop(audioCtx.currentTime + 60); // Stop after 60 seconds
    oscillatorRight.stop(audioCtx.currentTime + 60); // Stop after 60 seconds
}

playBinauralBeats(frequencyLeft, frequencyRight);
