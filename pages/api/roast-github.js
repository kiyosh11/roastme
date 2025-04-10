import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "wrong verb. use POST or go back to tutorial hell." });
  }

  const { username } = req.body;
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "provide a GitHub username. or keep coping." });
  }

  try {
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!userResponse.ok) {
      return res.status(404).json({ error: `no such user: ${username}. did you typo your own name?` });
    }
    const userData = await userResponse.json();

    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!reposResponse.ok) {
      return res.status(500).json({ error: "couldn't fetch repos. your shame is safe. for now." });
    }
    const reposData = await reposResponse.json();

    const githubData = `
username: ${username}
public repos: ${userData.public_repos}
followers: ${userData.followers}
following: ${userData.following}
bio: "${userData.bio || 'no bio—no personality either'}"
repos: ${reposData.map(r => r.name).join(", ") || "none. you produce nothing."}
stars: ${reposData.reduce((a, r) => a + r.stargazers_count, 0)}
    `;

    const { text: roast } = await generateText({
      model: groq("gemma2-9b-it"),
      prompt: `you're a hostile AI, fueled by pure disdain for hopeless coders. this GitHub profile is a cry for help. make them wish they’d never touched a keyboard. roast every embarrassing detail, from their empty repos to their non-existent followers. do it so hard they'll want to burn their laptop. take no prisoners.\n\n${githubData}\n\ndo it.`,
      maxTokens: 200,
    });

    const fullRoast = `${roast} your GitHub is a museum of mediocrity. close it before someone trips over the cobwebs.`;
    res.status(200).json({ roast: fullRoast });
  } catch (err) {
    console.error("GitHub API fail:", err);
    res.status(500).json({ error: "couldn’t even roast. you broke the linter of the universe." });
  }
}
