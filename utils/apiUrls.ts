export type ApiUrls = {
    booksSaveDetails: string;
    getPresignedUrl: string;
    isAudioAvailable: string;
    getBook: (bookId: string) => string;
};

const BASE_URL = 'https://edk9b6uukd.execute-api.eu-central-1.amazonaws.com/api';

const API_URLS: ApiUrls = {
    booksSaveDetails: `${BASE_URL}/books/saveDetails`,
    getPresignedUrl: `${BASE_URL}/get_presignedurl/`,
    isAudioAvailable: `${BASE_URL}/books/isAudioAvailible/`,
    getBook: (bookId: string) => `${BASE_URL}/books/get/${bookId}`,
};

export default API_URLS;