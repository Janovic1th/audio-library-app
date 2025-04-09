const BASE_URL = 'https://edk9b6uukd.execute-api.eu-central-1.amazonaws.com/api';

const API_URLS = {
    booksSaveDetails: `${BASE_URL}/books/saveDetails`,
    getPresignedUrl: `${BASE_URL}/get_presignedurl/`,
    // getBooks: '/api/books',
    // getBookDetails: (bookId) => `/api/books/${bookId}`,
    // getAuth: '/api/auth',
    // Add other URLs as needed
};

export default API_URLS;