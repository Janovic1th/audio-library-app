export type ApiUrls = {
    booksSaveDetails: string;
    getPresignedUrl: string;
    getBook: (bookId: string) => string;
};

const BASE_URL = 'https://edk9b6uukd.execute-api.eu-central-1.amazonaws.com/api';

const API_URLS: ApiUrls = {
    booksSaveDetails: `${BASE_URL}/books/saveDetails`,
    getPresignedUrl: `${BASE_URL}/get_presignedurl/`,

    getBook: (bookId: string) => `${BASE_URL}/books/get/${bookId}`,
};

export default API_URLS;