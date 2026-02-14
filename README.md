# Dr.Suji Chat - Medical AI Assistant

An advanced, multi-model medical AI assistant that runs in the browser. It features voice interaction, long-term memory, and a privacy-first **Offline Mode** that runs entirely on your device using WebGPU.

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** (Version 18+ recommended)
- A modern browser with **WebGPU support** (Chrome 113+, Edge, Brave).

### Installation
1. Open your terminal in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open the link displayed in your terminal (usually `http://localhost:5173`).

---

## 🧠 How to Use Offline Mode (No Backend)

Dr.Suji can run without Google Gemini or OpenAI APIs by downloading the brain directly to your computer.

1. Open the app in your browser.
2. Click **Settings** (Sidebar bottom).
3. Under **AI Intelligence**, select **"Dr.Suji Offline (Browser Model)"**.
4. Close Settings.
5. Send a message (e.g., "How do I treat a migraine?").

**Note:** The first time you use Offline Mode, it will download approx. **1.5GB** of data. This happens once. Subsequent uses are instant and require no internet.

---

## 🔑 Environment Variables (Optional)

If you wish to use the Cloud/Online modes, create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_google_api_key_here
VITE_OPENAI_API_KEY=your_openai_key_here
```

*For Offline Mode, these keys are NOT required.*

## 🛠 Technologies
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Offline AI:** WebLLM (MLC-AI), WebGPU
- **Cloud AI:** Google Gemini API, OpenAI API
- **Storage:** LocalStorage (Default) or Firebase (Optional)
