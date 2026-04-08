---
name: box-skill
description: Get information from box-docs with fallback to knowledge-base MCP
---

## Overview
This skill retrieves information from local documentation and knowledge bases following the global fallback strategy defined in `.bob/skill_rules.yaml`.

## Skill Purpose
- Search and retrieve information from MyBoxDocs folder
- Fallback to knowledge-base MCP server when local search is insufficient
- Provide comprehensive answers with proper source attribution

## Configuration
This skill follows the global rules defined in:
- **Global Rules File**: `.bob/skill_rules.yaml`
- **Fallback Strategy**: Two-tier approach (Local → MCP)
- **Priority**: Local files first, then MCP knowledge-base

## Usage
When a user asks for information:
1. The skill automatically follows the search priority defined in global rules
2. Local MyBoxDocs folder is searched first
3. If insufficient results, knowledge-base MCP is queried
4. Results are presented with clear source attribution

## Notes
- All fallback logic and priorities are managed in `.bob/skill_rules.yaml`
- This keeps skill definitions clean and maintainable
- Global rules can be updated without modifying individual skills