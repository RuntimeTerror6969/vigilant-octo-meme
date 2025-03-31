# Application Architecture

## Component Structure

```mermaid
graph TD
    A[App] --> B[QueryEditor]
    A --> C[QuerySelector]
    A --> D[ResultTable]
    A --> E[QueryInput]
    
    B --> F[Code Editor]
    B --> G[Theme Toggle]
    
    C --> H[Query Dropdown]
    C --> I[Clear Button]
    
    D --> J[Virtualized Table]
    D --> K[Export Button]
    
    E --> L[Query Input Field]
    E --> M[Submit Button]
    
    F --> N[SQL Syntax Highlighting]
    J --> O[Windowed Rendering]
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant QueryInput
    participant QueryEditor
    participant QuerySelector
    participant ResultTable
    
    User->>QueryInput: Types Query
    User->>QueryInput: Clicks Submit
    QueryInput->>QueryEditor: Updates Editor Content
    User->>QuerySelector: Selects Predefined Query
    QuerySelector->>QueryEditor: Updates Editor Content
    User->>QueryEditor: Clicks Run Query
    QueryEditor->>ResultTable: Displays Results
    User->>ResultTable: Exports to CSV
```

## Component Responsibilities

### App Component
- Main container component
- Manages application state
- Coordinates between child components
- Handles theme switching

### QueryEditor Component
- Provides SQL code editor interface
- Manages query input
- Handles syntax highlighting
- Supports theme switching

### QuerySelector Component
- Manages predefined queries
- Handles query selection
- Provides clear functionality
- Updates editor content

### ResultTable Component
- Displays query results
- Implements virtualized rendering
- Handles large datasets
- Provides export functionality

### QueryInput Component
- Provides text input for queries
- Handles query submission
- Updates editor content
- Manages input state

## State Management

```mermaid
graph LR
    A[App State] --> B[Current Query]
    A --> C[Selected Theme]
    A --> D[Query Results]
    B --> E[Editor Content]
    B --> F[Input Value]
    D --> G[Table Data]
```

## Performance Optimizations

```mermaid
graph TD
    A[Performance Optimizations] --> B[Code Splitting]
    A --> C[Virtualization]
    A --> D[Memoization]
    A --> E[Lazy Loading]
    
    B --> F[Dynamic Imports]
    C --> G[Windowed Rendering]
    D --> H[useMemo/useCallback]
    E --> I[Component Lazy Loading]
```

## Technology Stack

```mermaid
graph LR
    A[Frontend Stack] --> B[React]
    A --> C[Vite]
    A --> D[Styled Components]
    A --> E[React Table]
    A --> F[React Window]
    A --> G[React Ace]
    A --> H[Papa Parse]
``` 