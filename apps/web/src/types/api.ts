export type BaseEntity = {
  id: string;
  createdAt: number;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type User = {
  id: string;
  username: string;
};

export type AuthResponse = {
  data: User;
};

export type GalleryImage = Entity<{
  caption: string;
  url: string;
  thumbnailUrl: string;
  isLiked: boolean;
  ratio: number;
  likes: number;
  comments: number;
  owner: {
    id: string;
    username: string;
  };
}>;

export type ImageComment = Entity<{
  author: {
    id: string;
    username: string;
  };
  content: string;
}>;
