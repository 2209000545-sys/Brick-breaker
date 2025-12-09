import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder, GestureResponderEvent, useWindowDimensions } from 'react-native';
import Ball from './Bolas';
import Paddle from './Paleta';
import ParticleEffect from './efectodeparticula';
import Fondoanimado from './Fondoanimado';
import { initializeSounds, playHitSound, releaseSounds, playBackgroundMusic, stopBackgroundMusic, playVictorySound, playGameOverSound } from './SoundManager';
import { getLayout } from './layout';
// Tamaños responsivos basados en las dimensiones del dispositivo
const { width, height } = Dimensions.get('window');


type PowerupType = 'expand' | 'slow' | 'score' | 'shield' | 'multiplier';
type Powerup = { id: string; x: number; y: number; type: PowerupType; dy: number };
// Tipos añadidos
type ExtendedPowerupType = PowerupType | 'sticky' | 'pierce';

const columnas = 6;
// Los tamaños de los bloques se calculan por dispositivo dentro del componente

const blockColors = ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFA5'];

const crearBloques = (filas: number, blockW: number, blockH: number) => {
  return Array.from({ length: columnas * filas }).map((_, i) => {
    const col = i % columnas;
    const row = Math.floor(i / columnas);
    return {
      x: col * (blockW + 10) + 10,
      y: row * (blockH + 10) + 90,
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
  const window = useWindowDimensions();
  const lw = window.width;
  const lh = window.height;

  const layout = getLayout(lw, lh);
  const {
    paddleWidth: paddleBase,
    paddleHeight,
    paddleBottom,
    ballSize,
    powerupSize,
    blockWidth: blockW,
    blockHeight: blockH,
    touchZoneHeight,
  } = layout;

  const [paddleWidth, setPaddleWidth] = useState(paddleBase);
  const paddleWidthRef = useRef(paddleWidth);
  const [paletaX, setPaletaX] = useState(lw / 2 - paddleBase / 2);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'victory' | 'gameover'>('menu');
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
  const [bloques, setBloques] = useState(() => crearBloques(difficultySettings.medium.rows, blockW, blockH));

  // optimización - evitar re-renders innecesarios
  const touchPositionRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const musicStartedRef = useRef(false);
  const paletaXRef = useRef(paletaX);
  const gameStateRef = useRef(gameState);
  const bloqueRef = useRef(bloques);
  const difficultyRef = useRef(difficulty);
  const powerupsRef = useRef<Powerup[]>([]);
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const spawnRemainingRef = useRef(0);
  const activeTimersRef = useRef<number[]>([]);
  const stickyRef = useRef(false);
  const pierceRef = useRef(false);
  const shieldRef = useRef(false);
  const multiplierRef = useRef(1);
  const [activePowerups, setActivePowerups] = useState<Array<{ id: string; type: PowerupType; expiresAt: number | null }>>([]);
  const activePowerupsRef = useRef(activePowerups);
  useEffect(() => { activePowerupsRef.current = activePowerups; }, [activePowerups]);

  //auxiliar para aplicar efectos de powerup de forma centralizada
  const applyPowerup = (pu: Powerup) => {
    const now = Date.now();
    if (pu.type === 'expand') {
      setPaddleWidth(w => {
        const newW = Math.min(width * 0.7, w * 1.8);
        return newW;
      });
      const expiresAt = now + 10000;
      setActivePowerups(prev => [...prev, { id: pu.id, type: pu.type, expiresAt }]);
      const t = setTimeout(() => {
        setPaddleWidth(paddleBase);
        setActivePowerups(prev => prev.filter(p => p.id !== pu.id));
      }, 10000);
      activeTimersRef.current.push(t as unknown as number);
    } else if (pu.type === 'slow') {
      setBola(b => {
        const ndx = b.dx * 0.6;
        const ndy = b.dy * 0.6;
        return { ...b, dx: ndx, dy: ndy };
      });
      const expiresAt = now + 6000;
      setActivePowerups(prev => [...prev, { id: pu.id, type: pu.type, expiresAt }]);
      const t = setTimeout(() => {
          setBola(prevB => ({ ...prevB, dx: prevB.dx / 0.6, dy: prevB.dy / 0.6 }));
          setActivePowerups(prev => prev.filter(p => p.id !== pu.id));
        }, 6000);
      activeTimersRef.current.push(t as unknown as number);
    } else if (pu.type === 'score') {
      setScore(s => s + Math.round(5 * multiplierRef.current));
      // instantáneo, sin indicador
    } else if (pu.type === 'shield') {
      shieldRef.current = true;
      setActivePowerups(prev => [...prev, { id: pu.id, type: pu.type, expiresAt: null }]);
      // el escudo persiste hasta ser consumido
    } else if (pu.type === 'multiplier') {
      multiplierRef.current = 2;
      const expiresAt = now + 8000;
      setActivePowerups(prev => [...prev, { id: pu.id, type: pu.type, expiresAt }]);
      const t = setTimeout(() => {
          multiplierRef.current = 1;
          setActivePowerups(prev => prev.filter(p => p.id !== pu.id));
        }, 8000);
      activeTimersRef.current.push(t as unknown as number);
    } else if ((pu as any).type === 'sticky') {
      stickyRef.current = true;
      const expiresAt = now + 8000;
      setActivePowerups(prev => [...prev, { id: pu.id, type: 'sticky' as any, expiresAt }]);
      const t2 = setTimeout(() => {
        stickyRef.current = false;
        setActivePowerups(prev => prev.filter(p => p.id !== pu.id));
      }, 8000);
      activeTimersRef.current.push(t2 as unknown as number);
    } else if ((pu as any).type === 'pierce') {
      pierceRef.current = true;
      const expiresAt = now + 8000;
      setActivePowerups(prev => [...prev, { id: pu.id, type: 'pierce' as any, expiresAt }]);
      const t3 = setTimeout(() => {
        pierceRef.current = false;
        setActivePowerups(prev => prev.filter(p => p.id !== pu.id));
      }, 8000);
      activeTimersRef.current.push(t3 as unknown as number);
    }
  };

  // Sincronizar refs con estados
  useEffect(() => {
    paletaXRef.current = paletaX;
  }, [paletaX]);

  useEffect(() => {
    paddleWidthRef.current = paddleWidth;
  }, [paddleWidth]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    bloqueRef.current = bloques;
  }, [bloques]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  const startGame = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    const { rows, speed } = difficultySettings[level];
    setBloques(crearBloques(rows, blockW, blockH));
    setScore(0);
    setGameState('playing');
    setBola({
      x: lw / 2,
      y: lh / 2,
      dx: speed,
      dy: -speed,
    });
    // restablecer ancho de paleta y powerups
    setPaddleWidth(paddleBase);
    powerupsRef.current = [];
    setPowerups([]);
    setActivePowerups([]);
    // establecer número de powerups a generar según la dificultad
    const spawnCounts: Record<string, number> = { easy: 6, medium: 3, hard: 2 };
    spawnRemainingRef.current = spawnCounts[level] || 3;
    // restablecer escudo / multiplicador
    shieldRef.current = false;
    multiplierRef.current = 1;
    stickyRef.current = false;
    pierceRef.current = false;
    // limpiar cualquier temporizador activo
    activeTimersRef.current.forEach(id => clearTimeout(id));
    activeTimersRef.current = [];
  };

  // Inicializar sonidos 
  useEffect(() => {
    initializeSounds();
    return () => {
      releaseSounds();
    };
  }, []);

  // Control de música - reproducir una sola vez cuando el juego comienza
  useEffect(() => {
    if (gameState === 'playing' && !musicStartedRef.current) {
      musicStartedRef.current = true;
      playBackgroundMusic();
    } else if (gameState !== 'playing') {
      musicStartedRef.current = false;
      stopBackgroundMusic();
    }
  }, [gameState]);

  // Limpiar temporizadores y powerups activos al salir del estado de juego para evitar indicadores atascados
  useEffect(() => {
    if (gameState !== 'playing') {
      // limpiar temporizadores programados
      activeTimersRef.current.forEach(id => clearTimeout(id));
      activeTimersRef.current = [];
      // borrar indicadores de powerups activos
      setActivePowerups([]);
      // restablecer banderas de efectos
      stickyRef.current = false;
      pierceRef.current = false;
      shieldRef.current = false;
      multiplierRef.current = 1;
    }
  }, [gameState]);

  // Detectar victoria cuando se rompen todos los bloques
  useEffect(() => {
    if (gameState === 'playing' && bloques.length > 0) {
      const bloquesVisibles = bloques.filter(b => b.visible).length;
      if (bloquesVisibles === 0) {
        setGameState('victory');
        stopBackgroundMusic();
        playVictorySound();
        setLastScore(score);
      }
    }
  }, [bloques, gameState, score]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBola(prev => {
        if (gameStateRef.current !== 'playing') return prev;

        let newX = prev.x + prev.dx;
        let newY = prev.y + prev.dy;
        let dx = prev.dx;
        let dy = prev.dy;

        // Rebote en bordes
        if (newX <= 0 || newX >= lw - ballSize) dx *= -1;
        if (newY <= 0) dy *= -1;

        // Colisión con paleta (usar dimensiones locales)
        const paletaY = lh - paddleBottom - paddleHeight;
        const ballBottom = newY + ballSize;
        const ballCenterX = newX + ballSize / 2;

        // Rebote solo en la parte superior de la paleta
        const pegarpaleta =
          ballBottom >= paletaY &&
          ballBottom <= paletaY + 10 &&
          ballCenterX >= paletaXRef.current &&
          ballCenterX <= paletaXRef.current + paddleWidthRef.current;

        // Rebote en la paleta con dirección variable según dónde pegue
        if (pegarpaleta) {
          const hitPosition = ballCenterX - paletaXRef.current;
          const hitRatio = hitPosition / paddleWidthRef.current; // 0 a 1
          
          const angle = (hitRatio - 0.5) * 120 * (Math.PI / 180);
          const speed = Math.sqrt(dx * dx + dy * dy) * 1.05;
          
          dx = Math.sin(angle) * speed;
          dy = -Math.abs(Math.cos(angle) * speed);
          
          newY = paletaY - ballSize;
          setParticleTrigger(true);
          playHitSound();
          setTimeout(() => setParticleTrigger(false), 100);
        }

        // Colisión con bloques
        let bloquesActualizados = [...bloqueRef.current];
        let colisionDetectada = false;

        bloqueRef.current.forEach((bloque, index) => {
          if (!bloque.visible) return;

          const ballRight = newX + ballSize;
          const ballBottom = newY + ballSize;

          const colisiona =
            ballRight >= bloque.x &&
            newX <= bloque.x + blockW &&
            ballBottom >= bloque.y &&
            newY <= bloque.y + blockH;

            if (colisiona) {
              // determine collision axis by overlap depths
              const blockLeft = bloque.x;
              const blockRight = bloque.x + blockW;
              const blockTop = bloque.y;
              const blockBottom = bloque.y + blockH;

              const overlapX = Math.min(newX + ballSize - blockLeft, blockRight - newX);
              const overlapY = Math.min(newY + ballSize - blockTop, blockBottom - newY);

              bloquesActualizados[index].visible = false;
            colisionDetectada = true;
              // If pierce is active, don't change direction
              if (!pierceRef.current) {
                if (overlapX < overlapY) {
                  dx *= -1; // horizontal collision
                } else {
                  dy *= -1; // vertical collision
                }
              }
            // spawn a powerup based on difficulty probability and remaining budget
            // spawn a powerup with flat 2/5 chance (0.4) but still limited by remaining
            const prob = 2 / 5;
            if (spawnRemainingRef.current > 0 && Math.random() <= prob) {
              // weighted probabilities for types
              const weighted: Array<{ t: PowerupType; w: number }> = [
                { t: 'expand', w: 25 },
                { t: 'slow', w: 20 },
                { t: 'score', w: 25 },
                { t: 'shield', w: 15 },
                { t: 'multiplier', w: 12 },
                // add new types with smaller weights
                { t: 'sticky' as any, w: 10 },
                { t: 'pierce' as any, w: 8 },
              ];
              const totalW = weighted.reduce((s, it) => s + it.w, 0);
              let r = Math.random() * totalW;
              let chosen: any = 'score';
              for (const it of weighted) {
                if (r <= it.w) {
                  chosen = it.t;
                  break;
                }
                r -= it.w;
              }
              const pu: Powerup = {
                id: `pu-${Date.now()}-${index}`,
                x: bloque.x + blockW / 2 - powerupSize / 2,
                y: bloque.y + blockH / 2,
                type: chosen,
                dy: 2,
              };
              powerupsRef.current.push(pu);
              setPowerups([...powerupsRef.current]);
              spawnRemainingRef.current -= 1;
            }
          }
        });

        if (colisionDetectada) {
          setBloques(() => bloquesActualizados);
          setScore(s => s + Math.round(1 * multiplierRef.current));
          playHitSound();
        }

        // Update powerups positions and check collection
        if (powerupsRef.current.length > 0) {
          const paletaY = lh - paddleBottom - paddleHeight;
          const newPowerups: Powerup[] = [];
          for (const pu of powerupsRef.current) {
            const newPu = { ...pu, y: pu.y + pu.dy };
            // check if collected by paddle
            const puCenterX = newPu.x + powerupSize / 2;
            if (
              newPu.y + powerupSize >= paletaY &&
              puCenterX >= paletaXRef.current &&
              puCenterX <= paletaXRef.current + paddleWidthRef.current
            ) {
              // apply effect
              applyPowerup({ ...newPu, type: newPu.type as any });
              // collected -> don't keep
            } else if (newPu.y < lh) {
              newPowerups.push(newPu);
            }
          }
          powerupsRef.current = newPowerups;
          setPowerups(newPowerups);
        }

        // Reinicio si cae
        if (newY >= lh) {
          // if player has a shield, consume it and continue
          if (shieldRef.current) {
            shieldRef.current = false;
            // remove shield indicator
            setActivePowerups(prev => prev.filter(p => p.type !== 'shield'));
            // reset ball above paddle with small upward velocity
            return {
              x: paletaXRef.current + paddleWidthRef.current / 2 - ballSize / 2,
              y: lh - paddleBottom - paddleHeight - ballSize,
              dx: (difficultySettings[difficultyRef.current]?.speed || 2) * (Math.random() > 0.5 ? 1 : -1),
              dy: -Math.abs(dy) || -2,
            } as any;
          }

          // No shield -> Game Over
          setLastScore(score);
          setGameState('gameover');
          stopBackgroundMusic();
          playGameOverSound();
          const rows = difficultyRef.current ? difficultySettings[difficultyRef.current].rows : 4;
          setBloques(crearBloques(rows, blockW, blockH));

          return {
            x: paletaXRef.current + paddleWidthRef.current / 2 - ballSize / 2,
            y: lh - paddleBottom - paddleHeight - ballSize,
            dx: 0.1,
            dy: 0.1,
          };
        }

        return { ...prev, x: newX, y: newY, dx, dy };
      });
    }, 16);

    return () => clearInterval(interval);
  }, []);

    // UI updater: remove expired activePowerups (in case timeouts were cleared) and force indicator refresh
    useEffect(() => {
      const tick = setInterval(() => {
        const now = Date.now();
        setActivePowerups(prev => {
          const next = prev.filter(p => (p.expiresAt === null ? true : p.expiresAt > now));
          return next;
        });
      }, 500);
      return () => clearInterval(tick);
    }, []);

  return (
    <View 
      style={styles.container}
    >
      <Fondoanimado />
      {gameState === 'playing' && (
        <View style={styles.scoreBar}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreText}>Puntuación: {score}</Text>
          </View>
          <View style={styles.scoreCenter} pointerEvents="none">
            {activePowerups.length > 0 && (
              <View style={styles.powerupRow}>
                {activePowerups.map(p => {
                  const remaining = p.expiresAt ? Math.max(0, Math.ceil((p.expiresAt - Date.now()) / 1000)) : null;
                  const bg = p.type === 'expand' ? '#00FF88' : p.type === 'slow' ? '#3A86FF' : p.type === 'score' ? '#FFBE0B' : p.type === 'shield' ? '#FF006E' : '#FFD700';
                  const icon = p.type === 'expand' ? '↔️' : p.type === 'slow' ? '🐢' : p.type === 'score' ? '⭐' : p.type === 'shield' ? '🛡️' : '×2';
                  return (
                    <View key={`ind-${p.id}`} style={[styles.powerupPill, { backgroundColor: bg, marginLeft: 6 }]}>
                      <Text style={styles.powerupPillText}>{icon}{remaining ? ` ${remaining}s` : ''}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.scoreText}>
              Dificultad: {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
            </Text>
          </View>
        </View>
      )}
      <Ball x={bola.x} y={bola.y} size={ballSize} />
      <ParticleEffect x={bola.x} y={bola.y} trigger={particleTrigger} />
      {bloques.map((bloque, i) =>
        bloque.visible ? (
          <View
            key={`bloque-${i}`}
            style={[
              styles.bloque,
              { left: bloque.x, top: bloque.y, width: blockW, height: blockH, backgroundColor: (bloque as any).color || '#FF006E' },
            ]}
          />
        ) : null
      )}
      {powerups.map(pu => (
        <View
          key={pu.id}
          style={{
            position: 'absolute',
            left: pu.x,
            top: pu.y,
            width: powerupSize,
            height: powerupSize,
            borderRadius: 6,
            backgroundColor:
              pu.type === 'expand' ? '#00FF88' : pu.type === 'slow' ? '#3A86FF' : pu.type === 'score' ? '#FFBE0B' : pu.type === 'shield' ? '#FF006E' : '#FFD700',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 8,
          }}
        >
          <Text style={{ fontSize: 14 }}>
            {pu.type === 'expand' ? '↔️' : pu.type === 'slow' ? '🐢' : pu.type === 'score' ? '⭐' : pu.type === 'shield' ? '🛡️' : '×2'}
          </Text>
        </View>
      ))}
      <Paddle x={paletaX} width={paddleWidth} height={paddleHeight} bottomOffset={paddleBottom} />

      {/* Touch zone para controlar la paleta - solo parte inferior */}
      {gameState === 'playing' && (
        <View
          style={[styles.touchZone, { height: touchZoneHeight }]}
          onTouchStart={(e: GestureResponderEvent) => {
            touchPositionRef.current = e.nativeEvent.locationX;
            touchStartTimeRef.current = Date.now();
            touchStartXRef.current = e.nativeEvent.locationX;
          }}
          onTouchMove={(e: GestureResponderEvent) => {
            if (touchPositionRef.current !== null) {
              const newX = e.nativeEvent.locationX;
              const moveAmount = (newX - touchPositionRef.current) * 1.0; // aumentar velocidad
              setPaletaX(x => Math.max(0, Math.min(x + moveAmount, width - paddleWidthRef.current)));
              touchPositionRef.current = newX;
            }
          }}
          onTouchEnd={() => {
            touchPositionRef.current = null;
            touchStartTimeRef.current = null;
            touchStartXRef.current = null;
          }}
        />
      )}

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

      {gameState === 'victory' && (
        <View style={styles.menuOverlay} pointerEvents="box-none">
          <View style={[styles.menuBox, styles.victoryBox]}>
            <Text style={styles.victoryTitle}>¡VICTORIA!</Text>
            <Text style={styles.victoryScore}>Puntuación: {score}</Text>
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
      {gameState === 'gameover' && (
        <View style={styles.menuOverlay} pointerEvents="box-none">
          <View style={[styles.menuBox, styles.gameOverBox]}>
            <Text style={styles.victoryTitle}>GAME OVER</Text>
            <Text style={styles.victoryScore}>Puntuación: {lastScore ?? score}</Text>
            <View style={styles.menuButtons}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => startGame(difficulty)}
              >
                <Text style={styles.menuButtonText}>Reintentar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setGameState('menu')}
              >
                <Text style={styles.menuButtonText}>Menú</Text>
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
    top: Math.max(8, Math.round(height * 0.015)),
    left: Math.max(8, Math.round(width * 0.02)),
    right: Math.max(8, Math.round(width * 0.02)),
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    paddingHorizontal: Math.max(12, Math.round(width * 0.03)),
    paddingVertical: Math.max(8, Math.round(height * 0.01)),
    backgroundColor: '#FFD700',
    borderRadius: 12,
    borderWidth: 2,
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
  victoryBox: {
    backgroundColor: '#1a3a1a',
    borderColor: '#00FF88',
  },
  gameOverBox: {
    backgroundColor: '#3a1a1a',
    borderColor: '#FF006E',
  },
  victoryTitle: {
    color: '#00FF88',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 16,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  victoryScore: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  powerupPill: {
    paddingHorizontal: Math.max(5, Math.round(width * 0.008)),
    paddingVertical: Math.max(3, Math.round(height * 0.004)),
    borderRadius: 10,
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  powerupPillText: {
    color: '#0a0e27',
    fontWeight: '700',
  },
  touchZone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  scoreLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scoreCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  powerupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
