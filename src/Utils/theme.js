const theme = {
  colors: {
    // Colores principales — estilo Uber (oscuro y limpio)
    primary: '#000000',       // Negro principal
    secondary: '#FFFFFF',     // Blanco
    accent: '#276EF1',        // Azul para botones de acción

    // Fondos
    background: '#F6F6F6',    // Gris muy claro para fondos de pantalla
    surface: '#FFFFFF',       // Blanco para tarjetas y contenedores

    // Textos
    textPrimary: '#000000',   // Texto principal
    textSecondary: '#757575', // Texto secundario / placeholders
    textLight: '#FFFFFF',     // Texto sobre fondos oscuros

    // Estados
    success: '#05A357',       // Verde para confirmaciones
    error: '#E11900',         // Rojo para errores de validación
    warning: '#FFC043',       // Amarillo para advertencias
    disabled: '#AFAFAF',      // Gris para elementos deshabilitados

    // Bordes
    border: '#E0E0E0',        // Bordes de inputs y tarjetas
  },

  // Tamaños de fuente
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 30,
  },

  // Espaciados
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Bordes redondeados
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 999,  // Para botones completamente redondeados
  },
};

export default theme;