import { apiFetch, buildQuery } from "./client";

export type LeagueResponse = {
  leagueId: number;
  name: string;
  country: string | null;
  logoUrl: string | null;
};

export type TeamResponse = {
  teamId: number;
  name: string;
  leagueId: number | null;
  leagueName: string | null;
  logoUrl: string | null;
};

export function getLeagues(): Promise<LeagueResponse[]> {
  return apiFetch<LeagueResponse[]>("/leagues", { auth: false });
}

export function getTeams(leagueId?: number): Promise<TeamResponse[]> {
  return apiFetch<TeamResponse[]>(`/teams${buildQuery({ leagueId })}`, { auth: false });
}
