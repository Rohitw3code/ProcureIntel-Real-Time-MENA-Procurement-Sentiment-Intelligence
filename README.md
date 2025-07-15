# 🚀 ProcureIntel - MENA Procurement Intelligence Platform

<div align="center">

![ProcureIntel Logo](https://img.shields.io/badge/ProcureIntel-AI%20Powered-emerald?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgM1YyMUgyMVYzSDNaTTUgNUgxOVYxOUg1VjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)

**Transform MENA Procurement with AI-Powered Intelligence**

[![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-green?style=flat-square&logo=python)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![LangChain](https://img.shields.io/badge/LangChain-AI%20Framework-orange?style=flat-square)](https://langchain.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-purple?style=flat-square&logo=openai)](https://openai.com/)

[🌟 Features](#-key-features) • [🚀 Quick Start](#-quick-start) • [🏗️ Architecture](#️-architecture) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🌟 Key Features](#-key-features)
- [🔧 Technology Stack](#-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [🏗️ Architecture](#️-architecture)
- [💡 Use Cases](#-use-cases)
- [🔍 Core Components](#-core-components)
- [📊 Data Pipeline](#-data-pipeline)
- [🤖 AI & Machine Learning](#-ai--machine-learning)
- [📱 User Interface](#-user-interface)
- [🔐 Security & Privacy](#-security--privacy)
- [📈 Performance](#-performance)
- [🌍 Deployment](#-deployment)
- [📖 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

**ProcureIntel** is a cutting-edge AI-powered procurement intelligence platform specifically designed for the Middle East and North Africa (MENA) region. It transforms how organizations discover tender opportunities, analyze market sentiment, and extract actionable insights from thousands of news sources across the region.

### 🌟 Why ProcureIntel?

In the rapidly evolving MENA procurement landscape, staying ahead requires more than traditional methods. ProcureIntel leverages advanced AI technologies to provide:

- **Real-time Intelligence**: Continuous monitoring of 10+ MENA news sources
- **AI-Powered Analysis**: Advanced NLP for sentiment analysis and entity extraction
- **Smart Discovery**: Automated tender detection with contract value extraction
- **Interactive Insights**: Natural language querying of procurement data
- **Competitive Edge**: Early identification of market opportunities and risks

---

## 🌟 Key Features

### 🔍 **AI-Powered News Monitoring**
- **Continuous Scanning**: 24/7 monitoring of thousands of MENA news sources
- **Smart Filtering**: AI-powered content filtering for procurement relevance
- **Entity Extraction**: Automatic identification of companies, countries, and commodities
- **Multi-language Support**: Arabic and English content processing

### 📊 **Real-Time Sentiment Analysis**
- **Advanced NLP**: Sentiment analysis trained specifically for MENA markets
- **Risk Assessment**: Automated risk factor identification and classification
- **Trend Tracking**: Historical sentiment evolution and pattern recognition
- **Company Profiling**: Comprehensive sentiment profiles for key market players

### 🎯 **Smart Tender Discovery**
- **Automated Detection**: AI-powered tender opportunity identification
- **Value Extraction**: Contract value and deadline extraction
- **Categorization**: Sector and commodity-based tender classification
- **Alert System**: Real-time notifications for relevant opportunities

### 🤖 **Interactive AI Chatbot**
- **Natural Language Queries**: Ask questions in plain English or Arabic
- **Contextual Understanding**: AI understands complex procurement queries
- **Source References**: All answers include source citations and links
- **Multi-model Support**: OpenAI GPT-4 and Groq Llama integration

### 📈 **Advanced Analytics Dashboard**
- **Real-time Metrics**: Live statistics and KPIs
- **Interactive Visualizations**: Charts, graphs, and trend analysis
- **Custom Filters**: Advanced filtering and search capabilities
- **Export Functionality**: Data export in multiple formats

### 🔗 **Comprehensive API**
- **RESTful Architecture**: Well-documented REST API endpoints
- **Real-time Data**: Live access to all platform data
- **Webhook Support**: Real-time notifications and updates
- **Rate Limiting**: Enterprise-grade API management

---

## 🔧 Technology Stack

### **Frontend Technologies**
```typescript
// Modern React with TypeScript
React 18.3.1 + TypeScript 5.5.3
Tailwind CSS 3.4.1 (Styling)
Recharts 3.1.0 (Data Visualization)
Lucide React (Icons)
Vite (Build Tool)
```

### **Backend Technologies**
```python
# Python-based AI Pipeline
Flask 2.3.0 (Web Framework)
LangChain 0.1.0 (AI Framework)
OpenAI GPT-4 (Language Model)
Groq Llama (Alternative LLM)
psycopg2 (PostgreSQL Driver)
BeautifulSoup4 (Web Scraping)
```

### **Database & Vector Store**
```sql
-- Supabase PostgreSQL with Vector Extensions
PostgreSQL 15+ (Primary Database)
pgvector (Vector Similarity Search)
Supabase (Database as a Service)
Redis (Caching Layer)
```

### **AI & Machine Learning**
```python
# Advanced AI Pipeline
LangChain (AI Framework)
OpenAI Embeddings (text-embedding-3-small)
OpenAI GPT-4 (Analysis & Chat)
Groq Llama Models (Alternative LLM)
Custom Vector Stores (Similarity Search)
Sentiment Analysis Models
```


---

## 🚀 Quick Start

### Prerequisites

```bash
# Required Software
Node.js 18+ 
Python 3.11+
PostgreSQL 15+
Git
```

### 1. Clone the Repository

```bash
git clone https://github.com/Rohitw3code/ProcureIntel-Real-Time-MENA-Procurement-Sentiment-Intelligence
cd procureintel
```

### 2. Environment Setup

```bash
# Frontend Environment
cp .env.example .env
# Configure your environment variables

# Backend Environment
cd api
cp .env.example .env
# Add your API keys and database credentials
```

### 3. Install Dependencies

```bash
# Frontend Dependencies
npm install

# Backend Dependencies
cd api
pip install -r requirements.txt
```

### 5. Configure API Keys

```bash
# Required API Keys in .env
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_DB_PASSWORD=your_db_password
```

### 6. Start Development Servers

```bash
# Start Frontend (Terminal 1)
npm run dev

# Start Backend (Terminal 2)
cd api
python app.py
```

### 7. Access the Application

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

---

## 🏗️ Architecture

### **System Architecture Overview**

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React + TypeScript UI]
        B[Tailwind CSS Styling]
        C[Recharts Visualization]
    end
    
    subgraph "API Layer"
        D[Flask REST API]
        E[Authentication]
        F[Rate Limiting]
    end
    
    subgraph "AI Processing Layer"
        G[LangChain Framework]
        H[OpenAI GPT-4]
        I[Groq Llama Models]
        J[Vector Embeddings]
    end
    
    subgraph "Data Layer"
        K[Supabase PostgreSQL]
        L[pgvector Extension]
        M[Redis Cache]
    end
    
    subgraph "Data Sources"
        N[MENA News Sources]
        O[Government Portals]
        P[Industry Publications]
    end
    
    A --> D
    D --> G
    G --> H
    G --> I
    G --> J
    D --> K
    K --> L
    D --> M
    G --> N
    G --> O
    G --> P
```

### **Data Flow Architecture**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant AI as AI Engine
    participant DB as Database
    participant VS as Vector Store
    
    U->>F: Search Query
    F->>A: API Request
    A->>AI: Process Query
    AI->>VS: Vector Search
    VS->>DB: Retrieve Data
    DB->>VS: Return Results
    VS->>AI: Ranked Results
    AI->>A: Processed Response
    A->>F: JSON Response
    F->>U: Rendered UI
```

---

## 💡 Use Cases

### 🏢 **Enterprise Procurement Teams**

**Challenge**: Manual monitoring of hundreds of procurement opportunities across MENA region
**Solution**: Automated tender discovery with AI-powered relevance scoring

```typescript
// Example: Automated Tender Alerts
const tenderAlert = {
  query: "infrastructure development UAE",
  filters: {
    contractValue: "> $1M",
    deadline: "next 30 days",
    sectors: ["construction", "technology"]
  },
  notifications: ["email", "slack", "webhook"]
};
```

### 📊 **Market Research Analysts**

**Challenge**: Understanding market sentiment and competitive landscape
**Solution**: Real-time sentiment analysis with historical trend tracking

```python
# Example: Sentiment Analysis Pipeline
from langchain import OpenAI
from custom_vector_store import CompanyVectorStore

def analyze_company_sentiment(company_name: str):
    """Analyze sentiment trends for a specific company"""
    vector_store = CompanyVectorStore()
    results = vector_store.similarity_search(company_name, k=50)
    
    sentiment_analysis = llm.analyze_sentiment(results)
    return {
        "overall_sentiment": sentiment_analysis.overall,
        "trend": sentiment_analysis.trend,
        "risk_factors": sentiment_analysis.risks,
        "opportunities": sentiment_analysis.opportunities
    }
```

### 🎯 **Business Development Teams**

**Challenge**: Identifying partnership and investment opportunities
**Solution**: AI-powered company intelligence with relationship mapping

### 🏛️ **Government Agencies**

**Challenge**: Market transparency and regulatory compliance monitoring
**Solution**: Comprehensive market oversight with automated reporting

---

## 🔍 Core Components

### **1. Web Scraping Engine**

```python
# Advanced Web Scraping with Error Handling
class NewsScraperManager:
    def __init__(self):
        self.scrapers = self.discover_scrapers()
        self.rate_limiter = RateLimiter()
    
    def scrape_articles(self, sources: List[str]) -> List[Article]:
        """Scrape articles from multiple sources concurrently"""
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            for source in sources:
                future = executor.submit(self._scrape_source, source)
                futures.append(future)
            
            results = []
            for future in as_completed(futures):
                try:
                    articles = future.result(timeout=30)
                    results.extend(articles)
                except Exception as e:
                    logger.error(f"Scraping failed: {e}")
            
            return results
```

### **2. AI Analysis Pipeline**

```python
# LangChain-based Analysis Pipeline
from langchain.chains import RetrievalQA
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI

class ProcurementAnalyzer:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.llm = OpenAI(model="gpt-4")
        self.vector_store = ArticleVectorStore()
    
    def analyze_article(self, article_text: str) -> AnalysisResult:
        """Comprehensive article analysis"""
        
        # Extract entities and sentiment
        analysis_chain = self._create_analysis_chain()
        result = analysis_chain.run(article_text)
        
        # Generate embeddings for similarity search
        embedding = self.embeddings.embed_query(article_text)
        
        # Store in vector database
        self.vector_store.add_texts(
            texts=[article_text],
            embeddings=[embedding],
            metadatas=[result.metadata]
        )
        
        return result
```

### **3. Vector Database Integration**

```python
# Custom Supabase Vector Store
class ArticleVectorStore(VectorStore):
    def __init__(self, db_connection_string: str, embedding_function: Embeddings):
        self._conn = psycopg2.connect(db_connection_string)
        self._embedding_function = embedding_function
    
    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        """Perform vector similarity search"""
        query_embedding = self._embedding_function.embed_query(query)
        
        with self._conn.cursor() as cur:
            sql = """
            SELECT
              sa.id,
              sa.cleaned_text,
              ae.embedding <=> %s::vector AS distance
            FROM
              article_embeddings AS ae
            JOIN
              scraped_articles AS sa ON ae.article_id = sa.id
            ORDER BY
              distance ASC
            LIMIT %s;
            """
            cur.execute(sql, (query_embedding, k))
            results = cur.fetchall()
        
        return [Document(page_content=row[1], metadata={"id": row[0], "distance": row[2]}) 
                for row in results]
```

### **4. Real-time Chat Interface**

```typescript
// AI-Powered Chat Component
export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async (query: string) => {
    setIsLoading(true);
    
    try {
      // Initialize chat with selected AI model
      await chatApi.initializeChat({
        provider: 'openai',
        model_name: 'gpt-4',
        temperature: 0.1
      });
      
      // Send query to AI
      const response = await chatApi.sendQuery({ query });
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.response,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-interface">
      {/* Chat implementation */}
    </div>
  );
};
```

---

## 📊 Data Pipeline

### **Pipeline Architecture**

```mermaid
graph LR
    A[News Sources] --> B[Web Scrapers]
    B --> C[Content Cleaning]
    C --> D[Entity Extraction]
    D --> E[Sentiment Analysis]
    E --> F[Vector Embeddings]
    F --> G[Database Storage]
    G --> H[API Endpoints]
    H --> I[Frontend UI]
    
    subgraph "AI Processing"
        D
        E
        F
    end
    
    subgraph "Data Storage"
        G
        J[Vector Database]
        K[Metadata Store]
    end
```

### **Pipeline Stages**

#### **Stage 1: Data Collection**
```python
# Automated news collection from multiple sources
sources = [
    "gulfnews.com",
    "zawya.com", 
    "menabytes.com",
    # ... more sources
]

pipeline_manager.run_link_scraper(sources)
```

#### **Stage 2: Content Processing**
```python
# Clean and normalize article content
def clean_article_text(raw_text: str) -> str:
    # Remove boilerplate content
    # Normalize quotes and punctuation
    # Extract main content
    return cleaned_text
```

#### **Stage 3: AI Analysis**
```python
# Extract entities and analyze sentiment
analysis_result = ai_analyzer.analyze({
    "text": cleaned_text,
    "model": "gpt-4",
    "extract": ["companies", "countries", "commodities", "sentiment"]
})
```

#### **Stage 4: Vector Storage**
```python
# Generate embeddings and store in vector database
embedding = openai_embeddings.embed_query(cleaned_text)
vector_store.add_document(
    text=cleaned_text,
    embedding=embedding,
    metadata=analysis_result
)
```

---

## 🤖 AI & Machine Learning

### **Large Language Models**

#### **OpenAI GPT-4 Integration**
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.1,
    max_tokens=2000
)

# Structured output for entity extraction
structured_llm = llm.with_structured_output(ArticleAnalysis)
```

#### **Groq Llama Models**
```python
from langchain_groq import ChatGroq

groq_llm = ChatGroq(
    model_name="llama3-70b-8192",
    temperature=0.1,
    groq_api_key=os.getenv("GROQ_API_KEY")
)
```

### **Vector Embeddings**

#### **OpenAI Embeddings**
```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    dimensions=1536
)

# Generate embeddings for similarity search
text_embedding = embeddings.embed_query("renewable energy projects UAE")
```

### **Sentiment Analysis Pipeline**

```python
class SentimentAnalyzer:
    def __init__(self):
        self.prompt_template = ChatPromptTemplate.from_template("""
        Analyze the sentiment of this MENA business article:
        
        Article: {article_text}
        
        Extract:
        1. Overall sentiment (Positive/Negative/Neutral)
        2. Key companies mentioned
        3. Risk factors identified
        4. Market opportunities
        
        Provide structured analysis in JSON format.
        """)
    
    def analyze(self, article_text: str) -> SentimentResult:
        chain = self.prompt_template | self.llm | self.output_parser
        return chain.invoke({"article_text": article_text})
```

### **Entity Recognition**

```python
class EntityExtractor:
    def extract_entities(self, text: str) -> EntityResult:
        """Extract companies, countries, commodities from text"""
        
        extraction_prompt = """
        Extract the following entities from this procurement article:
        
        Text: {text}
        
        Entities to extract:
        - Companies: All company names mentioned
        - Countries: All countries/regions mentioned  
        - Commodities: All products/services/sectors mentioned
        - Contract Value: Any monetary values mentioned
        - Deadlines: Any dates or deadlines mentioned
        
        Return as structured JSON.
        """
        
        result = self.llm.invoke(extraction_prompt.format(text=text))
        return self.parse_entities(result)
```

---

## 📱 User Interface

### **Modern React Architecture**

```typescript
// Component-based architecture with TypeScript
interface DashboardProps {
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onRefresh }) => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  return (
    <div className="dashboard-container">
      <MetricsGrid stats={stats} />
      <CompanySearch />
      <TenderSection />
    </div>
  );
};
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for providing advanced language models
- **LangChain** for the excellent AI framework
- **Supabase** for the powerful backend platform
- **React Team** for the amazing frontend framework
- **MENA Business Community** for inspiration and feedback


---

<div align="center">

**Made with ❤️ Rohit Kumar**

</div>