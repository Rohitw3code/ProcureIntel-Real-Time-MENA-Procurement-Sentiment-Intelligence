import os
import psycopg2
from typing import List, Tuple, Any, Dict, Iterable
from langchain.docstore.document import Document
from langchain.vectorstores.base import VectorStore
from langchain.embeddings.base import Embeddings


class TenderVectorStore(VectorStore):
    def __init__(self, db_connection_string: str, embedding_function: Embeddings):
        self._conn = psycopg2.connect(db_connection_string)
        self._embedding_function = embedding_function

    def add_texts(
        self,
        texts: Iterable[str],
        metadatas: List[dict] | None = None,
        **kwargs: Any,
    ) -> List[str]:
        # This method is not strictly necessary for a read-only vector store
        # but is required by the abstract class.
        raise NotImplementedError("This VectorStore is read-only.")

    def similarity_search(
        self, query: str, k: int = 4, **kwargs: Any
    ) -> List[Document]:
        """
        General similarity search for all articles.
        """
        query_embedding = self._embedding_function.embed_query(query)
        return self.similarity_search_by_vector(query_embedding, k)

    def similarity_search_by_vector(
        self, embedding: List[float], k: int = 4, **kwargs: Any
    ) -> List[Document]:
        """
        Vector similarity search for all articles, restricted to Tender mode.
        """
        with self._conn.cursor() as cur:
            sql = """
            SELECT
            sa.id,
            sa.url,
            sa.cleaned_text,
            ae.embedding <=> %s::vector AS distance
            FROM
            article_embeddings AS ae
            JOIN
            scraped_articles AS sa ON ae.article_id = sa.id
            JOIN
            article_analysis AS aa ON sa.id = aa.article_id
            WHERE
            aa.mode = %s::analysis_mode
            ORDER BY
            distance ASC
            LIMIT %s;
            """
            cur.execute(sql, (embedding, 'Tender', k))
            results = cur.fetchall()

        documents = []
        
        for row in results:
            documents.append(Document(page_content=row[2], metadata={
                "id": row[0],
                "url": row[1],
                "distance": row[3]}))

        print(f"Found {len(documents)} similar tenders for the query.")

        return documents

    def similarity_search_tenders(
        self, query: str, k: int = 4, **kwargs: Any
    ) -> List[Document]:
        """
        Similarity search restricted to articles with analysis_mode = 'Tender'.
        """
        query_embedding = self._embedding_function.embed_query(query)
        return self.similarity_search_by_vector_tenders(query_embedding, k)

    def similarity_search_by_vector_tenders(
        self, embedding: List[float], k: int = 4, **kwargs: Any
    ) -> List[Document]:
        """
        Uses the embedding to find top-k similar articles filtered to mode = 'Tender'.
        """
        with self._conn.cursor() as cur:
            sql = """
            SELECT
              sa.id,
              sa.url,
              sa.cleaned_text,
              ae.embedding <=> %s::vector AS distance
            FROM
              article_embeddings AS ae
            JOIN
              scraped_articles AS sa ON ae.article_id = sa.id
            JOIN
              article_analysis AS aa ON sa.id = aa.article_id
            WHERE
              aa.mode = 'Tender'
            ORDER BY
              distance ASC
            LIMIT %s;
            """
            cur.execute(sql, (embedding, k))
            results = cur.fetchall()

        documents = []
        for row in results:
            documents.append(Document(page_content=row[2], metadata={
                "id": row[0],
                "url": row[1],
                "distance": row[3]}))

        print(f"✅ Found {len(documents)} Tender-mode articles for the query.")

        return documents

    @classmethod
    def from_texts(
        cls,
        texts: List[str],
        embedding: Embeddings,
        metadatas: List[dict] | None = None,
        **kwargs: Any,
    ) -> "ArticleVectorStore":
        # This method is not strictly necessary for a read-only vector store
        # but is required by the abstract class.
        raise NotImplementedError("This VectorStore is read-only.")
