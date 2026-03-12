export interface FetchPostsParams {
    pageParam?: string | null;
    limit?: number;
}

export interface PostAuthor {
    name: string | null;
    image: string | null;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt:  string | null;
    coverImageURL: string | null;
    createdAt: string;
    author: PostAuthor;
}
export interface FetchPostResponse {
    posts: Post[];
    nextCursor: string | null;
}