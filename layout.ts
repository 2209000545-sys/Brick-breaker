/**
 * Helper centralizado para el cálculo del layout responsivo.
 * Garantiza tamaños consistentes en todos los dispositivos y componentes.
 */

export interface LayoutDimensions {
  paddleWidth: number;
  paddleHeight: number;
  paddleBottom: number;
  ballSize: number;
  powerupSize: number;
  blockWidth: number;
  blockHeight: number;
  touchZoneHeight: number;
  scoreBarMargin: number;
  scoreBarPadding: number;
  powerupPillPaddingH: number;
  powerupPillPaddingV: number;
  blockSpacing: number;
}

/**
 * Calcula todas las dimensiones del layout basadas en el ancho y alto del dispositivo.
 * Usa cálculos basados en porcentajes para escalar de forma natural en distintos dispositivos.
 */
export const calculateLayout = (
  screenWidth: number,
  screenHeight: number
): LayoutDimensions => {
  // Limitar dimensiones de pantalla para manejar casos límite
  const w = Math.max(320, screenWidth);
  const h = Math.max(480, screenHeight);

  // Calcular factor de densidad: ayuda a escalar más agresivamente en pantallas muy pequeñas/grandes
  const minDim = Math.min(w, h);
  const densityFactor = minDim / 400; // 400px es la referencia base

  return {
    // Paleta: 15-18% del ancho de pantalla, escala con el factor de densidad
    paddleWidth: Math.max(60, Math.min(180, Math.round(w * 0.16 * densityFactor))),
    // Altura de la paleta: 2-3% del alto de pantalla
    paddleHeight: Math.max(8, Math.round(h * 0.025)),
    // Offset inferior de la paleta: 10-12% del alto de pantalla
    paddleBottom: Math.max(30, Math.round(h * 0.11)),

    // Tamaño de la bola: 3-3.5% de la dimensión menor
    ballSize: Math.max(10, Math.round(minDim * 0.032)),

    // Tamaño del powerup: 3.5-4% del ancho de pantalla
    powerupSize: Math.max(10, Math.round(w * 0.036)),

    // Ancho de bloque: 6 columnas con separación
    blockWidth: Math.floor((w - 7 * 6) / 6), // 6px de separación por bloque
    // Alto de bloque: 2-2.5% del alto de pantalla
    blockHeight: Math.max(12, Math.round(h * 0.022)),

    // Zona táctil: 18-22% del alto de pantalla (área inferior de control)
    touchZoneHeight: Math.max(90, Math.round(h * 0.2)),

    // Márgenes/padding de la barra de puntuación: responsivo
    scoreBarMargin: Math.max(6, Math.round(w * 0.015)),
    scoreBarPadding: Math.max(10, Math.round(w * 0.025)),

    // Padding de las pastillas de powerup
    powerupPillPaddingH: Math.max(4, Math.round(w * 0.008)),
    powerupPillPaddingV: Math.max(2, Math.round(h * 0.003)),

    // Espaciado entre bloques: fijo en 6px por consistencia
    blockSpacing: 6,
  };
};

/**
 * Get layout dimensions for current device.
 * Convenience function that wraps calculateLayout.
 */
export const getLayout = (screenWidth: number, screenHeight: number): LayoutDimensions => {
  return calculateLayout(screenWidth, screenHeight);
};
