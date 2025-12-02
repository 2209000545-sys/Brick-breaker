import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ball from './Bolas';
import Paddle from './Paleta';
import Controls from './Controles';
import ParticleEffect from './efectodeparticula';
import Fondoanimado from './Fondoanimado';
import SoundManager, { initializeSounds, playHitSound, releaseSounds, playBackgroundMusic, stopBackgroundMusic } from './SoundManager';

const { width, height } = Dimensions.get('window');

const Paletaancho = 100;
const Paletaalto = 20;
const tamanobola = 20;
const Paletabaja = 40;

const Bloqueancho = 56;
const Bloquealto = 20;
const columnas = 6;

const blockColors = ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFA5'];

const crearBloques = (filas: number) => {
  return Array.from({ length: columnas * filas }).map((_, i) => {
    const col = i % columnas;
    const row = Math.floor(i / columnas);
    return {
      x: col * (Bloqueancho + 10) + 10,
      y: row * (Bloquealto + 10) + 90,
      visible: true,
      color: blockColors[(col + row) % blockColors.length],
    };
  });
};

const difficultySettings: Record<string, { rows: number; speed: number }> = {
  easy: { rows: 2, speed: 2 },
  medium: { rows: 4, speed: 3 },
  hard: { rows: 6, speed: 5 },
};

export default function GameScreen() {
  const [paletaX, setPaletaX] = useState(width / 2 - Paletaancho / 2);
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [score, setScore] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const [bola, setBola] = useState({
    x: width / 2,
    y: height / 2,
    dx: difficultySettings.medium.speed,
    dy: -difficultySettings.medium.speed,
  });
  const [particleTrigger, setParticleTrigger] = useState(false);
  const [bloques, setBloques] = useState(() => crearBloques(difficultySettings.medium.rows));

  const startGame = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    const { rows, speed } = difficultySettings[level];
    setBloques(crearBloques(rows));
    setScore(0);
    setGameState('playing');
    setBola({
      x: width / 2,
      y: height / 2,
      dx: speed,
      dy: -speed,
    });
  };

  // Inicializar sonidos 
  useEffect(() => {
    initializeSounds();
    return () => {
      releaseSounds();
    };
  }, []);

  // Control simple de música de fondo según el estado del juego
  useEffect(() => {
    if (gameState === 'playing') {
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [gameState]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBola(prev => {
        if (gameState !== 'playing') return prev;

        let newX = prev.x + prev.dx;
        let newY = prev.y + prev.dy;
        let dx = prev.dx;
        let dy = prev.dy;

        // Rebote en bordes
        if (newX <= 0 || newX >= width - tamanobola) dx *= -1;
        if (newY <= 0) dy *= -1;

        // Colisión con paleta
const paletaY = height - Paletabaja - Paletaalto;
const ballBottom = newY + tamanobola;
const ballCenterX = newX + tamanobola / 2;

// Rebote solo en la parte superior de la paleta
const pegarpaleta =
  ballBottom >= paletaY &&          // toca la parte superior
  ballBottom <= paletaY + 10 &&     // margen de 10px para evitar rebotes por debajo
  ballCenterX >= paletaX &&
  ballCenterX <= paletaX + Paletaancho;

if (pegarpaleta) {
  dy = -Math.abs(dy) * 1.2;
  newY = paletaY - tamanobola;
  setParticleTrigger(true);
  playHitSound();
  setTimeout(() => setParticleTrigger(false), 100);
}


        // Colisión con bloques
        let bloquesActualizados = [...bloques];
        let colisionDetectada = false;

        bloques.forEach((bloque, index) => {
          if (!bloque.visible) return;

          const ballRight = newX + tamanobola;
          const ballBottom = newY + tamanobola;

          const colisiona =
            ballRight >= bloque.x &&
            newX <= bloque.x + Bloqueancho &&
            ballBottom >= bloque.y &&
            newY <= bloque.y + Bloquealto;

          if (colisiona) {
            dy *= -1;
            bloquesActualizados[index].visible = false;
            colisionDetectada = true;
          }
        });

          if (colisionDetectada) {
          setBloques(() => bloquesActualizados);
          setScore(s => s + 1);
          playHitSound();
        }
        // Reinicio si cae: detener la bola y volver al menú
        if (newY >= height) {
          setLastScore(prevScore => score);
          setGameState('menu');
          const rows = difficultySettings[difficulty].rows;
          setBloques(crearBloques(rows));

          // Colocar la bola sobre la paleta y detenerla (dx=0, dy=0)
          return {
            x: paletaX + Paletaancho / 2 - tamanobola / 2,
            y: height - Paletabaja - Paletaalto - tamanobola,
            dx: 0,
            dy: 0,
          };
        }

        return { ...prev, x: newX, y: newY, dx, dy };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [paletaX, difficulty]);

  return (
    <View style={styles.container}>
      <Fondoanimado />
      {gameState === 'playing' && (
        <View style={styles.scoreBar}>
          <Text style={styles.scoreText}>Puntuación: {score}</Text>
          <Text style={styles.scoreText}>
            Dificultad: {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
          </Text>
        </View>
      )}
      <Ball x={bola.x} y={bola.y} />
      <ParticleEffect x={bola.x} y={bola.y} trigger={particleTrigger} />
      {bloques.map((bloque, i) =>
        bloque.visible ? (
          <View
            style={[
              styles.bloque,
              { left: bloque.x, top: bloque.y, backgroundColor: (bloque as any).color || '#FF006E' },
            ]}
          />
        ) : null
      )}
      <Paddle x={paletaX} />
      <Controls
        moveLeft={() => setPaletaX(x => Math.max(x - 30, 0))}
        moveRight={() => setPaletaX(x => Math.min(x + 30, width - Paletaancho))}
      />

      {gameState === 'menu' && (
        <View style={styles.menuOverlay} pointerEvents="box-none">
          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>PingPong - Elige dificultad</Text>
            {lastScore !== null && (
              <Text style={styles.lastScore}>Última puntuación: {lastScore}</Text>
            )}
            <View style={styles.menuButtons}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => startGame('easy')}
              >
                <Text style={styles.menuButtonText}>Fácil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => startGame('medium')}
              >
                <Text style={styles.menuButtonText}>Medio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => startGame('hard')}
              >
                <Text style={styles.menuButtonText}>Difícil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0e27',
  },
  bloque: {
    position: 'absolute',
    width: Bloqueancho,
    height: Bloquealto,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 5,
  },
  scoreBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#FF1493',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  scoreText: {
    color: '#0a0e27',
    fontWeight: '800',
    fontSize: 15,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  menuBox: {
    width: '85%',
    backgroundColor: '#1a1f3a',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#00D9FF',
  },
  menuTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  lastScore: {
    color: '#00FF88',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  menuButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  menuButton: {
    backgroundColor: '#FF006E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFBE0B',
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  menuButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
