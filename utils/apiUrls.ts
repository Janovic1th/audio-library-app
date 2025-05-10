export type ApiUrls = {
    booksSaveDetails: string;
    getPresignedUrl: string;
    isAudioAvailable: string;
    booksDelete: string;
    getBook: (bookId: string) => string;
    searchBooks: string;
};

const BASE_URL = 'https://edk9b6uukd.execute-api.eu-central-1.amazonaws.com/api';

export const API_URLS: ApiUrls = {
    booksSaveDetails: `${BASE_URL}/books/saveDetails`,
    getPresignedUrl: `${BASE_URL}/get_presignedurl/`,
    isAudioAvailable: `${BASE_URL}/books/isAudioAvailible/`,
    booksDelete: `${BASE_URL}/books/delete/`,
    getBook: (bookId: string) => `${BASE_URL}/books/get/${bookId}`,
    searchBooks: `${BASE_URL}/search/`,
};

export const LinksToServices: { [key: string]: string } = {
    CloudFrontBook: "https://d2dbq6nhal1ena.cloudfront.net/",
    CloudFrontCover: "https://d2nu6dilyvv7he.cloudfront.net/"
};