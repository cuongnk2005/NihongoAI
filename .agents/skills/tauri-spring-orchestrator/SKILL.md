---
name: tauri-spring-orchestrator
description: >-
  Guides the orchestration between Tauri 2 desktop shell and the local Spring Boot backend.
  Use when configuring sidecar processes, dynamic local ports, health checks, startup
  handshakes, and graceful shutdowns.
---

# Tauri 2 & Spring Boot Desktop Orchestration Skill

## 1. Architectural Model

```
+-----------------------------------------------------------+
| NihongoAI Desktop (Tauri 2 App)                           |
|                                                           |
|  +---------------------+        +-----------------------+ |
|  | Webview (React)     |        | Rust Main Process     | |
|  |                     |        |                       | |
|  | UI, Navigation,     |        | - Sidecar lifecycle   | |
|  | Flashcards, Practice|        | - Port assignment     | |
|  | (Strictly no Rust   |        | - Native file dialogs | |
|  |  business logic)    |        | - Graceful termination| |
|  +----------+----------+        +-----------+-----------+ |
|             |                               |             |
|             | HTTP (localhost)              | Spawns/Kills|
|             v                               v             |
|  +------------------------------------------------------+ |
|  | Local Spring Boot Backend (Java 17/21 JAR)           | |
|  | - Port: 8080 (or dynamically configured)             | |
|  | - Bound strictly to 127.0.0.1 (Loopback)             | |
|  | - SQLite embedded DB + Flyway migrations             | |
|  | - Core business logic, SRS, AI providers             | |
|  +------------------------------------------------------+ |
+-----------------------------------------------------------+
```

---

## 2. Startup Handshake & Healthcheck

Do not present an uninitialized white screen to the user while Spring Boot boots up.

### Recommended Sequence:
1. **Tauri starts:** Shows a lightweight splash screen or loading indicator.
2. **Launch Child Process:** Rust spawns the Spring Boot JAR with argument `--server.port=<PORT>` (default 8080).
3. **Poll Health Endpoint:**
   - Poll `http://127.0.0.1:<PORT>/api/ping` every 200ms (timeout: 20 seconds).
   - Expected response: `{"status":"UP"}` or HTTP 200.
4. **Transition to App:**
   - Once healthy, inject the configured backend URL into the frontend context and render the main dashboard.

---

## 3. Security & Loopback Isolation

- **Bind to 127.0.0.1 only:** In `application.properties`:
  ```properties
  server.address=127.0.0.1
  ```
  *Never bind to `0.0.0.0` to prevent exposure to the local area network.*
- **CORS Configuration:**
  In `WebConfig.java`, allow origins from Tauri's webview:
  - `http://localhost:5173` (Vite dev)
  - `tauri://localhost` (Production desktop webview)

---

## 4. Graceful Shutdown & Zombie Process Prevention

On Windows, child Java processes may continue running in the background if the parent Tauri application is closed without an explicit kill signal.

### Tauri Rust Shutdown Hook:
```rust
// Handle window close or application exit
app.on_window_event(|window, event| {
    if let tauri::WindowEvent::CloseRequested { .. } = event {
        // 1. Send shutdown request or SIGTERM to Spring Boot child process
        // 2. Wait up to 2 seconds for clean SQLite lock release
        // 3. Force kill if not exited
    }
});
```

---

## 5. Native Desktop Capabilities via Tauri

Use Tauri plugins specifically for desktop ergonomics:
- **File Dialogs:** `@tauri-apps/plugin-dialog` to pick `.csv`, `.tsv`, or `.apkg` files with native Windows Explorer dialogs.
- **File System:** Secure reading of user-selected import files.
- **Window State:** Persisting window width, height, and position across restarts.

---

## 6. Verification Checklist

- [ ] Is Spring Boot bound strictly to `127.0.0.1`?
- [ ] Does closing the Tauri window terminate `javaw.exe` / `java.exe` in Task Manager?
- [ ] Is frontend API communication configured dynamically rather than hardcoding `http://localhost:8080` in individual UI components?
- [ ] Does the UI handle backend startup delays gracefully with a connection retry state?
