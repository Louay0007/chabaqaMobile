import { colors } from '@/lib/design-tokens';
import { Edit2, Trash2 } from 'lucide-react-native';
import React from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { modalStyles } from './modal-styles';

interface PostMenuOverlayProps {
  onEditPost?: () => void;
  onDeletePost?: () => void;
  onClose: () => void;
  isAuthor?: boolean;
}

export default function PostMenuOverlay({
  onEditPost,
  onDeletePost,
  onClose,
  isAuthor = false,
}: PostMenuOverlayProps) {
  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={modalStyles.postMenuOverlay}>
        <TouchableWithoutFeedback>
          <View style={modalStyles.menuContainer}>
            {isAuthor && onEditPost && (
              <>
                <TouchableOpacity 
                  style={modalStyles.menuItem} 
                  onPress={onEditPost}
                  activeOpacity={0.7}
                >
                  <Edit2 size={20} color={colors.gray600} />
                  <Text style={modalStyles.menuItemText}>Edit post</Text>
                </TouchableOpacity>
                <View style={modalStyles.menuDivider} />
              </>
            )}
            
            {isAuthor && onDeletePost && (
              <TouchableOpacity 
                style={modalStyles.menuItem} 
                onPress={onDeletePost}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color={colors.error} />
                <Text style={[modalStyles.menuItemText, modalStyles.errorText]}>Delete post</Text>
              </TouchableOpacity>
            )}
            
            {!isAuthor && (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: colors.gray500, fontSize: 14 }}>No actions available</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}
