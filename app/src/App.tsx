import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [backendPing, setBackendPing] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  async function pingBackend() {
    try {
      const res = await fetch("http://localhost:8080/api/ping");
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setBackendPing(data.message + " (" + data.status + ")");
    } catch (e: any) {
      setBackendPing("Error: " + e.message);
    }
  }

  useEffect(() => {
    pingBackend();
  }, []);

  return (
    <main className="container">
      <h1>NihongoAI - Phase 1</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Spring Boot Backend Ping: {backendPing}</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name for Tauri..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
