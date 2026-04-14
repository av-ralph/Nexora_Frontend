export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    isAdmin?: boolean;
    status?: string;
    profileUrl?: string;
    authId?: string;
}
export declare class AdminLoginDto {
    email: string;
    password: string;
}
export declare class ReviewActionDto {
    rating?: number;
    content?: string;
}
export declare class MediaContentDto {
    tmdbId: number;
    title: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    mediaType: 'movie' | 'tv';
    releaseYear?: number;
    rating?: number;
}
