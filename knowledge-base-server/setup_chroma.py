#!/usr/bin/env python3
"""
Setup script for Chroma vector database with sample knowledge base data.
This script will:
1. Install Chroma if not already installed
2. Start a local Chroma server
3. Populate it with sample documents
"""

import subprocess
import sys
import time
import os

def install_chromadb():
    """Install chromadb package if not already installed."""
    print("Installing chromadb...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "chromadb"])
        print("✓ chromadb installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install chromadb: {e}")
        sys.exit(1)

def populate_knowledge_base():
    """Populate Chroma with sample knowledge base documents."""
    print("\nPopulating knowledge base with sample data...")
    
    try:
        import chromadb
        from chromadb.config import Settings
        
        # Connect to Chroma
        client = chromadb.HttpClient(host="localhost", port=8000)
        
        # Create or get collection
        collection = client.get_or_create_collection(
            name="knowledge_base",
            metadata={"description": "Sample knowledge base for Bob integration"}
        )
        
        # Sample documents about various topics
        documents = [
            {
                "id": "doc_python_basics",
                "content": "Python is a high-level, interpreted programming language known for its simplicity and readability. It supports multiple programming paradigms including procedural, object-oriented, and functional programming. Python uses dynamic typing and automatic memory management.",
                "metadata": {
                    "category": "programming",
                    "topic": "python",
                    "difficulty": "beginner",
                    "tags": "python,basics,programming"
                }
            },
            {
                "id": "doc_python_async",
                "content": "Asynchronous programming in Python is achieved using the asyncio library. It allows you to write concurrent code using async/await syntax. This is particularly useful for I/O-bound operations like network requests, file operations, and database queries.",
                "metadata": {
                    "category": "programming",
                    "topic": "python",
                    "difficulty": "intermediate",
                    "tags": "python,async,concurrency"
                }
            },
            {
                "id": "doc_typescript_intro",
                "content": "TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing, classes, and interfaces to JavaScript. TypeScript helps catch errors early through its type system and provides better tooling support.",
                "metadata": {
                    "category": "programming",
                    "topic": "typescript",
                    "difficulty": "beginner",
                    "tags": "typescript,javascript,types"
                }
            },
            {
                "id": "doc_vector_databases",
                "content": "Vector databases are specialized databases designed to store and query high-dimensional vectors efficiently. They use techniques like approximate nearest neighbor (ANN) search to find similar vectors quickly. Common use cases include semantic search, recommendation systems, and RAG applications.",
                "metadata": {
                    "category": "databases",
                    "topic": "vector-db",
                    "difficulty": "intermediate",
                    "tags": "vector-database,embeddings,search"
                }
            },
            {
                "id": "doc_chroma_overview",
                "content": "Chroma is an open-source embedding database that makes it easy to build AI applications with embeddings. It provides a simple API for storing documents with their embeddings and querying them using semantic similarity. Chroma can run locally or in the cloud.",
                "metadata": {
                    "category": "databases",
                    "topic": "chroma",
                    "difficulty": "beginner",
                    "tags": "chroma,vector-database,embeddings"
                }
            },
            {
                "id": "doc_mcp_protocol",
                "content": "Model Context Protocol (MCP) is a protocol for connecting AI assistants to external tools and data sources. It enables AI models to interact with various services through a standardized interface. MCP servers expose tools and resources that can be used by AI assistants.",
                "metadata": {
                    "category": "ai",
                    "topic": "mcp",
                    "difficulty": "intermediate",
                    "tags": "mcp,protocol,ai-integration"
                }
            },
            {
                "id": "doc_rest_api",
                "content": "REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations. They are stateless, cacheable, and use standard HTTP status codes.",
                "metadata": {
                    "category": "web-development",
                    "topic": "api",
                    "difficulty": "beginner",
                    "tags": "rest,api,http"
                }
            },
            {
                "id": "doc_docker_basics",
                "content": "Docker is a platform for developing, shipping, and running applications in containers. Containers package an application with all its dependencies, ensuring it runs consistently across different environments. Docker uses images as templates to create containers.",
                "metadata": {
                    "category": "devops",
                    "topic": "docker",
                    "difficulty": "beginner",
                    "tags": "docker,containers,devops"
                }
            },
            {
                "id": "doc_git_workflow",
                "content": "Git is a distributed version control system. Common workflows include feature branching, where developers create branches for new features, make commits, and merge back to main. Pull requests enable code review before merging. Git supports collaboration through remote repositories.",
                "metadata": {
                    "category": "development-tools",
                    "topic": "git",
                    "difficulty": "beginner",
                    "tags": "git,version-control,workflow"
                }
            },
            {
                "id": "doc_react_hooks",
                "content": "React Hooks are functions that let you use state and other React features in functional components. Common hooks include useState for state management, useEffect for side effects, useContext for context API, and useMemo for memoization. Hooks follow specific rules and naming conventions.",
                "metadata": {
                    "category": "web-development",
                    "topic": "react",
                    "difficulty": "intermediate",
                    "tags": "react,hooks,frontend"
                }
            }
        ]
        
        # Add documents to collection
        collection.add(
            ids=[doc["id"] for doc in documents],
            documents=[doc["content"] for doc in documents],
            metadatas=[doc["metadata"] for doc in documents]
        )
        
        print(f"✓ Successfully added {len(documents)} documents to the knowledge base")
        
        # Verify the data
        count = collection.count()
        print(f"✓ Total documents in collection: {count}")
        
        # Test a sample query
        print("\nTesting sample query: 'What is Python?'")
        results = collection.query(
            query_texts=["What is Python?"],
            n_results=2
        )
        
        print("\nTop 2 results:")
        for i, doc in enumerate(results['documents'][0]):
            print(f"\n{i+1}. {doc[:100]}...")
            print(f"   Metadata: {results['metadatas'][0][i]}")
        
        print("\n✓ Knowledge base setup complete!")
        
    except Exception as e:
        print(f"✗ Error populating knowledge base: {e}")
        sys.exit(1)

def main():
    print("=" * 60)
    print("Chroma Knowledge Base Setup")
    print("=" * 60)
    
    # Check if chromadb is installed
    try:
        import chromadb
        print("✓ chromadb is already installed")
    except ImportError:
        install_chromadb()
    
    print("\n" + "=" * 60)
    print("Starting Chroma Server")
    print("=" * 60)
    print("\nTo start the Chroma server, run in a separate terminal:")
    print("  chroma run --host localhost --port 8000 --path ./chroma_data")
    print("\nOr use Docker:")
    print("  docker run -p 8000:8000 chromadb/chroma")
    print("\nPress Enter once the Chroma server is running...")
    input()
    
    # Populate the knowledge base
    populate_knowledge_base()
    
    print("\n" + "=" * 60)
    print("Next Steps")
    print("=" * 60)
    print("1. Keep the Chroma server running")
    print("2. The MCP server will connect to Chroma at localhost:8000")
    print("3. You can now use Bob to query your knowledge base!")

if __name__ == "__main__":
    main()

# Made with Bob
