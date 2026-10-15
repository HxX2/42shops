export async function getRepoStars(): Promise<number> {
  try {
    const res = await fetch("https://api.github.com/repos/HxX2/42shops", {
      headers: { "User-Agent": "42shops-web" },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.stargazers_count === "number") {
        return data.stargazers_count;
      }
    }
  } catch {
    // Fallback if network or rate limit
  }
  return 0;
}
