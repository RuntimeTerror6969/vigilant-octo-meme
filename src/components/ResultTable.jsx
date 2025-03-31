import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import Papa from 'papaparse';

// --- Styled Components ---

const TableContainer = styled.div`
  width: 100%;
  height: auto;
  max-height: ${props => Math.min(props.$pageSize * ROW_HEIGHT + HEADER_HEIGHT, 700)}px;
  overflow-x: auto !important;
  overflow-y: auto !important;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  position: relative;
  background: ${props => props.theme.surface};
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    font-size: 14px;
    max-width: 100vw;
  }
`;

const EmptyStateContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${props => props.theme.text};
  font-size: 1.1rem;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  margin: 20px 0;
`;

const HeaderRow = styled.div`
  display: flex;
  background: ${props => props.theme.headerBg};
  border-bottom: 2px solid ${props => props.theme.border};
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  height: 48px;
  width: fit-content;
  min-width: 100%;
  color: ${props => props.theme.text};
`;

const Cell = styled.div`
  padding: 0 12px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 100px;
  flex: 1;
  box-sizing: border-box;
  color: ${props => props.theme.text};
  border-right: 1px solid ${props => props.theme.border};

  @media (max-width: 768px) {
    padding: 0 8px;
    min-width: 80px;
    font-size: inherit;
  }

  &:last-child {
    border-right: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: space-between;
    
    input {
      flex-grow: 1;
      min-width: 120px;
    }
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  background-color: ${props => props.theme.primary};
  color: white;

  &:hover {
    background-color: ${props => props.theme.primary}dd;
  }

  &.filter {
    background-color: ${props => props.theme.secondary};
    &:hover {
      background-color: ${props => props.theme.secondary}dd;
    }
  }

  &:disabled {
    background-color: ${props => props.theme.border};
    cursor: not-allowed;
  }
`;

const FilterInput = styled.input`
  padding: 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  margin-right: 10px;
  width: 200px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};

  &::placeholder {
    color: ${props => props.theme.text}aa;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px;
  background: ${props => props.theme.headerBg};
  border-radius: 4px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    
    & > div {
      display: flex;
      justify-content: center;
    }
  }
`;

const PageSizeSelect = styled.select`
  padding: 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  margin-right: 10px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};

  &:disabled {
    background: ${props => props.theme.border};
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text};
  text-align: center;
`;

const PageNavigation = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: space-between;
    width: 100%;
  }
`;

// Update TableWrapper to handle mobile view better
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  
  @media (max-width: 768px) {
    margin: 0 -16px;
    padding: 0 16px;
    width: calc(100% + 32px);
  }
`;

// Update the Row component to handle mobile view
const Row = styled.div`
  display: flex;
  align-items: stretch;
  width: fit-content;
  min-width: 100%;
  border-bottom: 1px solid ${props => props.theme.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    font-size: inherit;
  }
`;

// --- Constants ---
const HEADER_HEIGHT = 48;
const ROW_HEIGHT = 48;
const TABLE_HEIGHT = 450;
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// --- Component ---
function ResultTable({ data }) {
  const tableContainerRef = useRef(null); // Ref to measure container width
  const [containerWidth, setContainerWidth] = useState(0); // State to store measured width
  const [filterText, setFilterText] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // --- Measure Container Width ---
  useEffect(() => {
    const measureContainer = () => {
      if (tableContainerRef.current) {
        // Use clientWidth to get width excluding scrollbar if present
        setContainerWidth(tableContainerRef.current.clientWidth);
      }
    };

    measureContainer(); // Initial measurement
    window.addEventListener('resize', measureContainer); // Re-measure on resize

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', measureContainer);
    };
  }, []); // Empty dependency array ensures this runs once on mount + cleanup on unmount

  // --- Filter Data ---
  useEffect(() => {
    if (!filterText) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(row => {
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(filterText.toLowerCase())
      );
    });
    setFilteredData(filtered);
    setCurrentPage(0); // Reset to first page when filtering
  }, [data, filterText]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  // --- Export to CSV ---
  const handleExport = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'table_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update calculateColumnWidth to create more proportional columns
  const calculateColumnWidth = useCallback((key) => {
    // Determine minimum column width based on content
    const headerLength = key.length;
    const maxContentLength = Math.max(
      10,
      ...filteredData.map(row => String(row[key] ?? '').length)
    );
    
    // Calculate width based on content (characters * approximate pixel width + padding)
    const width = Math.max(headerLength, maxContentLength) * 8 + 24;
    
    // Ensure column is not too narrow or too wide
    return Math.max(100, Math.min(350, width));
  }, [filteredData]);

  // Add a function to distribute widths more evenly
  const getColumnWidths = useCallback(() => {
    if (!filteredData || filteredData.length === 0 || !containerWidth) return [];
    
    const keys = Object.keys(filteredData[0]);
    const contentWidths = keys.map(key => {
      const headerLength = key.length;
      const maxContentLength = Math.max(
        10,
        ...filteredData.map(row => String(row[key] ?? '').length)
      );
      return Math.max(headerLength, maxContentLength) * 8 + 24;
    });
    
    // Calculate total content width
    const totalContent = contentWidths.reduce((sum, w) => sum + w, 0);
    
    // If total content is less than container, distribute remaining space proportionally
    if (totalContent < containerWidth) {
      const extraPerColumn = (containerWidth - totalContent) / keys.length;
      return contentWidths.map(w => w + extraPerColumn);
    }
    
    return contentWidths;
  }, [filteredData, containerWidth]);

  // Update columns definition to use the distributed widths
  const columns = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    const keys = Object.keys(filteredData[0]);
    return keys.map(key => ({
      accessorKey: key,
      header: key,
      width: calculateColumnWidth(key),
      cell: info => String(info.getValue() ?? ''),
    }));
  }, [filteredData, calculateColumnWidth]);

  // --- Total Calculated Content Width (Memoized) ---
  const totalContentWidth = useMemo(
    () => columns.reduce((sum, col) => sum + col.width, 0),
    [columns]
  );

  // --- Determine the Width to Render Inner Elements ---
  // Use containerWidth if it's larger than content width AND has been measured
  const renderWidth = containerWidth > 0 ? Math.max(totalContentWidth, containerWidth) : totalContentWidth;

  // --- TanStack Table Instance ---
  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: totalPages,
  });

  const { rows } = table.getRowModel();

  // --- Virtual Row Renderer (Memoized) ---
  const VirtualRow = useCallback(({ index, style }) => {
    const row = rows[index];
    if (!row) return null;

    return (
      <div style={{ ...style, display: 'flex' }}>
        {row.getVisibleCells().map(cell => (
          <Cell
            key={cell.id}
            style={{ 
              width: `${cell.column.columnDef.width}px`,
              minWidth: `${cell.column.columnDef.width}px` 
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </Cell>
        ))}
      </div>
    );
  }, [rows]);

  // --- Calculate List Height ---
  const listHeight = Math.min(paginatedData.length * ROW_HEIGHT, TABLE_HEIGHT - HEADER_HEIGHT);

  // Handle case where data is null or empty
  if (!data) {
    return (
      <EmptyStateContainer>
        Run a query to see results
      </EmptyStateContainer>
    );
  }

  // Handle case where data/columns are not ready yet
  if (columns.length === 0) {
    return (
      <>
        <ButtonContainer>
          <FilterInput
            type="text"
            placeholder="Filter data..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <Button className="filter" onClick={() => setFilterText('')}>
            Clear Filter
          </Button>
          <Button onClick={handleExport}>
            Export CSV
          </Button>
        </ButtonContainer>
        <EmptyStateContainer>
          {filterText ? 'No matching records found' : 'No data available'}
        </EmptyStateContainer>
        <PaginationContainer>
          <div>
            <PageSizeSelect value={pageSize} disabled>
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>
                  {size} rows per page
                </option>
              ))}
            </PageSizeSelect>
          </div>
          <PageInfo>
            Showing 0 to 0 of 0 entries
          </PageInfo>
          <PageNavigation>
            <Button disabled>Previous</Button>
            <Button disabled>Next</Button>
          </PageNavigation>
        </PaginationContainer>
      </>
    );
  }

  return (
    <>
      <ButtonContainer>
        <FilterInput
          type="text"
          placeholder="Filter data..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <Button className="filter" onClick={() => setFilterText('')}>
          Clear
        </Button>
        <Button onClick={handleExport}>
          Export
        </Button>
      </ButtonContainer>
      <TableWrapper>
        <TableContainer ref={tableContainerRef} $pageSize={pageSize}>
          <HeaderRow>
            {table.getHeaderGroups().map(headerGroup => (
              <React.Fragment key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <Cell
                    key={header.id}
                    style={{ 
                      width: `${header.column.columnDef.width}px`,
                      minWidth: `${header.column.columnDef.width}px` 
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Cell>
                ))}
              </React.Fragment>
            ))}
          </HeaderRow>

          <List
            height={paginatedData.length * ROW_HEIGHT}
            itemCount={paginatedData.length}
            itemSize={ROW_HEIGHT}
            width="100%"
            style={{ overflow: 'visible !important' }}
          >
            {VirtualRow}
          </List>
        </TableContainer>
      </TableWrapper>

      <PaginationContainer>
        <div>
          <PageSizeSelect
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size} rows per page
              </option>
            ))}
          </PageSizeSelect>
        </div>
        <PageInfo>
          {filteredData.length > 0 ? (
            `Showing ${currentPage * pageSize + 1} to ${Math.min((currentPage + 1) * pageSize, filteredData.length)} of ${filteredData.length} entries`
          ) : (
            'Showing 0 entries'
          )}
        </PageInfo>
        <PageNavigation>
          <Button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </PageNavigation>
      </PaginationContainer>
    </>
  );
}

export default ResultTable;