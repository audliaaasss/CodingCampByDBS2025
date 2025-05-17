import CONFIG from '../config';
import { getAccessToken } from '../utils/auth';

const ENDPOINTS = {
    REGISTER: `${CONFIG.BASE_URL}/register`,
    LOGIN: `${CONFIG.BASE_URL}/login`,

    ADD_GUEST_STORY: `${CONFIG.BASE_URL}/stories/guest`,
    ADD_STORY: `${CONFIG.BASE_URL}/stories`,

    GET_STORIES: `${CONFIG.BASE_URL}/stories`,
    GET_DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,

    SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
    UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

async function fetchWithRetry(url, options, maxRetries = 3) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url, options);
            if (response.ok || response.status !== 504) {
                return response;
            }
        } catch (error) {
            console.log(`Attempt ${retries + 1} failed: ${error.message}`);
        }
        
        retries++;
        if (retries < maxRetries) {
            const delay = Math.min(1000 * (2 ** retries), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    return fetch(url, options);
}

export async function getRegistered({ name, email, password }) {
    const data = JSON.stringify({ name, email, password });

    const fetchResponse = await fetchWithRetry(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
        },
        body: data,
    });
    const json = await fetchResponse.json();

    return {
        ...json,
        ok: fetchResponse.ok,
    };
}

export async function getLogin({ email, password }) {
    const data = JSON.stringify({ email, password });

    const fetchResponse = await fetchWithRetry(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
        },
        body: data,
    });
    const json = await fetchResponse.json();

    return {
        ...json,
        ok: fetchResponse.ok,
    };
}

export async function getAllStories() {
    const accessToken = getAccessToken();

    try {
        const fetchResponse = await fetchWithRetry(ENDPOINTS.GET_STORIES, {
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Origin': window.location.origin
            },
        });
        
        const json = await fetchResponse.json();
        
        return {
            ...json,
            ok: fetchResponse.ok,
        };
    } catch (error) {
        console.error('Error fetching stories:', error);
        
        return {
            error: true,
            message: 'Failed to load stories. Please try again later.',
            listStory: [],
            ok: false
        };
    }
}

export async function getDetailStory(id) {
    const accessToken = getAccessToken();

    try {
        const fetchResponse = await fetchWithRetry(ENDPOINTS.GET_DETAIL_STORY(id), {
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Origin': window.location.origin
            },
        });
        
        const json = await fetchResponse.json();
        
        return {
            ...json,
            ok: fetchResponse.ok,
        };
    } catch (error) {
        console.error('Error fetching story details:', error);
        return {
            error: true,
            message: 'Failed to load story details. Please try again later.',
            story: null,
            ok: false
        };
    }
}

export async function addStory({
    description,
    photo,
    lat,
    lon,
}) {
    const accessToken = getAccessToken();

    const formData = new FormData();
    formData.set('description', description);
    formData.set('photo', photo);
    if (lat && !isNaN(lat)) formData.set('lat', lat);
    if (lon && !isNaN(lon)) formData.set('lon', lon);

    try {
        const fetchResponse = await fetchWithRetry(ENDPOINTS.ADD_STORY, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Origin': window.location.origin
            },
            body: formData,
        });
        
        const json = await fetchResponse.json();
        
        return {
            ...json,
            ok: fetchResponse.ok,
        };
    } catch (error) {
        console.error('Error adding story:', error);
        return {
            error: true,
            message: 'Failed to add story. Please try again later.',
            ok: false
        };
    }
}

export async function addGuestStory({
    description,
    photo,
    lat,
    lon,
}) {
    const formData = new FormData();
    formData.set('description', description);
    formData.set('photo', photo);
    if (lat && !isNaN(lat)) formData.set('lat', lat);
    if (lon && !isNaN(lon)) formData.set('lon', lon);

    try {
        const fetchResponse = await fetchWithRetry(ENDPOINTS.ADD_GUEST_STORY, {
            method: 'POST',
            headers: { 
                'Origin': window.location.origin
            },
            body: formData,
        });
        
        const json = await fetchResponse.json();
        
        return {
            ...json,
            ok: fetchResponse.ok,
        };
    } catch (error) {
        console.error('Error adding guest story:', error);
        return {
            error: true,
            message: 'Failed to add story. Please try again later.',
            ok: false
        };
    }
}

export async function subscribePushNotification(data) {
    if (!data || !data.endpoint || !data.keys || !data.keys.p256dh || !data.keys.auth) {
        console.error('Invalid subscription data', data);
        return {
            error: true,
            message: 'Invalid subscription data',
            ok: false,
            subscription: null
        };
    }

    const accessToken = getAccessToken();
    const payload = JSON.stringify({
        endpoint: data.endpoint,
        keys: { 
            p256dh: data.keys.p256dh, 
            auth: data.keys.auth 
        },
    });

    try {
        const fetchResponse = await fetchWithRetry(ENDPOINTS.SUBSCRIBE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Origin': window.location.origin
            },
            body: payload,
        });
        
        const json = await fetchResponse.json();
        
        return {
            ...json,
            ok: fetchResponse.ok,
        };
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return {
            error: true,
            message: 'Failed to subscribe to notifications. Please try again later.',
            ok: false,
            subscription: null
        };
    }
}

export async function unsubscribePushNotification({ endpoint }) {
    if (!endpoint) {
        console.error('Invalid endpoint data');
        return {
            error: true,
            message: 'Invalid endpoint data',
            ok: false
        };
    }

    const accessToken = getAccessToken();
    const data = JSON.stringify({
        endpoint,
    });

    try {
        const fetchResponse = await fetchWithRetry(ENDPOINTS.UNSUBSCRIBE, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Origin': window.location.origin
            },
            body: data,
        });
        
        const json = await fetchResponse.json();
        
        return {
            ...json,
            ok: fetchResponse.ok,
        };
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        return {
            error: true,
            message: 'Failed to unsubscribe from notifications. Please try again later.',
            ok: false
        };
    }
}