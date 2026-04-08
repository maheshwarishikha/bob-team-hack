# Knowledge Base MCP Server

An MCP (Model Context Protocol) server that connects Bob to a Chroma vector database for semantic search and knowledge retrieval.

## Features

- **Semantic Search**: Query your knowledge base using natural language
- **Document Management**: Add, retrieve, list, and delete documents
- **Metadata Filtering**: Filter results by custom metadata
- **Collection Statistics**: Get insights about your knowledge base

## Available Tools

1. **search_knowledge** - Search for relevant information using semantic similarity
2. **get_document** - Retrieve a specific document by ID
3. **list_documents** - List all documents with optional filtering
4. **get_stats** - Get collection statistics
5. **add_document** - Add new documents to the knowledge base
6. **delete_document** - Remove documents from the knowledge base

## Setup Instructions

### 1. Install Chroma

```bash
pip install chromadb
```

### 2. Start Chroma Server

Option A - Using Python:
```bash
chroma run --host localhost --port 8000 --path ./chroma_data
```

Option B - Using Docker:
```bash
docker run -p 8000:8000 chromadb/chroma
```

### 3. Populate Knowledge Base (Optional)

Run the setup script to add sample documents:

```bash
python setup_chroma.py
```

This will:
- Install chromadb if needed
- Guide you through starting the Chroma server
- Populate the database with sample documents about programming, databases, and development tools

### 4. Configure MCP Server

The MCP server is already configured in Bob's settings. It will connect to:
- Host: `localhost` (configurable via `CHROMA_HOST` env var)
- Port: `8000` (configurable via `CHROMA_PORT` env var)
- Collection: `knowledge_base` (configurable via `CHROMA_COLLECTION` env var)

## Usage Examples

Once configured, you can ask Bob to use your knowledge base:

### Search for Information
```
"Search my knowledge base for information about Python async programming"
```

### Get Statistics
```
"How many documents are in my knowledge base?"
```

### Add New Knowledge
```
"Add this to my knowledge base: [your content here]"
```

### List Documents
```
"List all documents in my knowledge base about programming"
```

## Environment Variables

- `CHROMA_HOST`: Chroma server host (default: `localhost`)
- `CHROMA_PORT`: Chroma server port (default: `8000`)
- `CHROMA_COLLECTION`: Collection name (default: `knowledge_base`)

## Customization

### Adding Your Own Documents

You can add documents programmatically using the Python client:

```python
import chromadb

client = chromadb.HttpClient(host="localhost", port=8000)
collection = client.get_or_create_collection(name="knowledge_base")

collection.add(
    ids=["doc_custom_1"],
    documents=["Your document content here"],
    metadatas=[{"category": "custom", "topic": "example"}]
)
```

### Using Different Collections

To use a different collection, set the `CHROMA_COLLECTION` environment variable in the MCP settings configuration.

## Troubleshooting

### Chroma Server Not Running
If you get connection errors, ensure the Chroma server is running:
```bash
chroma run --host localhost --port 8000
```

### Port Already in Use
If port 8000 is in use, change the port:
```bash
chroma run --host localhost --port 8001
```
Then update the `CHROMA_PORT` environment variable in Bob's MCP settings.

### Empty Results
If searches return no results, ensure:
1. The Chroma server is running
2. Documents have been added to the collection
3. The collection name matches the configuration

## Architecture

```
Bob (AI Assistant)
    ↓
MCP Protocol
    ↓
Knowledge Base MCP Server (Node.js/TypeScript)
    ↓
Chroma Client (chromadb npm package)
    ↓
Chroma Server (HTTP API)
    ↓
Vector Database (Chroma)
```

## Development

### Build the Server
```bash
cd knowledge-base-server
npm install
npm run build
```

### Watch Mode
```bash
npm run watch
```

## License

MIT