import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ball from './Bolas';
import Paddle from './Paleta';
import Controls from './Controles';
import ParticleEffect from './efectodeparticula';
import Fondoanimado from './Fondoanimado';

const { width, height } = Dimensions.get('window');

const Paletaancho = 100;
const Paletaalto = 160;
const tamanobola = 20;
const Paletabaja = 40;

const Bloqueancho = 56;
const Bloquealto = 20;
const columnas = 6;

const crearBloques = (filas: number) => {
  return Array.from({ length: columnas * filas }).map((_, i) => {
    const col = i % columnas;
    const row = Math.floor(i / columnas);
    return {
      x: col * (Bloqueancho + 10) + 10,
      y: row * (Bloquealto + 10) + 40,
      visible: true,
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState !== 'playing') return;

      setBola(prev => {
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

        const pegarpaleta =
          ballBottom >= paletaY &&
          newY <= paletaY + Paletaalto &&
          ballCenterX >= paletaX &&
          ballCenterX <= paletaX + Paletaancho;

        if (pegarpaleta) {
          dy = -Math.abs(dy) * 1.5;
          newY = paletaY - tamanobola;
          setParticleTrigger(true);
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
          // Use functional update to avoid stale state
          setBloques(() => bloquesActualizados);
          setScore(s => s + 1);
        }

        // Reinicio si cae
        if (newY >= height) {
          // Al caer, guardar la puntuación y volver al menú principal
          setLastScore(prevScore => score);
          setGameState('menu');

          // Restaurar bloques según dificultad seleccionada
          const rows = difficultySettings[difficulty].rows;
          setBloques(crearBloques(rows));

          return {
            x: paletaX + Paletaancho / 2 - tamanobola / 2,
            y: height - Paletabaja - Paletaalto - tamanobola,
            dx: difficultySettings[difficulty].speed,
            dy: -difficultySettings[difficulty].speed,
          };
        }

        return { ...prev, x: newX, y: newY, dx, dy };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [paletaX, bloques, gameState, difficulty, score]);

  return (
    <View style={styles.container}>
      <Fondoanimado />
      {gameState === 'playing' && (
        <View style={styles.scoreBar}>
          <Text style={styles.scoreText}>Puntuación: {score}</Text>
          <Text style={styles.scoreText}>Dificultad: {difficulty}</Text>
        </View>
      )}
      <Ball x={bola.x} y={bola.y} />
      <ParticleEffect x={bola.x} y={bola.y} trigger={particleTrigger} />
      {bloques.map((bloque, i) =>
        bloque.visible ? (
          <View
            key={i}
            style={[
              styles.bloque,
              { left: bloque.x, top: bloque.y },
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
    backgroundColor: '#000',
  },
  bloque: {
    position: 'absolute',
    width: Bloqueancho,
    height: Bloquealto,
    backgroundColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  scoreBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '600',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuBox: {
    width: '85%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  lastScore: {
    color: '#ddd',
    marginBottom: 12,
  },
  menuButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  menuButton: {
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
