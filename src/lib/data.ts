export type Team = {
  name: string;
  league: string;
  logo: string;
};

export const TEAMS = {
  barcelona: { name: "FC 바르셀로나", league: "라리가 리그", logo: "/images/logo-barcelona.png" },
  atletico: { name: "아틀레티코 마드리드", league: "라리가 리그", logo: "/images/logo-atletico.png" },
  realmadrid: { name: "레알 마드리드", league: "라리가 리그", logo: "/images/logo-realmadrid.png" },
  valencia: { name: "발렌시아 CF", league: "라리가 리그", logo: "/images/logo-valencia.png" },
  arsenal: { name: "아스날 FC", league: "프리미어 리그", logo: "/images/logo-arsenal.png" },
  manutd: { name: "맨체스터 유나이티드 FC", league: "프리미어 리그", logo: "/images/logo-manutd.png" },
  acmilan: { name: "AC 밀란", league: "세리에A 리그", logo: "/images/logo-acmilan.png" },
  juventus: { name: "유벤투스 FC", league: "세리에A 리그", logo: "/images/logo-juventus.png" },
} satisfies Record<string, Team>;

export type Match = {
  id: string;
  date: string;
  league: string;
  home: Team;
  away: Team;
  stadium: string;
  time: string;
  open: boolean;
};

export const CLUB_MATCHES: Match[] = [
  {
    id: "club-1",
    date: "2026년 6월 5일 (금)",
    league: "라리가",
    home: TEAMS.barcelona,
    away: TEAMS.atletico,
    stadium: "Camp Nou, Stadium",
    time: "16:00",
    open: false,
  },
  {
    id: "club-2",
    date: "2026년 6월 8일 (월)",
    league: "라리가",
    home: TEAMS.realmadrid,
    away: TEAMS.barcelona,
    stadium: "Bernabeu, Stadium",
    time: "16:00",
    open: true,
  },
  {
    id: "club-3",
    date: "2026년 6월 10일 (수)",
    league: "라리가",
    home: TEAMS.barcelona,
    away: TEAMS.valencia,
    stadium: "Camp Nou, Stadium",
    time: "16:00",
    open: true,
  },
];

export const TOURNAMENT_MATCHES: Match[] = [
  {
    id: "tour-1",
    date: "2026년 7월 10일 (금) - 36강",
    league: "UEFA 챔피언스",
    home: TEAMS.barcelona,
    away: TEAMS.arsenal,
    stadium: "Camp Nou, Stadium",
    time: "13:30",
    open: true,
  },
  {
    id: "tour-2",
    date: "2026년 7월 17일 (금)",
    league: "UEFA 챔피언스",
    home: TEAMS.juventus,
    away: TEAMS.barcelona,
    stadium: "Allianz, Stadium",
    time: "14:00",
    open: true,
  },
  {
    id: "tour-3",
    date: "2026년 6월 10일 (수)",
    league: "UEFA 챔피언스",
    home: TEAMS.barcelona,
    away: TEAMS.manutd,
    stadium: "Camp Nou, Stadium",
    time: "16:00",
    open: true,
  },
];
