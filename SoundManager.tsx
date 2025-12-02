import { useEffect } from 'react';
import Sound from 'react-native-sound';

interface SoundManagerProps {
  isPlaying: boolean;
}

Sound.setCategory('Playback');

let backgroundMusic: Sound | null = null;
let hitSoundPool: Array<Sound | null> = [];
let victorySound: Sound | null = null;

const victoryFile = 'victoria'; // ejemplo: victory.mp3

// Lista de archivos de sonidos distintos (en res/raw, sin extensión)
const hitFiles = [
  'hit1',   // ejemplo: hit1.mp3
  'hit2',   // ejemplo: hit2.mp3
  'hit3',   // ejemplo: hit3.mp3
  'hit4'    // ejemplo: hit4.mp3
];

const loadSound = (
  filename: string,
  onLoaded: (sound: Sound) => void,
  onError: (error: any) => void
) => {
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
  // Música de fondo
  loadSound(
    'waitingtime',
    (sound) => {
      backgroundMusic = sound;
      backgroundMusic.setNumberOfLoops(-1);
      backgroundMusic.setVolume(0.3);
    },
    (error) => console.error('Música:', error)
  );

  // Sonidos de golpe (varios diferentes)
  hitSoundPool = [];
  hitFiles.forEach((file) => {
    loadSound(
      file,
      (sound) => {
        sound.setVolume(0.7);
        hitSoundPool.push(sound);
      },
      (error) => console.error(`Golpe ${file}:`, error)
    );
  });
};

export const playBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.play((success) => {
      if (!success) console.warn('[Sound] Error reproduciendo música');
    });
  }
};

export const playVictorySound = () => {
  if (!victorySound) {
    loadSound(
      victoryFile,
      (sound) => {
        victorySound = sound;
        victorySound.setVolume(0.7);
        victorySound.play((success) => {
          if (!success) console.warn('[Sound] Error reproduciendo victoria');
        });
      },
      (error) => console.error('Victoria:', error)
    );
  } else {
    victorySound.play((success) => {
      if (!success) console.warn('[Sound] Error reproduciendo victoria');
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

  // Seleccionar un sonido aleatorio del pool
  const s = hitSoundPool[Math.floor(Math.random() * hitSoundPool.length)];
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
