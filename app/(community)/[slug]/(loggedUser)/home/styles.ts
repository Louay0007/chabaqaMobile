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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
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
    color: colors.gray500,
    textTransform: 'capitalize',
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
    minHeight: 80,
    maxHeight: 150,
    backgroundColor: colors.inputBackground,
    textAlignVertical: 'top',
    fontSize: fontSize.base,
    color: colors.gray800,
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
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    marginRight: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.actionButtonBackground,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    marginLeft: spacing.sm,
  },
  postButtonText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  postButtonDisabled: {
    backgroundColor: colors.gray300,
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
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 16,
  },
  bottomOptionText: {
    fontSize: 17,
    color: colors.gray900,
    fontWeight: '400',
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
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  imagePreview: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  previewImage: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    borderRadius: borderRadius.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
  },
});