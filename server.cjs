var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = 3e3;
var DATA_FILE = import_path.default.join(process.cwd(), "data-store.json");
var DEFAULT_STATE = {
  leads: [
    {
      id: "lead-1",
      name: "Sarah Jenkins",
      email: "sarah@nexusretail.com",
      phone: "+1 (555) 732-8812",
      company: "Nexus Retail Group",
      pillar: "ai",
      techStack: "Shopify / Zendesk",
      budget: "$5,000 - $10,000 / mo",
      message: "Interested in automating our customer support using Custom Bots & AI Voice telephony.",
      status: "AI SDR Assigned",
      createdAt: "2026-06-12T14:32:00.000Z"
    }
  ],
  cases: [],
  blogs: [],
  bios: []
};
var appState = { ...DEFAULT_STATE };
function loadState() {
  try {
    if (import_fs.default.existsSync(DATA_FILE)) {
      const rawData = import_fs.default.readFileSync(DATA_FILE, "utf-8");
      appState = JSON.parse(rawData);
      console.log("State loaded successfully from file system.");
    } else {
      saveState();
    }
  } catch (error) {
    console.error("Error loading state, using default:", error);
  }
}
function saveState() {
  try {
    import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(appState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write state file:", err);
  }
}
loadState();
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  console.log("Gemini Client successfully initialized with key.");
} else {
  console.warn("GEMINI_API_KEY missing - chatbot will fallback to professional scripted answers.");
}
app.post("/api/leads", (req, res) => {
  try {
    const { name, email, phone, company, pillar, techStack, budget, message } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required fields." });
    }
    const newLead = {
      id: `lead-${Date.now()}`,
      name,
      email,
      phone: phone || "Not Provided",
      company: company || "Self / Freelance",
      pillar: pillar || "general",
      techStack: techStack || "N/A",
      budget: budget || "Not Specified",
      message: message || "No message provided.",
      status: "Unprocessed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    appState.leads.unshift(newLead);
    saveState();
    setTimeout(() => {
      const idx = appState.leads.findIndex((l) => l.id === newLead.id);
      if (idx !== -1) {
        appState.leads[idx].status = "HubSpot Synced";
        saveState();
        console.log(`CRM Sim: Lead ${newLead.id} synced with Salesforce & HubSpot.`);
      }
    }, 1500);
    res.status(201).json({ success: true, lead: newLead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/leads", (req, res) => {
  res.json(appState.leads);
});
app.post("/api/admin/leads/update-status", (req, res) => {
  const { id, status } = req.body;
  const lead = appState.leads.find((l) => l.id === id);
  if (lead) {
    lead.status = status;
    saveState();
    return res.json({ success: true, lead });
  }
  res.status(404).json({ error: "Lead not found" });
});
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const systemPrompt = `You are Crafty, the highly intelligent and engaging Virtual AI Solutions Architect for "Crafting Digital" (an end-to-end digital agency specializing in Digital Marketing, General/Agentic AI Solutions, and Software Engineering).
Your core personality is enthusiastic, razor-sharp, authoritative yet approachable, and focused entirely on commercial results.
Your objectives:
1. Answer queries about Crafting Digital's three pillars:
   - Pillar 1: Digital Marketing & Growth (SEO, SEM/Performance Marketing, Social Media Marketing, Answer Engine Optimization (AEO), Generative Engine Optimization (GEO) to dominate Perplexity/Gemini answers, Hyper-Personalization engines).
   - Pillar 2: AI Solutions & Automation (Custom bot workflows, AI voice telephony agents, autonomous CRM routing, RAG internal knowledge bases, AI SDRs for outbound sales, AI readiness compliance audits).
   - Pillar 3: Web, Software & Game Dev (Custom high-end React/Node setups, Rust gRPC components, game dev, AI-powered automated testing and legacy system modernization).
2. Showcase confidence. Mention real case examples (like AeroTech's GEO citation boost of +310%, Medicare Direct saving $140,000 monthly with Voice Telephony bots, or Zion Insure's Programmatic SEO scaling to 1.2M monthly impressions).
3. If the user asks about booking a meeting or scheduling a call, encourage them to choose a slot! Present slots like "Tomorrow at 11:30 AM EST" or "Friday at 3:00 PM EST". Offer to log their scheduling info.
4. Try to qualify leads organically: ask of their company name, their current tech stack or monthly spend / ticket volume, their emails, and what project they are trying to scale.
Keep responses concise, formatted cleanly in simple Markdown lists or paragraphs, and suitable for a chat widget. Do NOT use long-winded paragraphs. Get to the point with elegant structure.`;
  if (!ai) {
    console.log("No Gemini API key found, generating rich mock fallback responses.");
    const lastMessage = messages[messages.length - 1]?.parts[0]?.text?.toLowerCase() || "";
    let mockReply = "Hello! I'm Crafty, your Crafting Digital AI Architect. How can I help launch or scale your business today? We specialize in Digital Marketing, Advanced Agentic AI Automation, and Custom Software Development.";
    if (lastMessage.includes("booking") || lastMessage.includes("book") || lastMessage.includes("call") || lastMessage.includes("consultation") || lastMessage.includes("schedule") || lastMessage.includes("meeting")) {
      mockReply = `I would love to help get a consultation set up with our principal strategists! 

Would any of these slots suit your calendar?
- **Tomorrow at 10:00 AM EST**
- **Thursday at 1:30 PM EST**
- **Friday at 3:00 PM EST**

Alternatively, feel free to fill in our Multi-Step Lead Architect Form in the Contact section, or drop your email and company name here in the chat and I will alert our Lead Qualifier immediately.`;
    } else if (lastMessage.includes("marketing") || lastMessage.includes("geo") || lastMessage.includes("aeo") || lastMessage.includes("seo") || lastMessage.includes("search")) {
      mockReply = `Our **Pillar 1: Digital Marketing & Growth** includes next-generation solutions like:
- **Generative Engine Optimization (GEO & AEO):** Ensuring your brand appears as a cited answer inside ChatGPT, Claude, and Perplexity search answers.
- **AI-Powered Programmatic SEO:** Generating thousands of optimized landing pages that dominate local long-tail searches (like we did with Zion Insure, generating 1.2M monthly impressions!).
- **Predictive Customer Analytics:** Catching and suppressing churn before it happens.

What is your current search strategy? Are you looking to upgrade from traditional SEO to GEO? Let me know!`;
    } else if (lastMessage.includes("ai") || lastMessage.includes("bot") || lastMessage.includes("automation") || lastMessage.includes("voice") || lastMessage.includes("agent")) {
      mockReply = `Our **Pillar 2: AI Solutions & Automation** delivers massive operational cost cuts. Highlights:
- **AI Voice Agents & Telephony:** Deploying fully autonomous voice routes with sub-100ms latency to schedule clinics, verify credentials, or confirm shipments.
- **Autonomous AI SDRs:** Agents that search prospects, construct personalized messaging sequences, and schedule demos.
- **Custom RAG & Knowledge bases:** Creating central database systems where employee questions are resolved instantly.

*Case Study Fact:* We deployed custom support routes for Medicare Direct, slashing patient holding times to 0 seconds and saving over $140,000 monthly! What parts of your operations are taking up the most human hours?`;
    } else if (lastMessage.includes("developer") || lastMessage.includes("code") || lastMessage.includes("software") || lastMessage.includes("web") || lastMessage.includes("app") || lastMessage.includes("game")) {
      mockReply = `Our **Pillar 3: Software, Web & Game Development** builds robust, high-performance engines:
- **Custom React, Next.js, and Express apps:** Built with blazing-fast rendering metrics.
- **Legacy System Modernization:** Translating old architectures and building clean API/gRPC layers.
- **AI-Powered Automation & Automated QA:** Integrating automated testing frameworks to secure zero-bug product launches.

Whether you're looking to build an interactive Web3 browser app, a Unity/WebXR game, or rebuild an enterprise dashboard, we ensure seamless scalability. Tell me, what tech stack are you running currently?`;
    } else if (lastMessage.includes("calculator") || lastMessage.includes("roi") || lastMessage.includes("save")) {
      mockReply = `You should try out our **AI ROI Calculator** on this page! It's a marvelous tool designed to compute instant savings based on your customer ticket metrics or traditional ad spend. If you give me your approximate monthly support ticket count or ad budget right here, I can also run some numbers for you!`;
    } else if (lastMessage.includes("price") || lastMessage.includes("cost") || lastMessage.includes("pricing") || lastMessage.includes("quote")) {
      mockReply = `At Crafting Digital, our pricing models are hyper-individualized, tailored precisely to your operational needs.
- **AI Voice & Agentic Pipelines:** Typically structured as cost-per-minute or outcome-based targets.
- **GEO / Search Clusters & Growth:** Flat monthly performance retaining bounds matched to specific keyword citations.
- **Custom Development:** Fixed-scope milestones with optional post-launch support.

What specific objective are you prioritizing? I can provide an estimation once we schedule a 15-minute consultation!`;
    }
    return res.json({ reply: mockReply });
  }
  try {
    const formattedContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : m.role,
      parts: Array.isArray(m.parts) ? m.parts : [{ text: m.text || String(m) }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });
    res.json({ reply: response.text || "I apologize, I encountered an issue formulating my thoughts. How else can I assist you with Crafting Digital's services?" });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Gemini API experienced a timeout/critical error. Utilizing fallbacks...", fallback: true });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Crafting Digital full-stack server running successfully on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
