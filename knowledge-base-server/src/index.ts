#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ChromaClient } from "chromadb";

// Environment variables
const CHROMA_HOST = process.env.CHROMA_HOST || "localhost";
const CHROMA_PORT = process.env.CHROMA_PORT || "8000";
const CHROMA_COLLECTION = process.env.CHROMA_COLLECTION || "knowledge_base";

// Initialize Chroma client
const chromaClient = new ChromaClient({
  path: `http://${CHROMA_HOST}:${CHROMA_PORT}`,
});

// Create MCP server
const server = new McpServer({
  name: "knowledge-base-server",
  version: "0.1.0",
});

// Helper function to get or create collection
async function getCollection() {
  try {
    return await chromaClient.getOrCreateCollection({
      name: CHROMA_COLLECTION,
    });
  } catch (error) {
    throw new Error(`Failed to access collection: ${error}`);
  }
}

// Tool: Search knowledge base with semantic similarity
server.tool(
  "search_knowledge",
  {
    query: z.string().describe("The search query to find relevant information"),
    n_results: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .describe("Number of results to return (default: 5)"),
    filter: z
      .record(z.any())
      .optional()
      .describe("Optional metadata filter as JSON object"),
  },
  async ({ query, n_results = 5, filter }) => {
    try {
      const collection = await getCollection();
      
      const results = await collection.query({
        queryTexts: [query],
        nResults: n_results,
        where: filter,
      });

      if (!results.documents[0] || results.documents[0].length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No relevant information found in the knowledge base.",
            },
          ],
        };
      }

      // Format results with metadata and distances
      const formattedResults = results.documents[0].map((doc, idx) => ({
        content: doc,
        metadata: results.metadatas?.[0]?.[idx] || {},
        similarity: results.distances?.[0]?.[idx]
          ? (1 - results.distances[0][idx]).toFixed(4)
          : "N/A",
        id: results.ids[0][idx],
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                query,
                results_count: formattedResults.length,
                results: formattedResults,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching knowledge base: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Get specific document by ID
server.tool(
  "get_document",
  {
    document_id: z.string().describe("The ID of the document to retrieve"),
  },
  async ({ document_id }) => {
    try {
      const collection = await getCollection();
      
      const result = await collection.get({
        ids: [document_id],
      });

      if (!result.documents || result.documents.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `Document with ID '${document_id}' not found.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                id: result.ids[0],
                content: result.documents[0],
                metadata: result.metadatas?.[0] || {},
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving document: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: List all documents with optional filtering
server.tool(
  "list_documents",
  {
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum number of documents to return (default: 10)"),
    offset: z
      .number()
      .min(0)
      .optional()
      .describe("Number of documents to skip (default: 0)"),
    filter: z
      .record(z.any())
      .optional()
      .describe("Optional metadata filter as JSON object"),
  },
  async ({ limit = 10, offset = 0, filter }) => {
    try {
      const collection = await getCollection();
      
      const result = await collection.get({
        limit,
        offset,
        where: filter,
      });

      if (!result.documents || result.documents.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No documents found in the knowledge base.",
            },
          ],
        };
      }

      const documents = result.documents.map((doc, idx) => ({
        id: result.ids[idx],
        content: doc,
        metadata: result.metadatas?.[idx] || {},
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total_returned: documents.length,
                documents,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing documents: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Get collection statistics
server.tool(
  "get_stats",
  {},
  async () => {
    try {
      const collection = await getCollection();
      const count = await collection.count();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                collection_name: CHROMA_COLLECTION,
                total_documents: count,
                chroma_host: CHROMA_HOST,
                chroma_port: CHROMA_PORT,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting stats: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Add document to knowledge base
server.tool(
  "add_document",
  {
    content: z.string().describe("The document content to add"),
    metadata: z
      .record(z.any())
      .optional()
      .describe("Optional metadata as JSON object"),
    document_id: z
      .string()
      .optional()
      .describe("Optional custom document ID (auto-generated if not provided)"),
  },
  async ({ content, metadata, document_id }) => {
    try {
      const collection = await getCollection();
      
      const id = document_id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await collection.add({
        ids: [id],
        documents: [content],
        metadatas: metadata ? [metadata] : undefined,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                document_id: id,
                message: "Document added successfully",
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error adding document: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Delete document from knowledge base
server.tool(
  "delete_document",
  {
    document_id: z.string().describe("The ID of the document to delete"),
  },
  async ({ document_id }) => {
    try {
      const collection = await getCollection();
      
      await collection.delete({
        ids: [document_id],
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Document '${document_id}' deleted successfully`,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error deleting document: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Knowledge Base MCP server running on stdio");
console.error(`Connected to Chroma at ${CHROMA_HOST}:${CHROMA_PORT}`);
console.error(`Using collection: ${CHROMA_COLLECTION}`);

// Made with Bob
