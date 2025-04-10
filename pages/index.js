import { useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [mode, setMode] = useState("xposts");
  const [username, setUsername] = useState("");
  const [questions, setQuestions] = useState(["", "", ""]);
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);

  const roastMe = async () => {
    setLoading(true);
    setRoast("");
    try {
      let endpoint = "/api/roast-xposts";
      let body = {};
      if (mode === "xposts" || mode === "github") {
        body = { username };
        endpoint = mode === "xposts" ? "/api/roast-xposts" : "/api/roast-github";
      } else if (mode === "questions") {
        endpoint = "/api/roast-questions";
        body = { answers: questions };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setRoast(data.roast || data.error);
    } catch (error) {
      setRoast("System overload—your existence is too pathetic to compute.");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Roast Me Bad</h1>
        <p className={styles.subtitle}>Neural net roasting—initiated.</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "xposts" ? styles.active : ""}`}
            onClick={() => setMode("xposts")}
          >
            X Posts
          </button>
          <button
            className={`${styles.tab} ${mode === "github" ? styles.active : ""}`}
            onClick={() => setMode("github")}
          >
            GitHub
          </button>
          <button
            className={`${styles.tab} ${mode === "questions" ? styles.active : ""}`}
            onClick={() => setMode("questions")}
          >
            Questions
          </button>
        </div>

        {(mode === "xposts" || mode === "github") && (
          <input
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={mode === "xposts" ? "X USERNAME" : "GITHUB USERNAME"}
          />
        )}

        {mode === "questions" && (
  <div className={styles.questions}>
    <label className={styles.label}>Your proudest quirky achievement:</label>
    <input
      className={styles.input}
      value={questions[0]}
      onChange={(e) => {
        const newQuestions = [...questions];
        newQuestions[0] = e.target.value;
        setQuestions(newQuestions);
      }}
      placeholder="Brag a little"
    />
    <label className={styles.label}>Your weirdest hidden talent:</label>
    <input
      className={styles.input}
      value={questions[1]}
      onChange={(e) => {
        const newQuestions = [...questions];
        newQuestions[1] = e.target.value;
        setQuestions(newQuestions);
      }}
      placeholder="Surprise us"
    />
    <label className={styles.label}>Funniest thing you’re obsessed with:</label>
    <input
      className={styles.input}
      value={questions[2]}
      onChange={(e) => {
        const newQuestions = [...questions];
        newQuestions[2] = e.target.value;
        setQuestions(newQuestions);
      }}
      placeholder="Spill the beans"
    />
  </div>
)}
        <button
          className={`${styles.button} ${loading ? styles.loading : ""}`}
          onClick={roastMe}
          disabled={loading || ((mode === "xposts" || mode === "github") && !username) || (mode === "questions" && questions.every((q) => !q))}
        >
          {loading ? "PROCESSING..." : "ACTIVATE ROAST PROTOCOL"}
        </button>

        {roast && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>ROAST OUTPUT</h2>
            <p className={styles.cardText}>{roast}</p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          Created by{" "}
          <a href="https://x.com/_kiyosh1" target="_blank" rel="noopener noreferrer">
            @_kiyosh1
          </a>
        </p>
      </footer>
    </div>
  );
                          }
