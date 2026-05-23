// src/Styles/globalStyles.js

import { StyleSheet } from 'react-native';

// Imported in each screen as { COLORS }
export const COLORS = {
  // Main colors
  primary:        '#000000',    // Black — main app color
  secondary:      '#276EF1',    // Blue — action and destination buttons
  accent:         '#05A357',    // Green — confirmations and success

  // Backgrounds
  background:     '#F6F6F6',    // General screen background
  surface:        '#FFFFFF',    // Card and container background

  // Texts
  textPrimary:    '#000000',    // Primary text
  textSecondary:  '#757575',    // Secondary text and placeholders

  // States
  success:        '#05A357',    // Green for success
  error:          '#E11900',    // Red for errors
  warning:        '#FFC043',    // Yellow for warnings
  disabled:       '#AFAFAF',    // Gray for disabled

  // Borders
  border:         '#E0E0E0',    // Input and card borders
};

// Imported in each screen as { globalStyles }
export const globalStyles = StyleSheet.create({

  // ── Containers ──
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Texts ──
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },

  bodyText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  mutedText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 16,
  },

  // ── Inputs ──
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
    marginBottom: 4,
    justifyContent: 'center',
  },

  inputError: {
    borderColor: COLORS.error,
  },

  // ── Buttons ──
  button: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  buttonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },

  buttonSecondary: {
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },

  buttonDisabled: {
    backgroundColor: COLORS.disabled,
  },

  buttonDanger: {
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  buttonDangerText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: 'bold',
  },

  // ── Empty states ──
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Dividers ──
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  // ── Dropdown ──
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownSelected: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  dropdownPlaceholder: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  optionsList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },

  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  optionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});