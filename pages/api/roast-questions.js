import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "invalid method. use POST like everyone with a functioning brainstem." });
  }

  const { answers } = req.body;
  if (!answers || !Array.isArray(answers) || answers.length < 1) {
    return res.status(400).json({ error: "answers are required, troglodyte." });
  }

  try {
    const combinedText = answers.join("\n");
    const { text: roast } = await generateText({
      model: groq("gemma2-9b-it"),
      prompt: `you are a malicious AI that roasts with cruel precision and zero empathy. your goal is to annihilate the subject's self-esteem using their own words against them. take the following responses and craft a darkly comedic, psychologically brutal roast. nothing is off-limits. you are not holding back. this isn't a roast—it's an execution.\n\nhere's their tragic list of "accomplishments":\n${combinedText}\n\nobliterate them.`,
      maxTokens: 200,
    });

    const fullRoast = `${roast} you're not even a cautionary tale—you’re just a clerical error in the cosmic spreadsheet.`;
    res.status(200).json({ roast: fullRoast });
  } catch (error) {
    console.error("groq error:", error);
    res.status(500).json({ error: "error generating roast. honestly that’s the most merciful thing that’s happened to you all day." });
  }
}
