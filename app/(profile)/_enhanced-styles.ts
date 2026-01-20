import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius } from '@/lib/design-tokens';

export const enhancedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header Styles
  headerWrapper: {
    marginBottom: spacing.md,
  },

  headerGradient: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
  },

  // Avatar Styles
  avatarContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  avatarGlow: {
    shadowColor: '#8B5CF6',
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
    borderColor: '#8B5CF6',
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
    bottom: 2,
    right: '32%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // User Info
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },

  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },

  roleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#8B5CF6',
    textTransform: 'capitalize',
  },

  userEmail: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: fontWeight.medium,
  },

  userBio: {
    fontSize: fontSize.sm,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    color: '#000000',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: '#6B7280',
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
    borderRadius: 24,
    overflow: 'visible',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
    borderRadius: 24,
  },

  actionButtonPrimaryText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },

  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 48,
  },

  actionButtonSecondaryText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#1F2937',
    letterSpacing: 0.3,
  },

  // Bio Section Styles
  bioSection: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  bioTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#8B5CF6',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  bioText: {
    fontSize: fontSize.base,
    color: '#374151',
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
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  bioEmptyText: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  bioEmptySubtext: {
    fontSize: fontSize.xs,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Tabs Styles
  tabsWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#6B7280',
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
    color: '#000000',
    marginBottom: spacing.md,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  infoText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: '#000000',
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
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#000000',
    marginBottom: spacing.xs,
  },

  activityDescription: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },

  activityTime: {
    fontSize: fontSize.xs,
    color: '#9CA3AF',
    fontWeight: fontWeight.medium,
  },

  emptyStateCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyStateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  emptyStateText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: '#000000',
    marginBottom: spacing.xs,
  },

  emptyStateSubtext: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Loading & Empty States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#FFFFFF',
  },

  emptyText: {
    fontSize: fontSize.base,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  button: {
    backgroundColor: '#8B5CF6',
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

  // Danger Zone Styles
  dangerZone: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  dangerZoneDescription: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
