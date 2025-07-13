import os
import psycopg2
from typing import List, Tuple, Any, Dict, Iterable, Optional
from langchain.docstore.document import Document
from langchain.vectorstores.base import VectorStore
from langchain.embeddings.base import Embeddings

class CompanyNameVectorStore(VectorStore):
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
        self, query: str, k: int = 4, score_threshold: Optional[float] = None, **kwargs: Any
    ) -> List[Document]:
        """
        Performs a similarity search.
        
        Args:
            query: The text to search for.
            k: The number of results to return (used if score_threshold is None).
            score_threshold: A similarity score threshold. If set, returns all
                             results with a distance score less than this value.
        
        Returns:
            A list of matching documents.
        """
        query_embedding = self._embedding_function.embed_query(query)
        return self.similarity_search_by_vector(
            query_embedding, k, score_threshold=score_threshold, **kwargs
        )
    
    def similarity_search_by_vector(
        self, embedding: List[float], k: int = 4, score_threshold: Optional[float] = None, **kwargs: Any
    ) -> List[Document]:
        """
        Performs a similarity search using a pre-computed vector.

        If a score_threshold is provided, it will be used to filter results
        and the 'k' limit will be ignored. Otherwise, the top 'k' results
        will be returned.
        """
        with self._conn.cursor() as cur:
            sql_template = """
            SELECT
              id,
              real_name,
              embedding <=> %(embedding)s::vector AS distance
            FROM
              companies
            {where_clause}
            ORDER BY
              distance ASC
            {limit_clause};
            """
            
            params = {'embedding': str(embedding)}
            where_clause = ""
            limit_clause = ""

            # If a score_threshold is provided, filter by it and ignore k.
            # This gets ALL results better than the threshold.
            if score_threshold is not None:
                where_clause = "WHERE (embedding <=> %(embedding)s::vector) < %(score_threshold)s"
                params['score_threshold'] = score_threshold
            # Otherwise, use the limit k.
            else:
                limit_clause = "LIMIT %(k)s"
                params['k'] = k

            # Format the final query
            sql = sql_template.format(where_clause=where_clause, limit_clause=limit_clause)
            
            cur.execute(sql, params)
            results = cur.fetchall()

        documents = []
        for row in results:
            documents.append(Document(page_content=row[1], metadata={
                "id": row[0],
                "real_name": row[1],
                "distance": row[2]}))
        
        print(f"✅ Found {len(documents)} similar companies for the query.")

        return documents

    @classmethod
    def from_texts(
        cls,
        texts: List[str],
        embedding: Embeddings,
        metadatas: List[dict] | None = None,
        **kwargs: Any,
    ) -> "CompanyNameVectorStore":
        # This method is not strictly necessary for a read-only vector store
        # but is required by the abstract class.
        raise NotImplementedError("This VectorStore is read-only.")
