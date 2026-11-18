export type Session = {
  id: string;
  title: string;
  short: string;
  track: string;
  track2: string;
  format: string;
  level: string;
  audience: string[];
  tags: string[];
  tools: string[];
  slots: number[];
  room: string;
  presenters: string;
  leadName: string;
  leadTitle: string;
  leadOrg: string;
  coNames: string[];
  coDetails: string[];
  status: string;
  description: string;
  isTBA: boolean;
};

export type Block = {
  id: string;
  day: number;
  label: string;
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  location: string;
  type: string; // registration | plenary | keynote | breakout | lunch | break | event | closing
  order: number;
  description: string;
};

export type Keynote = {
  key: string;
  role: string;
  name: string;
  title: string;
  org: string;
  talk: string;
  day: number;
  time: string;
  location: string;
  bio: string;
  photo: string;
  status: string;
};

export type Track = {
  id: string;
  name: string;
  color: string;
  icon: string;
  tagline: string;
  description: string;
  order: number;
};

export type SpecialEvent = {
  id: string;
  name: string;
  day: number;
  time: string;
  location: string;
  description: string;
  order: number;
};

export type Exhibit = {
  id: string;
  name: string;
  description: string;
  location: string;
  order: number;
  status: string;
};

export type Room = {
  room: string;
  floor: string;
  kind: string;
  notes: string;
};

export type ConferenceData = {
  info: Record<string, string>;
  blocks: Block[];
  keynotes: Keynote[];
  sessions: Session[];
  tracks: Track[];
  events: SpecialEvent[];
  exhibits: Exhibit[];
  rooms: Room[];
  source: 'live' | 'snapshot';
  fetchedAt: Date;
};
