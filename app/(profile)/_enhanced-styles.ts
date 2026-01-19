import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius } from '@/lib/design-tokens';

export const enhancedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },

  // Header Styles
  headerWrapper: {
    marginBottom: spacing.md,
  },

  headerGradient: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: '#111827',
  },

  // Avatar Styles
  avatarContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  avatarGlow: {
    shadowColor: '#8e78fb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },

  avatarPlaceholder: {
    overflow: 'hidden',
  },

  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  editAvatarBadge: {
    position: 'absolute',
    bottom: 2, // Better positioning
    right: '32%', // Adjusted for larger avatar
    width: 32, // Slightly larger for better visibility
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff9b28',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3, // Restored border thickness
    borderColor: '#fff', // White border for better contrast
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Enhanced shadow
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // User Info
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },

  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(142, 120, 251, 0.2)',
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(142, 120, 251, 0.4)',
  },

  roleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#8e78fb',
    textTransform: 'capitalize',
  },

  userEmail: {
    fontSize: fontSize.sm,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: fontWeight.medium,
  },

  userBio: {
    fontSize: fontSize.sm,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    fontWeight: fontWeight.normal,
  },

  // Stats Container - 2x2 Grid (Normal Flow)
  statsContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  statCardWrapper: {
    flex: 1,
  },

  statCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Actions Container
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  actionButtonPrimary: {
    flex: 2,
    borderRadius: 24, // Fully rounded button
    overflow: 'visible', // Changed from 'hidden' to allow shadow to be visible
    shadowColor: '#8e78fb',
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow offset
    shadowOpacity: 0.2, // Reduced shadow opacity
    shadowRadius: 4, // Reduced shadow spread
    elevation: 4, // Reduced elevation
  },

  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm, // Better icon-text spacing
    paddingVertical: spacing.lg, // More comfortable padding
    paddingHorizontal: spacing.xl, // Better horizontal padding
    minHeight: 48, // Ensure minimum touch target
    borderRadius: 24, // Match parent border radius
  },

  actionButtonPrimaryText: {
    fontSize: fontSize.base, // Restored for better readability
    fontWeight: fontWeight.bold, // Stronger weight for primary action
    color: '#fff',
    letterSpacing: 0.5, // Better letter spacing
  },

  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm, // Better icon-text spacing
    paddingVertical: spacing.lg, // Match primary button padding
    paddingHorizontal: spacing.lg, // Better horizontal padding
    borderRadius: 24, // Fully rounded button to match primary
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent for modern look
    borderWidth: 2, // Restored border thickness
    borderColor: '#8e78fb',
    shadowColor: '#8e78fb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 48, // Match primary button height
  },

  actionButtonSecondaryText: {
    fontSize: fontSize.base, // Match primary button font size
    fontWeight: fontWeight.semibold,
    color: '#8e78fb',
    letterSpacing: 0.3, // Better letter spacing
  },

  // Bio Section Styles
  bioSection: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: '#1f2937',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#374151',
  },

  bioTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#8e78fb',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  bioText: {
    fontSize: fontSize.base,
    color: '#e5e7eb',
    lineHeight: 24,
    fontWeight: fontWeight.normal,
  },

  bioEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },

  bioEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(142, 120, 251, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  bioEmptyText: {
    fontSize: fontSize.sm,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  bioEmptySubtext: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Tabs Styles
  tabsWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },

  tabActive: {
    // Active styles handled by gradient overlay
  },

  tabActiveGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.md,
  },

  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: '#9ca3af',
    zIndex: 1,
  },

  tabTextActive: {
    color: '#fff',
    fontWeight: fontWeight.semibold,
  },

  // Tab Content
  tabContent: {
    flex: 1,
  },

  // About Section
  aboutSection: {
    padding: spacing.md,
  },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
    marginBottom: spacing.md,
  },

  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#374151',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: 'rgba(142, 120, 251, 0.15)',
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  infoText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: '#ffffff',
  },

  // Activity Section
  activitySection: {
    padding: spacing.md,
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#1f2937',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#374151',
  },

  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
    marginBottom: spacing.xs,
  },

  activityDescription: {
    fontSize: fontSize.sm,
    color: '#9ca3af',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },

  activityTime: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    fontWeight: fontWeight.medium,
  },

  emptyStateCard: {
    backgroundColor: '#1f2937',
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },

  emptyStateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(142, 120, 251, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  emptyStateText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
    marginBottom: spacing.xs,
  },

  emptyStateSubtext: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Loading & Empty States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#111827',
  },

  emptyText: {
    fontSize: fontSize.base,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  button: {
    backgroundColor: '#8e78fb',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },

  buttonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#fff',
    textAlign: 'center',
  },
});
