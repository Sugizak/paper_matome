import {useState,useEffect} from 'react';
// Dropdownコンポーネントは変更なし
export default function Dropdown({option,options, IncludeBlank=true,onTextChange }) {
  const [selectedValue, setSelectedValue] = useState(option);

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    onTextChange(event.target.value);
  };

  // useEffect(() => {
    
  // }, [selectedValue, onTextChange]);

  return (
    <div className="p-2 w-min-100">
      <select  value={selectedValue} onChange={handleChange}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center"
      >
        {IncludeBlank?
        <option key={""} value={""}></option>:
        null
        }
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}