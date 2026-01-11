import { authenticatedPost } from './auth';
import PlatformUtils from './platform-utils';
import { Platform } from 'react-native';

// Ce fichier n'est pas une route, mais une API utilitaire
// Pour Expo Router, on peut ajouter cette ligne pour éviter les avertissements
export const unstable_settings = {
  isNotARoute: true,
};

interface CommunityFormData {
  name: string;
  bio: string;
  country: string;
  status: string;
  joinFee: string;
  feeAmount: string;
  currency: string;
  socialLinks: {
    instagram: string;
    tiktok: string;
    facebook: string;
    youtube: string;
    linkedin: string;
    website: string;
  };
  coverImage?: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  communityId?: string;
  message?: string;
}

export async function createCommunityAction(formData: CommunityFormData, logoUri?: string, coverImageUri?: string): Promise<ApiResponse> {
  try {
    console.log('🚀 Tentative de création de communauté:', { name: formData.name });
    console.log('📋 Données complètes à envoyer:', JSON.stringify(formData, null, 2));
    
    // First upload images if provided
    let logoUrl = '';
    let coverImageUrl = '';
    
    if (logoUri) {
      console.log('📸 Upload du logo...');
      const logoUploadResult = await uploadImage(logoUri, 'logo');
      if (logoUploadResult.success) {
        logoUrl = logoUploadResult.url || '';
        console.log('✅ Logo uploadé:', logoUrl);
      } else {
        console.error('❌ Erreur upload logo:', logoUploadResult.error);
      }
    }
    
    if (coverImageUri) {
      console.log('🖼️ Upload de l\'image de couverture...');
      const coverUploadResult = await uploadImage(coverImageUri, 'cover');
      if (coverUploadResult.success) {
        coverImageUrl = coverUploadResult.url || '';
        console.log('✅ Image de couverture uploadée:', coverImageUrl);
      } else {
        console.error('❌ Erreur upload cover:', coverUploadResult.error);
      }
    }
    
    // Prepare data with uploaded image URLs
    const dataToSend = {
      ...formData,
      logo: logoUrl,
      coverImage: coverImageUrl,
    };
    
    // Use the proper API URL with /api prefix
    const apiUrl = `${PlatformUtils.getApiUrl()}/api/community-aff-crea-join/create`;
    console.log('📡 URL API:', apiUrl);
    
    const response = await authenticatedPost(apiUrl, dataToSend);

    console.log('📨 Réponse reçue:', response.status);

    const data = await response.json();
    console.log('📋 Données reçues:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Erreur API:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      return {
        success: false,
        error: data.message || data.error || 'Erreur lors de la création de la communauté',
      };
    }

    console.log('✅ Communauté créée avec succès');
    return {
      success: true,
      communityId: data.data?.id || data.data?._id || data.communityId || data.id,
      message: data.message || 'Communauté créée avec succès',
    };
  } catch (error) {
    console.error('❌ Erreur lors de la création de la communauté:', error);
    return {
      success: false,
      error: 'Erreur de connexion. Veuillez réessayer.',
    };
  }
}

export async function uploadImage(imageUri: string, type: 'logo' | 'cover'): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const accessToken = await import('./auth').then(auth => auth.getAccessToken());
    
    if (!accessToken) {
      return {
        success: false,
        error: 'Non authentifié. Veuillez vous connecter.',
      };
    }

    const formData = new FormData();
    
    // Create proper file object for different platforms
    if (Platform.OS === 'web') {
      // For web, we need to fetch the blob and create a File object
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const file = new File([blob], `${type}-image.jpg`, { type: 'image/jpeg' });
      formData.append('file', file);
    } else {
      // For React Native (iOS/Android)
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${type}-image.jpg`,
      } as any);
    }

    const apiUrl = `${PlatformUtils.getApiUrl()}/api/upload/single`;
    console.log('📤 Upload vers:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type for FormData - let fetch set it with boundary
      },
      body: formData,
    });

    const data = await response.json();
    console.log('📨 Réponse upload:', data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Erreur lors de l\'upload de l\'image',
      };
    }

    return {
      success: true,
      url: data.url || data.data?.url,
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload de l\'image:', error);
    return {
      success: false,
      error: 'Erreur de connexion lors de l\'upload.',
    };
  }
}
