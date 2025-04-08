const BASE_URL = 'https://notes-api.dicoding.dev/v2';
 
class NotesApi {
    static async getAllNotes() {
        try {
            const response = await fetch(`${BASE_URL}/notes`);
            const responseJson = await response.json();

            if (responseJson.error) {
                return {
                    error: true,
                    message: responseJson.message
                };
            }

            const notes = responseJson.data.map(note => ({
                ...note,
                archived: false
            }));

            return {
                error: false,
                data: responseJson.data
            };
        }
        catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    static async getArchivedNotes() {
        try {
            const response = await fetch (`${BASE_URL}/notes/archived`);
            const responseJson = await response.json();

            if (responseJson.error) {
                return {
                    error: true,
                    message: responseJson.message
                };
            }

            const notes = responseJson.data.map(note => ({
                ...note,
                archived: true
            }));

            return {
                error: false,
                data: responseJson.data
            };
        }
        catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    static async getSingleNote(id) {
        try {
            const response = await fetch(`${BASE_URL}/notes/${id}`);
            const responseJson = await response.json();

            if (responseJson.error) {
                return {
                    error: true,
                    message: responseJson.message
                };
            }
            return {
                error: false,
                data: responseJson.data
            };
        }
        catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    static async addNote(note) {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(note),
            };

            const response = await fetch(`${BASE_URL}/notes`, options);
            const responseJson = await response.json();

            if (responseJson.error) {
                return {
                    error: true,
                    message: responseJson.message
                };
            }
            return {
                error: false,
                message: responseJson.message,
                data: responseJson.data
            };
        }
        catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    static async archiveNote(id) {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await fetch(`${BASE_URL}/notes/${id}/archive`, options);
            const responseJson = await response.json();

            if (responseJson.error) {
                return {
                    error: true,
                    message: responseJson.message
                };
            }
            return {
                error: false,
                message: responseJson.message
            };
        }
        catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    static async unarchiveNote(id) {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await fetch(`${BASE_URL}/notes/${id}/unarchive`, options);
            const responseJson = await response.json();

            if (responseJson.error) {
                return {
                    error: true,
                    message: responseJson.message
                };
            }
            return {
                error: false,
                message: responseJson.message
            };
        }
        catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    static async deleteNote(id) {
        try {
            const options = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await fetch(`${BASE_URL}/notes/${id}`, options);
            const responseJson = await response.json();

            if (responseJson.error) {
                return {
                    error: true,
                    message: responseJson.message
                };
            }
            return {
                error: false,
                message: responseJson.message
            };
        }
        catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }
}
 
export default NotesApi;