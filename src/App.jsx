import { useState, useEffect, createContext } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import QueryEditor from './components/QueryEditor';
import ResultTable from './components/ResultTable';
import QuerySelector from './components/QuerySelector';
import categoriesData from './assets/categories.json';
import employeesData from './assets/employees.json';
import productsData from './assets/products.json';

const lightTheme = {
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#000000',
  border: '#ddd',
  primary: '#4CAF50',
  secondary: '#2196F3',
  error: '#f44336',
  headerBg: '#f5f5f5',
  hoverBg: '#f0f0f0'
};

const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  border: '#404040',
  primary: '#66bb6a',
  secondary: '#42a5f5',
  error: '#ef5350',
  headerBg: '#333333',
  hoverBg: '#404040'
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
    
    h1 {
      margin: 0;
      font-size: 1.5rem;
    }
  }
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const ResultSection = styled.section`
  background: ${props => props.theme.surface};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
`;

const QueryInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 8px;
  background: ${props => props.theme.headerBg};
  border-radius: 4px;
  font-family: monospace;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const ToggleButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.$active ? props.theme.primary : props.theme.surface};
  color: ${props => props.$active ? '#fff' : props.theme.text};
  cursor: pointer;
  &:hover {
    background: ${props => props.$active ? props.theme.primary : props.theme.hoverBg};
  }
`;

const ThemeToggle = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: ${props => props.theme.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: ${props => props.theme.primary}dd;
  }
`;

const SideSection = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: ${props => props.theme.surface};
  border-radius: 4px;
  border: 1px solid ${props => props.theme.border};
  
  @media (max-width: 768px) {
    margin-top: 15px;
  }
`;

const SideTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: ${props => props.theme.text};
`;

const QueryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    max-height: 150px;
  }
`;

const QueryItem = styled.li`
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  background: ${props => props.theme.headerBg};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  word-break: break-word;

  span {
    margin-right: 8px;
    flex: 1;
  }

  &:hover {
    background: ${props => props.theme.hoverBg};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    
    span {
      display: block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    button {
      align-self: flex-end;
    }
  }
`;

const BookmarkButton = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: ${props => props.theme.secondary};
  color: white;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    background: ${props => props.theme.secondary}dd;
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: ${props => props.theme.text};
`;

const predefinedQueries = [
  { value: 'allCategories', label: 'SELECT * FROM categories' },
  { value: 'beveragesOnly', label: 'SELECT * FROM categories WHERE categoryName = "Beverages"' },
  { value: 'nameDesc', label: 'SELECT categoryName, description FROM categories' },
  { value: 'allEmployees', label: 'SELECT * FROM employees' },
  { value: 'allProducts', label: 'SELECT * FROM products' }
];

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(predefinedQueries[0]);
  const [queryText, setQueryText] = useState(selectedQuery.label);
  const [queryResult, setQueryResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryStats, setQueryStats] = useState(null);
  const [showFullTable, setShowFullTable] = useState(true);
  const [columnsOnly, setColumnsOnly] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [bookmarkedQueries, setBookmarkedQueries] = useState([]);
  const [error, setError] = useState(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme) setIsDarkMode(JSON.parse(savedTheme));
    
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) setQueryHistory(JSON.parse(savedHistory));
    
    const savedBookmarks = localStorage.getItem('bookmarkedQueries');
    if (savedBookmarks) setBookmarkedQueries(JSON.parse(savedBookmarks));
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
    localStorage.setItem('bookmarkedQueries', JSON.stringify(bookmarkedQueries));
  }, [isDarkMode, queryHistory, bookmarkedQueries]);

  const handleQueryChange = (newQuery) => {
    setSelectedQuery(newQuery);
    setQueryText(newQuery.label);
  };

  const handleRunQuery = () => {
    executeQuery(queryText);
    // Add to history if not already present
    if (!queryHistory.some(q => q.label === queryText)) {
      setQueryHistory(prev => [{
        label: queryText,
        timestamp: new Date().toISOString()
      }, ...prev].slice(0, 10)); // Keep only last 10 queries
    }
  };

  const handleClearQuery = () => {
    setQueryText('');
    setQueryResult(null);
    setQueryStats(null);
  };

  const executeQuery = (query) => {
    setIsLoading(true);
    setError(null);
    const startTime = performance.now();
    
    // Basic SQL syntax validation
    const sqlKeywords = ['select', 'from', 'where', 'and', 'or', 'order by', 'group by', 'having'];
    const queryLower = query.toLowerCase();
    const hasValidKeywords = sqlKeywords.some(keyword => queryLower.includes(keyword));
    
    if (!hasValidKeywords) {
      const endTime = performance.now();
      const executionTime = ((endTime - startTime) / 1000).toFixed(3);
      setError('Invalid SQL syntax. Please use proper SQL keywords.');
      setQueryResult(null);
      setQueryStats({
        rows: 0,
        executionTime
      });
      setIsLoading(false);
      return;
    }

    let data;
    if (query.includes('categories')) {
      data = categoriesData.categories;
    } else if (query.includes('employees')) {
      data = employeesData.employees;
    } else if (query.includes('products')) {
      data = productsData.products;
    } else {
      const endTime = performance.now();
      const executionTime = ((endTime - startTime) / 1000).toFixed(3);
      setError('Invalid table name. Available tables: categories, employees, products');
      setQueryResult(null);
      setQueryStats({
        rows: 0,
        executionTime
      });
      setIsLoading(false);
      return;
    }

    if (query.toLowerCase().includes('where')) {
      if (query.toLowerCase().includes('beverages')) {
        data = data.filter(cat => cat.categoryName === 'Beverages');
      }
    }

    const randomDelay = Math.random() * 1000;
    setTimeout(() => {
      const endTime = performance.now();
      const executionTime = ((endTime - startTime + randomDelay) / 1000).toFixed(3);
      
      setQueryResult(data);
      setQueryStats({
        rows: data.length,
        executionTime
      });
      setIsLoading(false);
    }, randomDelay);
  };

  const handleBookmarkQuery = (query) => {
    if (!bookmarkedQueries.some(q => q.label === query)) {
      setBookmarkedQueries(prev => [...prev, {
        label: query,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleRemoveBookmark = (query) => {
    setBookmarkedQueries(prev => prev.filter(q => q.label !== query));
  };

  const getColumnsView = () => {
    if (!queryResult || queryResult.length === 0) return [];
    return Object.keys(queryResult[0]).map(key => ({ columnName: key }));
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <h1>SQL Query Viewer</h1>
          <ThemeToggle onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </ThemeToggle>
        </Header>
        
        <TopSection>
          <div>
            <QueryEditor
              value={queryText}
              onChange={setQueryText}
              onRun={handleRunQuery}
              onClear={handleClearQuery}
              isDarkMode={isDarkMode}
            />
            <SideSection>
              <SideTitle>Query History</SideTitle>
              <QueryList>
                {queryHistory.map((query, index) => (
                  <QueryItem key={index} onClick={() => setQueryText(query.label)}>
                    <span>{query.label}</span>
                    <BookmarkButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkQuery(query.label);
                      }}
                    >
                      Bookmark
                    </BookmarkButton>
                  </QueryItem>
                ))}
              </QueryList>
            </SideSection>
            <SideSection>
              <SideTitle>Bookmarked Queries</SideTitle>
              <QueryList>
                {bookmarkedQueries.map((query, index) => (
                  <QueryItem key={index} onClick={() => setQueryText(query.label)}>
                    <span>{query.label}</span>
                    <BookmarkButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBookmark(query.label);
                      }}
                    >
                      Remove
                    </BookmarkButton>
                  </QueryItem>
                ))}
              </QueryList>
            </SideSection>
          </div>
          <QuerySelector
            options={predefinedQueries}
            value={selectedQuery}
            onChange={handleQueryChange}
            isDarkMode={isDarkMode}
          />
        </TopSection>

        <ResultSection>
          {queryStats && (
            <QueryInfo>
              <span>{error ? 'Query failed' : 'Query executed successfully'}</span>
              <span>{queryStats.rows} rows in {queryStats.executionTime} seconds</span>
            </QueryInfo>
          )}

          <ViewToggle>
            <ToggleButton 
              $active={showFullTable && !columnsOnly}
              onClick={() => {
                setShowFullTable(true);
                setColumnsOnly(false);
              }}
            >
              Show Data
            </ToggleButton>
            <ToggleButton 
              $active={columnsOnly}
              onClick={() => {
                setShowFullTable(false);
                setColumnsOnly(true);
              }}
            >
              Show Columns
            </ToggleButton>
          </ViewToggle>

          {isLoading ? (
            <p>Loading data...</p>
          ) : error ? (
            <EmptyStateContainer>
              {error}
            </EmptyStateContainer>
          ) : queryResult && queryResult.length > 0 ? (
            <ResultTable 
              data={columnsOnly ? getColumnsView() : queryResult}
              isDarkMode={isDarkMode}
            />
          ) : (
            <EmptyStateContainer>
              No matching records found
            </EmptyStateContainer>
          )}
        </ResultSection>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;