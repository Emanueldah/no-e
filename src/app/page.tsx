"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const DOTA_ACCOUNT_ID = "200878842";

// Full kod tagen från användarens canvas
export default function Dota2StatsApp() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroes, setHeroes] = useState({});
  const [wardStats, setWardStats] = useState({ observer: 0, sentry: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchRes, heroRes, wardRes] = await Promise.all([
          fetch(`https://api.opendota.com/api/players/${DOTA_ACCOUNT_ID}/recentMatches`),
          fetch("https://api.opendota.com/api/heroStats"),
          fetch(`https://api.opendota.com/api/players/${DOTA_ACCOUNT_ID}/counts`),
        ]);

        const matchData = await matchRes.json();
        const heroData = await heroRes.json();
        const wardData = await wardRes.json();

        const heroMap = {};
        heroData.forEach((h) => {
          heroMap[h.id] = h.localized_name;
        });

        setMatches(matchData);
        setHeroes(heroMap);
        setWardStats({
          observer: wardData.ward_observer || 0,
          sentry: wardData.ward_sentry || 0,
        });
        setLoading(false);
      } catch (err) {
        setError("Kunde inte hämta data.");
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const winrate = (
    matches.filter((m) => m.radiant_win === (m.player_slot < 128)).length / matches.length
  ) * 100;

  const gpmData = matches.map((m, index) => ({ match: index + 1, gpm: m.gold_per_min }));
  const xpmData = matches.map((m, index) => ({ match: index + 1, xpm: m.xp_per_min }));
  const lhData = matches.map((m, index) => ({ match: index + 1, lh: m.last_hits }));

  const heroStats = {};
  matches.forEach((m) => {
    const name = heroes[m.hero_id] || "Unknown";
    if (!heroStats[name]) {
      heroStats[name] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 };
    }
    heroStats[name].games += 1;
    heroStats[name].wins += m.radiant_win === (m.player_slot < 128) ? 1 : 0;
    heroStats[name].kills += m.kills;
    heroStats[name].deaths += m.deaths;
    heroStats[name].assists += m.assists;
  });

  const heroStatsArray = Object.entries(heroStats).map(([name, stats]) => ({
    hero: name,
    winrate: (stats.wins / stats.games) * 100,
    kda: ((stats.kills + stats.assists) / Math.max(stats.deaths, 1)).toFixed(2),
    games: stats.games
  })).sort((a, b) => b.games - a.games);

  return (
    <div className="p-4 grid gap-4">
      <h1 className="text-2xl font-bold">Dota 2 Matchanalys</h1>
      {loading && <p>Laddar data...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          <Card><CardContent className="p-4">
            <p><strong>Totalt antal matcher:</strong> {matches.length}</p>
            <p><strong>Winrate:</strong> {winrate.toFixed(1)}%</p>
            <p><strong>Observer Wards:</strong> {wardStats.observer}</p>
            <p><strong>Sentry Wards:</strong> {wardStats.sentry}</p>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">XP/min och Last Hits</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={xpmData}>
                <XAxis dataKey="match" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="xpm" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lhData}>
                <XAxis dataKey="match" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="lh" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </>
      )}
    </div>
  );
}