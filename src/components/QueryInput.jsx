import { useState } from "react";

function QueryInput({onQueryExecute}) {
    const [query,setQuery] = useState('')
    const [inputValue,setInputValue] = useState('')
    const handleQueryExecute = () => {
        onQueryExecute(inputValue)
        setInputValue('')
    }
  return (
    <div>
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter your query" />
      <button onClick={handleQueryExecute}>Submit</button>
    </div>
  );
}

export default QueryInput;