import { useEffect } from 'react';
import Sound from 'react-native-sound';

interface SoundManagerProps {
  isPlaying: boolean;
}

// ⚠️ En Android, setCategory no es necesario, pero no rompe nada
Sound.setCategory('Playback');

let backgroundMusic: Sound | null = null;
let hitSoundPool: Array<Sound | null> = [];
let hitPoolIndex = 0;
const HIT_POOL_SIZE = 6;

// Función genérica para cargar sonidos desde res/raw
const loadSound = (
  filename: string,
  onLoaded: (sound: Sound) => void,
  onError: (error: any) => void
) => {
  console.log(`[Sound] intentando cargar: ${filename}`);
  const s = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.error(`[Sound] fallo cargando ${filename}:`, error);
      onError(error);
      return;
    }
    console.log(`✓ ${filename} cargado`);
    onLoaded(s);
  });
};

export const initializeSounds = () => {
  // 🎶 Música de fondo
  loadSound(
    'waitingtime', // ⚠️ sin extensión
    (sound) => {
      backgroundMusic = sound;
      backgroundMusic.setNumberOfLoops(-1);
      backgroundMusic.setVolume(0.3);
    },
    (error) => console.error('Música:', error)
  );

  // 💥 Sonido de golpe
  hitSoundPool = new Array(HIT_POOL_SIZE).fill(null);
  for (let i = 0; i < HIT_POOL_SIZE; i++) {
    loadSound(
      'fartsound', // ⚠️ sin extensión
      (sound) => {
        sound.setVolume(0.7);
        hitSoundPool[i] = sound;
      },
      (error) => console.error(`Golpe[${i}]:`, error)
    );
  }
};

export const playBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.play((success) => {
      if (!success) console.warn('[Sound] Error reproduciendo música');
    });
  }
};

export const stopBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
};

export const playHitSound = () => {
  if (!hitSoundPool || hitSoundPool.length === 0) return;
  const idx = hitPoolIndex % HIT_POOL_SIZE;
  hitPoolIndex = (hitPoolIndex + 1) % HIT_POOL_SIZE;
  const s = hitSoundPool[idx];
  if (!s) return;

  s.stop(() => {
    s.play((success) => {
      if (!success) console.warn('[Sound] Error reproduciendo golpe');
    });
  });
};

export const releaseSounds = () => {
  if (backgroundMusic) {
    backgroundMusic.release();
    backgroundMusic = null;
  }
  if (hitSoundPool && hitSoundPool.length > 0) {
    hitSoundPool.forEach((hs) => {
      if (hs) hs.release();
    });
    hitSoundPool = [];
    hitPoolIndex = 0;
  }
};

export default function SoundManager({ isPlaying }: SoundManagerProps) {
  useEffect(() => {
    initializeSounds();
    return () => releaseSounds();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [isPlaying]);

  return null;
}
