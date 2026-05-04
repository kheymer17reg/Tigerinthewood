// 🔊 SOUND SYSTEM — Web Audio API sound effects

let globalAudioContext = null;

function getAudioContext() {
    if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return globalAudioContext;
}

function playSound(soundType) {
    if (!game.soundEnabled) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        switch (soundType) {
            case 'step': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            }
            case 'eat': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            }
            case 'key': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                break;
            }
            case 'door': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            }
            case 'levelComplete': {
                const melody = [523, 659, 784, 1047, 784, 659, 523, 659];
                melody.forEach(function(freq, i) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.15, now + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.15);
                    osc.start(now + i * 0.12);
                    osc.stop(now + i * 0.12 + 0.15);
                });
                break;
            }
            case 'error': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.value = 200;
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            }
        }
    } catch (e) {
        // Silently ignore audio errors
    }
}

function toggleSound() {
    game.soundEnabled = !game.soundEnabled;
    const label = document.getElementById('sound-label');
    const toggle = document.getElementById('sound-toggle');
    if (label) label.textContent = game.soundEnabled ? '🔊 Звук' : '🔇 Без звука';
    if (toggle) toggle.classList.toggle('active', game.soundEnabled);
    localStorage.setItem('soundEnabled', game.soundEnabled);
}

function changeSpeed(speed) {
    game.moveSpeed = parseInt(speed);
    localStorage.setItem('moveSpeed', game.moveSpeed);
    document.querySelectorAll('.speed-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}
