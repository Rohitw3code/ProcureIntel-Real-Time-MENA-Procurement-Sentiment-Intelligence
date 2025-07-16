# ProcureIntel - Real-Time MENA Procurement Sentiment Intelligence

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-AI-FF6B35?style=for-the-badge&logo=chainlink&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama-FF6B35?style=for-the-badge&logo=meta&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-App_Services-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![Vector](https://img.shields.io/badge/pgvector-Embeddings-336791?style=for-the-badge&logo=postgresql&logoColor=white)


**🚀 Live URL:** [https://procumentintel.web.app/](https://procumentintel.web.app/)

**👨‍💻 Built by:** Rohit Kumar

**📂 Repository:** [GitHub](https://github.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence)

---

*AI-powered procurement intelligence platform for the Middle East and North Africa region*

</div>

## 🎯 Overview

ProcureIntel is an AI-powered procurement intelligence platform designed for the Middle East and North Africa (MENA) region. It transforms how organizations discover tender opportunities, analyze market sentiment, and extract actionable insights from thousands of news sources across the region.

## 💼 Use Cases

<table>
<tr>
<td align="center">🏢<br><b>Enterprise Procurement</b><br>Automated tender discovery</td>
<td align="center">📊<br><b>Market Research</b><br>Real-time sentiment analysis</td>
<td align="center">🤝<br><b>Business Development</b><br>AI-powered company intelligence</td>
<td align="center">🏛️<br><b>Government Agencies</b><br>Market transparency monitoring</td>
</tr>
</table>

## 🛠️ Tech Stack

**Frontend**
- React
- TypeScript
- Tailwind CSS
- Vite

**Backend**
- Python
- LangChain
- OpenAI
- Groq
  
**Database & Infrastructure**
- Supabase
- Azure
- Firebase
- Vector
  
## 🔄 System Architecture

```mermaid
graph TB
    subgraph "🌐 Data Sources"
        A[📰 MENA News Sources]
        B[🏛️ Government Portals]
        C[📊 Industry Publications]
    end
    
    subgraph "⚡ Data Processing Pipeline"
        D[🕷️ Web Scrapers]
        E[🧹 Content Cleaning]
        F[🤖 AI Analysis Engine]
        G[🔢 Vector Embeddings]
    end
    
    subgraph "🧠 AI & ML Layer"
        H[🤖 OpenAI GPT-4]
        I[🦙 Groq Llama Models]
        J[🔗 LangChain Framework]
        K[😊 Sentiment Analysis]
        L[🏷️ Entity Extraction]
    end
    
    subgraph "🗄️ Database Layer"
        M[🐘 Supabase PostgreSQL]
        N[🔍 pgvector Extension]
        O[🎯 Vector Similarity Search]
    end
    
    subgraph "🌐 API Layer"
        P[⚡ Flask REST API]
        Q[🔐 Authentication]
        R[⏱️ Rate Limiting]
    end
    
    subgraph "💻 Frontend Layer"
        S[⚛️ React + TypeScript]
        T[📊 Real-time Dashboard]
        U[💬 AI Chat Interface]
        V[🏢 Company Analysis]
    end
    
    subgraph "☁️ Deployment"
        W[☁️ Azure App Services]
        X[🔥 Firebase Hosting]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    H --> J
    I --> J
    J --> K
    J --> L
    G --> M
    K --> M
    L --> M
    M --> N
    N --> O
    M --> P
    P --> Q
    P --> R
    P --> S
    S --> T
    S --> U
    S --> V
    P --> W
    S --> X
```

## 🔄 Workflow Process

```mermaid
sequenceDiagram
    participant 👨‍💻 Dev as Developer Portal
    participant 🕷️ Scraper as Web Scrapers
    participant 🤖 AI as AI Engine
    participant 🗄️ DB as Supabase DB
    participant ⚡ API as Flask API
    participant 💻 UI as React Frontend
    participant 👤 User as End User
    
    👨‍💻->>🕷️: Initialize scrapers for MENA sources
    🕷️->>🕷️: Extract article links
    🕷️->>🕷️: Scrape article content
    🕷️->>🤖: Send cleaned text for analysis
    🤖->>🤖: Extract entities & sentiment
    🤖->>🤖: Generate embeddings
    🤖->>🗄️: Store analysis results
    🗄️->>🗄️: Index with pgvector
    👤->>💻: Search companies/tenders
    💻->>⚡: API request
    ⚡->>🗄️: Vector similarity search
    🗄️->>⚡: Return ranked results
    ⚡->>💻: JSON response
    💻->>👤: Display insights
```

## 📸 Screenshots

<table>
<tr>
<td width="50%">
<h4>🏠 Home Landing Page with Chatbot</h4>
<img src="https://raw.githubusercontent.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence/refs/heads/main/screenshots/home.png" alt="Home Page" width="100%"/>
</td>
<td width="50%">
<h4>📊 Dashboard for Sentiment Analysis</h4>
<img src="https://raw.githubusercontent.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence/refs/heads/main/screenshots/dashboard_sentimental.png" alt="Dashboard" width="100%"/>
</td>
</tr>
<tr>
<td width="50%">
<h4>🔍 AI Search Bar</h4>
<img src="https://raw.githubusercontent.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence/refs/heads/main/screenshots/search.png" alt="AI Search" width="100%"/>
</td>
<td width="50%">
<h4>🏢 Company Analysis Page</h4>
<img src="https://raw.githubusercontent.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence/refs/heads/main/screenshots/companyanalysis-gif.gif" alt="Company Analysis" width="100%"/>
</td>
</tr>
<tr>
<td width="50%">
<h4>👨‍💻 Developer Portal</h4>
<img src="https://raw.githubusercontent.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence/refs/heads/main/screenshots/devportal.png" alt="Developer Portal" width="100%"/>
</td>
<td width="50%">
<h4>🕷️ Scraper Selection in Developer Portal</h4>
<img src="https://raw.githubusercontent.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence/refs/heads/main/screenshots/choose%20scrapper.png" alt="Scraper Selection" width="100%"/>
</td>
</tr>
<tr>
<td colspan="2" align="center">
<h4>🗄️ Supabase Database Structure</h4>
<img src="https://raw.githubusercontent.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence/refs/heads/main/screenshots/db.png" alt="Database Structure" width="70%"/>
</td>
</tr>
</table>

## ✨ Key Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered News Monitoring** | 24/7 monitoring of MENA news sources |
| 😊 **Real-Time Sentiment Analysis** | Advanced NLP for market sentiment tracking |
| 🎯 **Smart Tender Discovery** | Automated procurement opportunity identification |
| 💬 **Interactive AI Chatbot** | Natural language querying of procurement data |
| 🏢 **Company Intelligence** | Comprehensive sentiment profiles and risk analysis |
| 🔍 **Vector Search** | Semantic similarity search using embeddings |
| 👨‍💻 **Developer Portal** | Pipeline management and data processing tools |

</div>

## 🚀 Deployment

- **Backend**: Azure App Services
- **Frontend**: Firebase Hosting
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI Models**: OpenAI GPT-4, Groq Llama
- **Vector Embeddings**: OpenAI text-embedding-3-small

---

<div align="center">

**🌟 Transforming MENA procurement with AI intelligence 🌟**

[![Made with ❤️ by Rohit Kumar](https://img.shields.io/badge/Made%20with%20❤️%20by-Rohit%20Kumar-red?style=for-the-badge)](https://github.com/Rohitw3code)

</div>