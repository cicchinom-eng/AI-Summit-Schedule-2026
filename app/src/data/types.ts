export type Session = {
  id: string;
  title: string;
  short: string;
  pathway: string;
  pathway2: string;
  format: string;
  level: string;
  grade: string;
  audience: string[];
  strands: string[];
  tools: string[];
  device: string; // "Yes" | "Helpful" | ""
  runs: number;
  slots: number[];
  room: string;
  presenters: string; // display string
  leadName: string;
  leadTitle: string;
  leadOrg: string;
  coNames: string[];
  coDetails: string[];
  status: string;
  needs: string;
  description: string;
  isTBA: boolean;
};

export type Block = {
  id: string;
  label: string;
  start: string; // "8:00 AM"
  end: string;
  startMin: number; // minutes since midnight
  endMin: number;
  location: string;
  type: string; // arrival | plenary | keynote | concurrent | lunch | meetups | playground
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
  time: string;
  location: string;
  bio: string;
  photo: string;
  status: string;
};

export type Pathway = {
  id: string;
  name: string;
  color: string;
  icon: string;
  tagline: string;
  description: string;
  order: number;
};

export type Meetup = { id: string; name: string; kind: string; room: string; description: string; host: string; order: number; status: string };
export type LunchOption = { id: string; name: string; description: string; link: string; order: number };
export type Exhibit = { id: string; name: string; description: string; location: string; order: number; status: string };
export type Room = { room: string; wing: string; kind: string; notes: string };

export type SummitData = {
  info: Record<string, string>;
  blocks: Block[];
  keynotes: Keynote[];
  sessions: Session[];
  pathways: Pathway[];
  meetups: Meetup[];
  lunch: LunchOption[];
  playground: Exhibit[];
  rooms: Room[];
  source: 'live' | 'snapshot';
  fetchedAt: Date;
};
