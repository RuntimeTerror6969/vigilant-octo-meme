import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import styled from 'styled-components';

const EditorContainer = styled.div`
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;
    
    button {
      flex: 1;
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

  &.run {
    background-color: ${props => props.theme.primary};
    color: white;
    &:hover {
      background-color: ${props => props.theme.primary}dd;
    }
  }

  &.clear {
    background-color: ${props => props.theme.error};
    color: white;
    &:hover {
      background-color: ${props => props.theme.error}dd;
    }
  }
`;

function QueryEditor({ value, onChange, onRun, onClear, isDarkMode }) {
  // Determine editor height based on screen size
  const editorHeight = window.innerWidth <= 768 ? "250px" : "400px";
  
  return (
    <EditorContainer>
      <AceEditor
        mode="sql"
        theme={isDarkMode ? "monokai" : "github"}
        onChange={onChange}
        value={value}
        name="query-editor"
        width="100%"
        height={editorHeight}
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
      <ButtonContainer>
        <Button className="run" onClick={onRun}>
          Run Query
        </Button>
        <Button className="clear" onClick={onClear}>
          Clear
        </Button>
      </ButtonContainer>
    </EditorContainer>
  );
}

export default QueryEditor; 