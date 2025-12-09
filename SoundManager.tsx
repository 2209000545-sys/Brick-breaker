import { useEffect } from 'react';
import Sound from 'react-native-sound';

interface SoundManagerProps {
  isPlaying: boolean;
}

Sound.setCategory('Playback');

let backgroundMusic: Sound | null = null;
let hitSoundPool: Sound[] = [];
let victorySound: Sound | null = null;
let gameOverSound: Sound | null = null;
let soundsReady = false;

const victoryFile = 'victoria'; // archivo en res/raw/victoria.mp3
const gameOverFile = 'gameover'; // archivo en res/raw/gameover.mp3

// Lista de archivos de sonidos distintos (en res/raw, sin extensión)
const hitFiles = [
  'hit1',   // archivo en res/raw/hit1.mp3
  'hit2',   // archivo en res/raw/hit2.mp3
  'hit3',   // archivo en res/raw/hit3.mp3
  'hit4',   // archivo en res/raw/hit4.mp3
];

const loadSound = (
  filename: string,
  onLoaded: (sound: Sound) => void,
  onError: (error: any) => void
) => {
  const s = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.warn(`[Sound] No se pudo cargar ${filename}. ¿Existe en res/raw/?`, error);
      onError(error);
      return;
    }
    console.log(`✓ ${filename} cargado correctamente`);
    onLoaded(s);
  });
};

export const initializeSounds = async () => {
  soundsReady = false;
  let loadedCount = 0;
  const totalSounds = hitFiles.length + 3; // music + victory + game over + hit files

  // Música de fondo
  loadSound(
    'musicgame',
    (sound) => {
      backgroundMusic = sound;
      backgroundMusic.setNumberOfLoops(1000);
      backgroundMusic.setVolume(0.3);
      loadedCount++;
      checkIfReady();
    },
    (error) => {
      console.warn('Música de fondo no disponible:', error);
      loadedCount++;
      checkIfReady();
    }
  );

  // Sonidos de golpe
  hitSoundPool = [];
  hitFiles.forEach((file) => {
    loadSound(
      file,
      (sound) => {
        sound.setVolume(0.7);
        hitSoundPool.push(sound);
        loadedCount++;
        checkIfReady();
      },
      (error) => {
        console.warn(`Sonido ${file} no disponible:`, error);
        loadedCount++;
        checkIfReady();
      }
    );
  });

  // Pre-cargar sonido de victoria
  loadSound(
    victoryFile,
    (sound) => {
      victorySound = sound;
      victorySound.setVolume(0.8);
      loadedCount++;
      checkIfReady();
    },
    (error) => {
      console.warn('Victoria no disponible:', error);
      loadedCount++;
      checkIfReady();
    }
  );

  // Pre-cargar sonido de game over
  loadSound(
    gameOverFile,
    (sound) => {
      gameOverSound = sound;
      gameOverSound.setVolume(0.8);
      loadedCount++;
      checkIfReady();
    },
    (error) => {
      console.warn('Game Over no disponible:', error);
      loadedCount++;
      checkIfReady();
    }
  );

  const checkIfReady = () => {
    if (loadedCount === totalSounds) {
      soundsReady = true;
      console.log('[Sound] Sonidos inicializados correctamente');
    }
  };
};

export const playBackgroundMusic = () => {
  if (backgroundMusic && soundsReady) {
    backgroundMusic.play((success) => {
      if (!success) {
        console.warn('[Sound] Error reproduciendo música de fondo');
      }
    });
  }
};

export const playVictorySound = () => {
  if (!soundsReady) {
    console.warn('Los sonidos aún no están listos');
    return;
  }
  
  if (!victorySound) {
    loadSound(
      victoryFile,
      (sound) => {
        victorySound = sound;
        victorySound.setVolume(0.8);
        victorySound.play((success) => {
          if (!success) console.warn('[Sound] Error reproduciendo victoria');
        });
      },
      (error) => console.warn('Victoria no disponible:', error)
    );
  } else {
    victorySound.play((success) => {
      if (!success) console.warn('[Sound] Error reproduciendo victoria');
    });
  }
};

export const playGameOverSound = () => {
  if (!soundsReady) {
    console.warn('Los sonidos aún no están listos');
    return;
  }
  
  if (!gameOverSound) {
    loadSound(
      gameOverFile,
      (sound) => {
        gameOverSound = sound;
        gameOverSound.setVolume(0.8);
        gameOverSound.play((success) => {
          if (!success) console.warn('[Sound] Error reproduciendo game over');
        });
      },
      (error) => console.warn('Game Over no disponible:', error)
    );
  } else {
    gameOverSound.play((success) => {
      if (!success) console.warn('[Sound] Error reproduciendo game over');
    });
  }
};

export const stopBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
};

export const playHitSound = () => {
  if (!soundsReady || !hitSoundPool || hitSoundPool.length === 0) {
    console.warn('Sonidos de golpe no disponibles');
    return;
  }

  // Seleccionar un sonido aleatorio del pool
  const randomIndex = Math.floor(Math.random() * hitSoundPool.length);
  const sound = hitSoundPool[randomIndex];
  
  if (sound) {
    sound.stop(() => {
      sound.play((success) => {
        if (!success) {
          console.warn('[Sound] Error reproduciendo golpe');
        }
      });
    });
  }
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
