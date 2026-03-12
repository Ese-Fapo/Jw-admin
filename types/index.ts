export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageURL: string;
  coverImagePublicId: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  coverImage?: File | null;
}

export interface ModalState {
  isOpen: boolean;
  isSearchOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  closeAll: () => void;
}
