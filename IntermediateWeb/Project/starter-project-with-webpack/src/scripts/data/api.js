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

export async function getRegistered({ name, email, password }) {
    const data = JSON.stringify({ name, email, password });

    const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    const fetchResponse = await fetch (ENDPOINTS.GET_STORIES, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await fetchResponse.json();

    return {
        ...json,
        ok: fetchResponse.ok,
    };
}

export async function getDetailStory(id) {
    const accessToken = getAccessToken();

    const fetchResponse = await fetch(ENDPOINTS.GET_DETAIL_STORY(id), {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await fetchResponse.json();

    return {
        ...json,
        ok: fetchResponse.ok,
    };
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
    formData.set('lat', lat);
    formData.set('lon', lon);

    const fetchResponse = await fetch(ENDPOINTS.ADD_STORY, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
    });
    const json = await fetchResponse.json();

    return {
        ...json,
        ok: fetchResponse.ok,
    };
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
    formData.set('lat', lat);
    formData.set('lon', lon);

    const fetchResponse = await fetch(ENDPOINTS.ADD_GUEST_STORY, {
        method: 'POST',
        body: formData,
    });
    const json = await fetchResponse.json();

    return {
        ...json,
        ok: fetchResponse.ok,
    };
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
    const accessToken = getAccessToken();
    const data = JSON.stringify({
        endpoint,
        keys: { p256dh, auth },
    });

    const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
    });
    const json = await fetchResponse.json();

    return {
        ...json,
        ok: fetchResponse.ok,
    };
}

export async function unsubscribePushNotification({ endpoint }) {
    const accessToken = getAccessToken();
    const data = JSON.stringify({
        endpoint,
    });

    const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
    });
    const json = await fetchResponse.json();

    return {
        ...json,
        ok: fetchResponse.ok,
    };
}