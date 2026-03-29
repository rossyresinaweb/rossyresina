export type VideoItem = {
  id: string;
  title: string;
  desc: string;
  duration: string;
  views: string;
  date: string;
  level: string;
  tag: string;
  thumb: string;
};

export type ShortItem = {
  id: string;
  title: string;
  desc: string;
  duration: string;
  views: string;
  date: string;
  tag: string;
  thumb: string;
};

export const videos: VideoItem[] = [];
export const shorts: ShortItem[] = [];
