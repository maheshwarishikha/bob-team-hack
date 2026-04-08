# Knowledge Base Integration - Usage Guide

## Quick Start

### Step 1: Start Chroma Server

First, you need to start the Chroma vector database server. Choose one of these options:

**Option A - Using Python (Recommended for local development):**
```bash
# Install chromadb if not already installed
pip install chromadb

# Start the server
chroma run --host localhost --port 8000 --path ./chroma_data
```

**Option B - Using Docker:**
```bash
docker run -p 8000:8000 chromadb/chroma
```

Keep this terminal running in the background.

### Step 2: Populate Your Knowledge Base

Run the setup script to add sample documents:

```bash
cd knowledge-base-server
python setup_chroma.py
```

This will add 10 sample documents covering topics like:
- Python programming (basics and async)
- TypeScript
- Vector databases and Chroma
- MCP protocol
- REST APIs
- Docker
- Git workflows
- React hooks

### Step 3: Restart Bob

After the MCP server is configured, restart Bob (or reload the window) to connect to the knowledge base server.

### Step 4: Start Using Your Knowledge Base!

Now you can ask Bob to search your knowledge base. Here are some example queries:

## Example Queries

### 1. Search for Information
```
"Search my knowledge base for information about Python async programming"
```

Bob will use the `search_knowledge` tool to find relevant documents and return the most similar results.

### 2. Get Knowledge Base Statistics
```
"How many documents are in my knowledge base?"
```

Bob will use the `get_stats` tool to show collection information.

### 3. List Documents by Category
```
"List all documents in my knowledge base about programming"
```

Bob will use the `list_documents` tool with metadata filtering.

### 4. Add New Knowledge
```
"Add this to my knowledge base: FastAPI is a modern Python web framework for building APIs. It's based on standard Python type hints and provides automatic API documentation."
```

Bob will use the `add_document` tool to store your new knowledge.

### 5. Retrieve Specific Document
```
"Get the document with ID doc_python_basics from my knowledge base"
```

Bob will use the `get_document` tool to retrieve the exact document.

### 6. Complex Queries
```
"What do I know about databases and search technologies?"
```

Bob will search semantically and return relevant information about vector databases, Chroma, etc.

## Available MCP Tools

The knowledge base server provides these tools to Bob:

1. **search_knowledge**
   - Search using natural language queries
   - Returns top N most relevant documents
   - Supports metadata filtering
   - Shows similarity scores

2. **get_document**
   - Retrieve a specific document by ID
   - Returns full content and metadata

3. **list_documents**
   - List all documents in the collection
   - Supports pagination (limit/offset)
   - Supports metadata filtering

4. **get_stats**
   - Get collection statistics
   - Shows total document count
   - Shows connection information

5. **add_document**
   - Add new documents to the knowledge base
   - Supports custom metadata
   - Auto-generates IDs or accepts custom IDs

6. **delete_document**
   - Remove documents by ID
   - Permanent deletion

## Adding Your Own Documents

### Method 1: Through Bob
Simply tell Bob to add information:
```
"Add to my knowledge base: [your content here] with metadata category: custom, topic: example"
```

### Method 2: Using Python Script
Create a script to bulk-add documents:

```python
import chromadb

# Connect to Chroma
client = chromadb.HttpClient(host="localhost", port=8000)
collection = client.get_or_create_collection(name="knowledge_base")

# Add documents
documents = [
    {
        "id": "doc_custom_1",
        "content": "Your document content here...",
        "metadata": {
            "category": "custom",
            "topic": "example",
            "tags": "tag1,tag2"
        }
    },
    # Add more documents...
]

collection.add(
    ids=[doc["id"] for doc in documents],
    documents=[doc["content"] for doc in documents],
    metadatas=[doc["metadata"] for doc in documents]
)

print(f"Added {len(documents)} documents")
```

### Method 3: Import from Files
You can create a script to import documents from files:

```python
import chromadb
import os

client = chromadb.HttpClient(host="localhost", port=8000)
collection = client.get_or_create_collection(name="knowledge_base")

# Import all .txt files from a directory
docs_dir = "./my_documents"
for filename in os.listdir(docs_dir):
    if filename.endswith(".txt"):
        with open(os.path.join(docs_dir, filename), 'r') as f:
            content = f.read()
            doc_id = f"doc_{filename.replace('.txt', '')}"
            collection.add(
                ids=[doc_id],
                documents=[content],
                metadatas=[{"source": filename, "type": "text"}]
            )
            print(f"Added {filename}")
```

## Metadata Best Practices

Use metadata to organize and filter your documents:

```python
metadata = {
    "category": "programming",      # Main category
    "topic": "python",              # Specific topic
    "difficulty": "intermediate",   # Difficulty level
    "tags": "async,concurrency",    # Comma-separated tags
    "source": "documentation",      # Where it came from
    "date_added": "2024-01-15",    # When it was added
    "author": "team",              # Who added it
}
```

Then filter when searching:
```
"Search my knowledge base for intermediate Python topics"
```

## Configuration

### Change Chroma Connection
Edit the MCP settings at `~/.bob/settings/mcp_settings.json`:

```json
{
  "mcpServers": {
    "knowledge-base": {
      "env": {
        "CHROMA_HOST": "localhost",
        "CHROMA_PORT": "8000",
        "CHROMA_COLLECTION": "knowledge_base"
      }
    }
  }
}
```

### Use Different Collection
To use a different collection for different projects:

1. Update `CHROMA_COLLECTION` in MCP settings
2. Restart Bob
3. Populate the new collection with relevant documents

## Troubleshooting

### "Connection refused" or "Cannot connect to Chroma"
- Ensure Chroma server is running: `chroma run --host localhost --port 8000`
- Check the port isn't already in use
- Verify the host/port in MCP settings match your Chroma server

### "No results found"
- Ensure documents have been added to the collection
- Check you're using the correct collection name
- Try a different search query

### "MCP server not responding"
- Check Bob's MCP settings are correct
- Verify the path to `build/index.js` is correct
- Try rebuilding: `cd knowledge-base-server && npm run build`
- Restart Bob

### Documents not persisting
- Ensure you specified a `--path` when starting Chroma
- Check the path has write permissions
- Verify data is being saved to the correct location

## Advanced Usage

### Multiple Collections
You can create multiple collections for different purposes:

```python
# Work knowledge base
work_collection = client.get_or_create_collection(name="work_kb")

# Personal knowledge base
personal_collection = client.get_or_create_collection(name="personal_kb")

# Project-specific knowledge base
project_collection = client.get_or_create_collection(name="project_xyz_kb")
```

Then switch between them by updating the `CHROMA_COLLECTION` environment variable in MCP settings.

### Backup Your Knowledge Base
Chroma stores data in the path you specified. To backup:

```bash
# If using --path ./chroma_data
tar -czf chroma_backup_$(date +%Y%m%d).tar.gz ./chroma_data
```

### Import from External Sources
You can create scripts to import from:
- Confluence pages
- Notion databases
- Google Docs
- Markdown files
- PDF documents (using text extraction)
- Web pages (using web scraping)

## Next Steps

1. **Customize the sample data** - Replace with your own documents
2. **Set up automated imports** - Create scripts to regularly update your knowledge base
3. **Organize with metadata** - Use consistent metadata schemas
4. **Create multiple collections** - Separate different types of knowledge
5. **Integrate with your workflow** - Add documents as you create them

## Support

For issues or questions:
- Check the README.md for setup instructions
- Review the troubleshooting section above
- Check Chroma documentation: https://docs.trychroma.com/
- Check MCP documentation: https://modelcontextprotocol.io/

Happy knowledge base building! 🚀