import { StyleSheet } from 'react-native';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../../../../lib/design-tokens';

// Styles optimisés pour la page d'accueil de la communauté
export const styles = StyleSheet.create({
  // ==========================================
  // CONTAINERS PRINCIPAUX
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80, // Espace pour la bottom navigation
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    textAlign: 'center',
  },

  // ==========================================
  // LAYOUTS RESPONSIVE
  // ==========================================
  mobileContent: {
    flexDirection: 'column',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  desktopContent: {
    flexDirection: 'row',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mainContent: {
    flex: 2,
    flexDirection: 'column',
  },
  sidebarContainer: {
    flex: 1,
  },

  // ==========================================
  // CREATE POST CARD
  // ==========================================
  createPostCard: {
    backgroundColor: colors.postBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.postBorder,
  },
  createPostCardFocused: {
    borderColor: '#8B5CF6',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.postBorder,
  },
  userInfoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
    marginBottom: 2,
  },
  userRole: {
    fontSize: fontSize.xs,
    color: '#8B5CF6',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  inputWrapper: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    paddingTop: spacing.md,
    minHeight: 100,
    maxHeight: 200,
    backgroundColor: colors.inputBackground,
    textAlignVertical: 'top',
    fontSize: fontSize.base,
    color: colors.gray800,
    lineHeight: 22,
  },
  inputContainerFocused: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  charCounterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  charCounter: {
    fontSize: fontSize.xs,
    color: colors.gray500,
    fontWeight: '500',
  },
  charCounterError: {
    color: '#EF4444',
  },
  charCounterWarning: {
    color: '#F59E0B',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  warningText: {
    fontSize: fontSize.xs,
    color: '#F59E0B',
    fontWeight: '500',
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: '#EF4444',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.actionButtonBackground,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonActive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#8B5CF6',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginLeft: spacing.sm,
  },
  postButtonText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
  postButtonDisabled: {
    backgroundColor: colors.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },

  // ==========================================
  // POST CARDS (pour référence future)
  // ==========================================
  postsList: {
    marginBottom: spacing.lg,
  },
  postCard: {
    backgroundColor: colors.postBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
  },
  posterMeta: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  postContent: {
    fontSize: fontSize.sm,
    color: colors.gray800,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.tagBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.gray600,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.postActionBorder,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  postActionText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  bookmarkButton: {
    padding: spacing.xs,
  },

  // ==========================================
  // MODAL STYLES
  // ==========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 8,
    paddingHorizontal: spacing.lg,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  bottomOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F9FAFB',
    marginBottom: spacing.sm,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  bottomOptionText: {
    fontSize: 16,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: 2,
  },
  bottomOptionSubtext: {
    fontSize: 13,
    color: colors.gray500,
  },
  cancelButton: {
    marginTop: spacing.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '80%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: 12,
  },
  optionText: {
    fontSize: fontSize.base,
    color: colors.gray700,
    fontWeight: fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
  },
  emojiModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  emojiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  emojiTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
  },
  emojiGrid: {
    padding: spacing.lg,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
  },
  emojiText: {
    fontSize: 28,
  },
  linkModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '85%',
    maxWidth: 400,
    padding: spacing.xl,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  linkTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
  },
  linkInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
    color: colors.gray900,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  addButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  imagePreviewContainer: {
    marginTop: spacing.md,
  },
  imagePreview: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});