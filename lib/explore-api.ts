import { tryEndpoints } from './http';
import PlatformUtils from './platform-utils';
import { getImageUrl } from './image-utils';

const API_BASE_URL = PlatformUtils.getApiUrl();

// --- Data Interfaces ---

export interface Creator {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
    profile_picture?: string;
    photo_profil?: string;
    photo?: string;
}

export interface CommunityRef {
    _id: string;
    name?: string;
    slug?: string;
    logo?: string;
    image?: string;
}

export interface BaseItem {
    _id: string;
    title?: string;
    name?: string;
    description?: string;
    thumbnail?: string;
    image?: string;
    logo?: string;
    creator?: Creator | string;
    community?: CommunityRef | string;
    createdAt?: string;
    [key: string]: any;
}

export interface Course extends BaseItem {
    titre?: string;
    prix?: number;
    isPaid?: boolean;
    devise?: string;
    duree?: string;
    niveau?: string;
    category?: string;
    averageRating?: number;
    totalRatings?: number;
}

export interface Challenge extends BaseItem {
    startDate?: string;
    endDate?: string;
    difficulty?: string;
    entryFee?: number;
    participantsCount?: number;
    participantCount?: number;
    status?: string;
}

export interface Product extends BaseItem {
    price?: number;
    salePrice?: number;
    type?: 'physical' | 'digital';
    rating?: number;
    reviewsCount?: number;
    inventory?: number;
}

export interface EventItem extends BaseItem {
    startDate?: string;
    endDate?: string;
    location?: string;
    isOnline?: boolean;
    ticketPrice?: number;
    attendeesCount?: number;
}

export interface Session extends BaseItem {
    duration?: number;
    price?: number;
    available?: boolean;
    category?: string;
}

export interface DiscoverData {
    courses: Course[];
    challenges: Challenge[];
    products: Product[];
    events: EventItem[];
    sessions: Session[];
}

// --- Helper Functions ---

export const getCreatorInfo = (item: BaseItem) => {
    let name = 'Unknown Creator';
    let avatar = null;

    if (typeof item.creator === 'object' && item.creator) {
        name = item.creator.name || name;
        avatar = item.creator.avatar ||
            item.creator.profile_picture ||
            item.creator.photo_profil ||
            item.creator.photo;
    }

    if (!avatar && (item as any).creatorAvatar) {
        avatar = (item as any).creatorAvatar;
    }

    return {
        name,
        avatar: getImageUrl(avatar),
        initials: name.substring(0, 2).toUpperCase()
    };
};

export const getItemImage = (item: BaseItem) => {
    const rawImage = item.thumbnail || item.image || item.logo || (item as any).coverImage || (item as any).photo_de_couverture;
    return getImageUrl(rawImage);
};

export const getItemTitle = (item: BaseItem) => {
    return item.title || item.name || (item as any).titre || 'Untitled';
};

// --- API Fetch Functions ---

export async function getCourses(limit: number = 10): Promise<Course[]> {
    const query = `?limit=${limit}`;
    try {
        const response = await tryEndpoints(`${API_BASE_URL}/api/cours${query}`, { timeout: 5000 });
        console.log('📚 [COURSES] Response status:', response.status);
        console.log('📚 [COURSES] Response data keys:', Object.keys(response.data || {}));

        // Backend returns: { success: true, data: { courses: [...] } }
        if (response.data?.data?.courses) {
            console.log(`✅ [COURSES] Fetched ${response.data.data.courses.length} courses`);
            return response.data.data.courses;
        } else if (response.data?.courses) {
            console.log(`✅ [COURSES] Fetched ${response.data.courses.length} courses (alt)`);
            return response.data.courses;
        }
        console.log('⚠️ [COURSES] No courses found in response');
        return [];
    } catch (e) {
        console.error('❌ Error fetching courses:', e);
        return [];
    }
}

export async function getChallenges(limit: number = 10): Promise<Challenge[]> {
    const query = `?limit=${limit}&isActive=true`;
    try {
        const response = await tryEndpoints(`${API_BASE_URL}/api/challenges${query}`, { timeout: 5000 });
        console.log('🏆 [CHALLENGES] Response status:', response.status);
        console.log('🏆 [CHALLENGES] Response data keys:', Object.keys(response.data || {}));

        // Backend returns: { challenges: [...], total, page, limit, totalPages }
        if (response.data?.challenges) {
            console.log(`✅ [CHALLENGES] Fetched ${response.data.challenges.length} challenges`);
            return response.data.challenges;
        } else if (Array.isArray(response.data)) {
            console.log(`✅ [CHALLENGES] Fetched ${response.data.length} challenges (array)`);
            return response.data;
        }
        console.log('⚠️ [CHALLENGES] No challenges found in response');
        return [];
    } catch (e) {
        console.error('❌ Error fetching challenges:', e);
        return [];
    }
}

export async function getProducts(limit: number = 10): Promise<Product[]> {
    const query = `?limit=${limit}`;
    try {
        const response = await tryEndpoints(`${API_BASE_URL}/api/products${query}`, { timeout: 5000 });
        console.log('🛍️ [PRODUCTS] Response status:', response.status);
        console.log('🛍️ [PRODUCTS] Response data keys:', Object.keys(response.data || {}));

        if (response.data?.data?.products) {
            console.log(`✅ [PRODUCTS] Fetched ${response.data.data.products.length} products`);
            return response.data.data.products;
        } else if (response.data?.products) {
            console.log(`✅ [PRODUCTS] Fetched ${response.data.products.length} products (alt)`);
            return response.data.products;
        }
        console.log('⚠️ [PRODUCTS] No products found in response');
        return [];
    } catch (e) {
        console.error('❌ Error fetching products:', e);
        return [];
    }
}

export async function getEvents(limit: number = 10): Promise<EventItem[]> {
    const query = `?limit=${limit}&isActive=true`;
    try {
        const response = await tryEndpoints(`${API_BASE_URL}/api/events${query}`, { timeout: 5000 });
        console.log('📅 [EVENTS] Response status:', response.status);
        console.log('📅 [EVENTS] Response data keys:', Object.keys(response.data || {}));

        if (response.data?.data?.events) {
            console.log(`✅ [EVENTS] Fetched ${response.data.data.events.length} events`);
            return response.data.data.events;
        } else if (response.data?.events) {
            console.log(`✅ [EVENTS] Fetched ${response.data.events.length} events (alt)`);
            return response.data.events;
        }
        console.log('⚠️ [EVENTS] No events found in response');
        return [];
    } catch (e) {
        console.error('❌ Error fetching events:', e);
        return [];
    }
}

export async function getSessions(limit: number = 10): Promise<Session[]> {
    const query = `?limit=${limit}&isActive=true`;
    try {
        const response = await tryEndpoints(`${API_BASE_URL}/api/sessions${query}`, { timeout: 5000 });
        console.log('💬 [SESSIONS] Response status:', response.status);
        console.log('💬 [SESSIONS] Response data keys:', Object.keys(response.data || {}));

        if (response.data?.data?.sessions) {
            console.log(`✅ [SESSIONS] Fetched ${response.data.data.sessions.length} sessions`);
            return response.data.data.sessions;
        } else if (response.data?.sessions) {
            console.log(`✅ [SESSIONS] Fetched ${response.data.sessions.length} sessions (alt)`);
            return response.data.sessions;
        }
        console.log('⚠️ [SESSIONS] No sessions found in response');
        return [];
    } catch (e) {
        console.error('❌ Error fetching sessions:', e);
        return [];
    }
}

// Fetch all discover data in parallel
export async function getDiscoverData(limitPerCategory: number = 10): Promise<DiscoverData> {
    console.log('🚀 [EXPLORE] Fetching discover data...');

    try {
        const [courses, challenges, products, events, sessions] = await Promise.all([
            getCourses(limitPerCategory),
            getChallenges(limitPerCategory),
            getProducts(limitPerCategory),
            getEvents(limitPerCategory),
            getSessions(limitPerCategory)
        ]);

        console.log(`✅ [EXPLORE] Fetched: ${courses.length} courses, ${challenges.length} challenges, ${products.length} products, ${events.length} events, ${sessions.length} sessions`);

        return {
            courses,
            challenges,
            products,
            events,
            sessions
        };
    } catch (error) {
        console.error('❌ [EXPLORE] Fatal error fetching discover data:', error);
        return {
            courses: [],
            challenges: [],
            products: [],
            events: [],
            sessions: []
        };
    }
}
