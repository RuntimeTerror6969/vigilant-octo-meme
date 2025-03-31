import Select from 'react-select';
import styled from 'styled-components';

const SelectContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-top: 10px;
  }
`;

// Create a responsive styles object that adapts to both light and dark themes
function getCustomStyles(isDarkMode) {
  return {
    control: (provided) => ({
      ...provided,
      border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`,
      borderRadius: '4px',
      boxShadow: 'none',
      backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
      '&:hover': {
        border: `1px solid ${isDarkMode ? '#666' : '#999'}`,
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? (isDarkMode ? '#42a5f5' : '#2684FF')
        : (isDarkMode ? '#2d2d2d' : 'white'),
      color: state.isSelected
        ? 'white'
        : (isDarkMode ? '#fff' : '#000'),
      '&:hover': {
        backgroundColor: state.isSelected
          ? (isDarkMode ? '#42a5f5' : '#2684FF')
          : (isDarkMode ? '#333' : '#f0f0f0'),
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? '#fff' : '#000',
    }),
    input: (provided) => ({
      ...provided,
      color: isDarkMode ? '#fff' : '#000',
    }),
  };
}

function QuerySelector({ options, value, onChange, isDarkMode }) {
  const customStyles = getCustomStyles(isDarkMode);
  
  return (
    <SelectContainer>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        styles={customStyles}
        placeholder="Select a query..."
      />
    </SelectContainer>
  );
}

export default QuerySelector; 