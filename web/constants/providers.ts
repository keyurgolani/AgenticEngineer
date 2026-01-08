export interface ApiProvider {
    id: string
    name: string
    placeholder: string
    envVars: string[]
}

export const API_PROVIDERS: ApiProvider[] = [
    { 
        id: "openai", 
        name: "OpenAI", 
        placeholder: "sk-...",
        envVars: ["OPENAI_API_KEY"] 
    },
    { 
        id: "anthropic", 
        name: "Anthropic", 
        placeholder: "sk-ant-...",
        envVars: ["ANTHROPIC_API_KEY"] 
    },
    { 
        id: "google", 
        name: "Google Gemini", 
        placeholder: "AIza...",
        envVars: ["GOOGLE_API_KEY", "GEMINI_API_KEY"] 
    },
    { 
        id: "groq", 
        name: "Groq", 
        placeholder: "gsk_...",
        envVars: ["GROQ_API_KEY"] 
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        placeholder: "sk-...",
        envVars: ["DEEPSEEK_API_KEY"]
    }
]
