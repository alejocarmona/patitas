export const theme = {
  // Naranja de marca: solo superficies grandes sin texto pequeño (ícono, splash, acentos).
  primary: '#FF6B35',
  // Relleno de botones/headers con texto blanco (5,18:1) y texto/ícono de acción sobre blanco.
  primaryStrong: '#C2410C',
  primaryDark: '#E5521A',
  secondary: '#2D4A3E',
  accent: '#FFD166',
  bg: '#FDF6F0',
  text: '#1A1A2E',
  textMuted: '#62627E',
  // Fechas, "Leer más", placeholders (4,92:1 sobre blanco). Nunca #B0B0C8 para texto.
  textSubtle: '#6E6E8C',
  // Solo líneas e íconos inactivos, nunca texto
  divider: '#B0B0C8',
  // Verde "ok" (blanco encima 5,28:1)
  success: '#257A50',
  // Rojo: solo "vencida", errores y acciones destructivas (5,70:1 sobre blanco)
  danger: '#C81E31',
  // Acción neutra (Eliminar en tarjetas): gris, no rojo
  neutralAction: '#62627E',
  border: '#F0E8E0',
  // Color nativo de acento (pickers, diálogos): igual a secondary
  nativeAccent: '#2D4A3E',
  switchOff: '#8A8A9E',
};

// Estados de vacuna: texto oscuro sobre fondo claro tintado (≥4,5:1) + ícono (no depender solo del color)
export const statusColors = {
  ok: { fg: '#257A50', bg: '#E7F4EE', icon: 'check-circle' },
  pronto: { fg: '#7A5A00', bg: '#FBF2DD', icon: 'clock' },
  vencida: { fg: '#C81E31', bg: '#FFE6E9', icon: 'alert-triangle' },
  completa: { fg: '#2D4A3E', bg: '#E3E7E5', icon: 'shield' },
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 28,
};

// Familias registradas con @expo-google-fonts/inter (ver app/_layout.jsx)
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
};
