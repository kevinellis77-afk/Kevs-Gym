type Props = {
    exercises: string[];
    value: string;
    onChange: (name: string) => void;
  };
  
  export default function ExercisePicker({
    exercises,
    value,
    onChange,
  }: Props) {
    return (
      <select
        className="select-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {exercises.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    );
  }
  