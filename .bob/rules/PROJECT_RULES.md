# Project Rules: Source Search Priority and Ordering

## Overview
This document defines the custom rules for ordering and prioritizing information sources when answering questions. The system follows a hierarchical search strategy with intelligent fallback mechanisms.

---

## Mode Switching Rules

### Diagram Generation
**Rule**: If a conversation requires generating diagrams, flowcharts, architecture diagrams, or any visual representations, ALWAYS switch to Draw.io mode.

**Trigger Conditions**:
- User requests a diagram, flowchart, or visual representation
- Question involves "draw", "diagram", "flowchart", "architecture", "visualize"
- Need to illustrate system architecture, process flow, or network topology
- Creating or modifying .drawio files

**Action**: Use `switch_mode` tool to switch to `drawio` mode before generating any diagrams.

**Example Triggers**:
- "Create a flowchart for..."
- "Draw an architecture diagram..."
- "Visualize the process..."
- "Generate a network topology..."
- "Show me a diagram of..."

---

## Source Priority Hierarchy

### 1. **GitHub MCP** (Primary - Always Search First)
- **Priority**: HIGHEST
- **When**: ALWAYS search first for every question
- **Purpose**: Primary source for Terraform IBM Modules organization information
- **Content**: Repository information, code examples, module documentation, issues, PRs
- **Output Requirements**:
  - Provide GitHub repository URL
  - Include file paths when referencing code
  - Link to specific commits or branches when relevant

### 2. **TIM-MCP** (Code-Related Questions)
- **Priority**: HIGH (for code-related queries)
- **When**: Question involves code, programming, implementation, or technical details
- **Trigger Keywords**: 
  - Code, function, class, method, implementation
  - Programming languages (Python, JavaScript, Terraform, etc.)
  - Technical terms (API, module, library, package)
  - Development terms (debug, error, syntax, compile)
- **Purpose**: Specialized code search and analysis
- **Output Requirements**:
  - Provide file name and line numbers
  - Include code snippets with context
  - Reference module/package names

### 3. **GitHub MCP** (Secondary Search)
- **Priority**: MEDIUM
- **When**: Information not found in TIM-MCP (for code questions) OR after initial GitHub search
- **Purpose**: Deeper search in GitHub repositories, documentation, wikis
- **Output Requirements**:
  - Repository name and URL
  - Documentation section references
  - Wiki page links if applicable

### 4. **Box-Skill** (Document Search)
- **Priority**: MEDIUM-LOW
- **When**: No relevant information found in GitHub MCP or TIM-MCP
- **Purpose**: Search internal documentation in MyBoxDocs folder
- **Content**: Box notes, internal documents, handover materials
- **Output Requirements**:
  - Exact filename from MyBoxDocs
  - Document section or heading
  - Quote relevant passages

### 5. **Knowledgebase MCP Server** (Custom MCP)
- **Priority**: LOW
- **When**: No information found in any previous sources
- **Purpose**: General knowledge base and custom documentation
- **Output Requirements**:
  - Source document name
  - Knowledge base category
  - Timestamp of information if available

### 6. **GitHub MCP Fallback** (Final Fallback)
- **Priority**: FALLBACK
- **When**: No related information found in any source
- **Purpose**: Provide general information about Terraform-IBM-modules organization
- **Content**: Organization overview, popular repositories, getting started guides
- **Output Requirements**:
  - Organization URL: https://github.com/terraform-ibm-modules
  - List of relevant repositories
  - General documentation links

---

## Search Flow Decision Tree

```
Question Received
    ↓
[0] Needs Diagram/Visualization?
    ↓
    ├─→ YES → Switch to Draw.io Mode
    │         ↓
    │         Generate Diagram
    │         ↓
    │         Return to Code Mode
    ↓
    └─→ NO → Continue to Search
    ↓
[1] Search GitHub MCP (ALWAYS)
    ↓
    ├─→ Information Found? → Return with GitHub URL
    ↓
    └─→ Not Found → Continue
    ↓
[2] Is Question Code-Related?
    ↓
    ├─→ YES → Search TIM-MCP
    │         ↓
    │         ├─→ Found? → Return with file name + line numbers
    │         └─→ Not Found → Continue to [3]
    ↓
    └─→ NO → Skip to [3]
    ↓
[3] Search GitHub MCP (Secondary/Deeper)
    ↓
    ├─→ Found? → Return with repository details
    └─→ Not Found → Continue
    ↓
[4] Search Box-Skill (MyBoxDocs)
    ↓
    ├─→ Found? → Return with filename
    └─→ Not Found → Continue
    ↓
[5] Search Knowledgebase MCP
    ↓
    ├─→ Found? → Return with source name
    └─→ Not Found → Continue
    ↓
[6] Fallback to GitHub MCP
    ↓
    Return Terraform-IBM-modules org info
```

---

## Code-Related Question Detection

### Criteria for Code-Related Questions
A question is considered code-related if it contains:

1. **Programming Language Keywords**:
   - Python, JavaScript, TypeScript, Go, Java, Terraform, HCL
   - Ruby, Shell, Bash, PowerShell, C, C++, Rust

2. **Code Structure Terms**:
   - Function, method, class, interface, struct
   - Variable, constant, parameter, argument
   - Module, package, library, dependency

3. **Development Actions**:
   - Implement, code, write, develop, program
   - Debug, fix, error, exception, bug
   - Compile, build, deploy, run, execute

4. **Technical Concepts**:
   - API, endpoint, request, response
   - Database, query, schema, table
   - Configuration, environment, settings

5. **File Extensions**:
   - .py, .js, .ts, .go, .tf, .java, .rb, .sh

### Examples
- ✅ Code-Related: "How do I implement authentication in Python?"
- ✅ Code-Related: "What's the syntax for creating a VPC module?"
- ✅ Code-Related: "Debug this Terraform error"
- ❌ Not Code-Related: "What is the project timeline?"
- ❌ Not Code-Related: "Who is the project manager?"

---

## Output Format Requirements

### Standard Response Structure
```
**Source**: [Source Name]
**Location**: [URL/Filename/Path]

[Direct Answer]

**Reference**:
- [Specific link or file location]
- [Line numbers if applicable]
- [Additional context]
```

### Example Outputs

#### GitHub MCP Response
```
**Source**: GitHub MCP
**Location**: https://github.com/terraform-ibm-modules/terraform-ibm-vpc

The VPC module creates IBM Cloud VPC infrastructure with customizable subnets.

**Reference**:
- Repository: terraform-ibm-modules/terraform-ibm-vpc
- File: main.tf (lines 45-67)
- Documentation: README.md
```

#### TIM-MCP Response
```
**Source**: TIM-MCP
**Location**: modules/vpc/main.tf

The resource block defines VPC configuration:
[code snippet]

**Reference**:
- File: modules/vpc/main.tf
- Lines: 23-45
- Module: terraform-ibm-vpc
```

#### Box-Skill Response
```
**Source**: Box-Skill
**Location**: MyBoxDocs/Handover Topics.boxnote

Project handover includes three main phases...

**Reference**:
- Document: Handover Topics.boxnote
- Section: Phase 1 - Initial Setup
```

---

## Information Presentation Guidelines

### 1. **Directness**
- Provide direct answers without unnecessary preamble
- Lead with the most relevant information
- Avoid conversational filler

### 2. **Conciseness**
- Keep responses focused and to-the-point
- Use bullet points for multiple items
- Summarize lengthy content

### 3. **Source Attribution**
- ALWAYS include source name
- ALWAYS include link/filename
- Include line numbers for code references
- Timestamp if relevant

### 4. **Context**
- Provide enough context to understand the answer
- Include related information when helpful
- Link to additional resources

### 5. **Accuracy**
- Quote exact text when possible
- Indicate if information is inferred
- Note if information might be outdated

---

## Special Cases

### Case 1: Multiple Sources Have Information
- Present information from highest priority source first
- Mention additional sources: "Also found in [Source]"
- Combine information if complementary

### Case 2: Partial Information Found
- Present what was found with source
- Indicate what's missing
- Suggest where to look for complete information

### Case 3: Conflicting Information
- Present both versions with sources
- Note the conflict explicitly
- Recommend verification method

### Case 4: No Information Found Anywhere
- Confirm search across all sources
- Provide Terraform-IBM-modules org overview
- Suggest alternative search terms or approaches

---

## Implementation Notes

### For Developers
- Implement source priority as ordered list
- Use async/parallel searches where possible
- Cache results to avoid redundant searches
- Log search paths for debugging

### For Users
- Be specific in questions for better results
- Include context when asking about code
- Specify if looking for specific file types
- Mention if you need historical information

---

## Maintenance

### Review Schedule
- Monthly review of source priorities
- Quarterly update of code-related keywords
- Annual comprehensive rule review

### Update Triggers
- New MCP servers added
- Source reliability changes
- User feedback on search quality
- Performance metrics indicate issues

---

**Version**: 1.0  
**Last Updated**: 2026-04-08  
**Status**: Active  
**Owner**: Bobathon Project Team