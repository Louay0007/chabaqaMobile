import { Archive, Download, File, FileText, Image as ImageIcon, Lock, Music, ShoppingCart, Video } from 'lucide-react-native';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles';

interface File {
  id: string;
  name: string;
  type: string;
  size: string;
  url?: string;
  isPaid?: boolean;
  isDownloaded?: boolean;
  downloadProgress?: number;
}

interface FilesTabProps {
  files: File[];
  hasAccess: boolean;
  onDownload: (fileId: string) => void;
  onPurchase: () => void;
}

export const FilesTab: React.FC<FilesTabProps> = ({ 
  files, 
  hasAccess, 
  onDownload, 
  onPurchase 
}) => {
  const getFileIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    const iconProps = { size: 20, color: '#6366f1' };
    if (t.includes('pdf') || t.includes('doc') || t.includes('txt')) return <FileText {...iconProps} />;
    if (t.includes('png') || t.includes('jpg') || t.includes('jpeg') || t.includes('svg') || t.includes('webp')) return <ImageIcon {...iconProps} />;
    if (t.includes('mp4') || t.includes('mov') || t.includes('avi')) return <Video {...iconProps} />;
    if (t.includes('mp3') || t.includes('wav') || t.includes('aac')) return <Music {...iconProps} />;
    if (t.includes('zip') || t.includes('rar') || t.includes('7z')) return <Archive {...iconProps} />;
    return <File {...iconProps} />;
  };

  const getStatusPill = (file: File) => {
    if (!hasAccess && file.isPaid) {
      return (
        <View style={[styles.filePill, styles.filePillLocked]}>
          <Lock size={12} color="#6b7280" />
          <Text style={styles.filePillText}>Locked</Text>
        </View>
      );
    }

    if (file.isPaid) {
      return (
        <View style={[styles.filePill, styles.filePillPaid]}>
          <Text style={styles.filePillText}>Premium</Text>
        </View>
      );
    }

    return (
      <View style={[styles.filePill, styles.filePillFree]}>
        <Text style={styles.filePillText}>Free</Text>
      </View>
    );
  };

  const renderFileAction = (file: File) => {
    if (!hasAccess && file.isPaid) {
      return (
        <TouchableOpacity 
          style={[styles.fileActionButton, styles.fileActionButtonPrimary]} 
          onPress={onPurchase}
        >
          <ShoppingCart size={14} color="#fff" />
          <Text style={styles.fileActionButtonText}>Buy</Text>
        </TouchableOpacity>
      );
    }

    if (!hasAccess) {
      return (
        <TouchableOpacity 
          style={[styles.fileActionButton, styles.fileActionButtonDisabled]}
          disabled
        >
          <Lock size={14} color="#666" />
          <Text style={styles.fileActionButtonTextDisabled}>Locked</Text>
        </TouchableOpacity>
      );
    }

    if (file.isDownloaded) {
      return (
        <TouchableOpacity 
          style={[styles.fileActionButton, styles.fileActionButtonSuccess]}
          onPress={() => onDownload(file.id)}
        >
          <Download size={14} color="#fff" />
          <Text style={styles.fileActionButtonText}>Open</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.fileActionButton, styles.fileActionButtonSuccess]}
        onPress={() => onDownload(file.id)}
      >
        <Download size={14} color="#fff" />
        <Text style={styles.fileActionButtonText}>Download</Text>
      </TouchableOpacity>
    );
  };

  const renderFileItem = ({ item }: { item: File }) => (
    <View style={styles.fileCard}>
      <View style={styles.fileCardTopRow}>
        <View style={styles.fileIcon}>
          {getFileIcon(item.type)}
        </View>

        <View style={styles.fileMainInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.fileMetaRow}>
            <View style={styles.fileMetaBadge}>
              <Text style={styles.fileMetaText}>{(item.type || 'FILE').toUpperCase()}</Text>
            </View>
            {!!item.size && (
              <View style={styles.fileMetaBadgeMuted}>
                <Text style={styles.fileMetaTextMuted}>{item.size}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.fileRightColumn}>
          {getStatusPill(item)}
        </View>
      </View>

      {item.downloadProgress !== undefined && item.downloadProgress < 100 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.downloadProgress}%` }
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.fileCardBottomRow}>
        {renderFileAction(item)}
      </View>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      {files.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardText}>Aucun fichier disponible.</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={renderFileItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};
