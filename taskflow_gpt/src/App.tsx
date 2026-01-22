import { useEffect, useMemo, useState } from "react";


type Filter = "all" | "active" | "done";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

function uid() {
  // simple unique id (good enough for this mini project)
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const STORAGE_KEY = "taskflow.todos.v1";

type TodoFormProps = {
  onAdd: (title: string) => void;
};

function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
      />
      <button style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}>
        Add
      </button>
    </form>
  );
}

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 10,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />

      <span style={{ flex: 1, textDecoration: todo.done ? "line-through" : "none", opacity: todo.done ? 0.6 : 1 }}>
        {todo.title}
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
      >
        Delete
      </button>
    </li>
  );
}

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p style={{ opacity: 0.7 }}>No tasks here. Add one 👆</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
      {todos.map((t) => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}

type FilterBarProps = {
  filter: Filter;
  setFilter: (f: Filter) => void;
  remaining: number;
  total: number;
};

function FilterBar({ filter, setFilter, remaining, total }: FilterBarProps) {
  const btn = (f: Filter, label: string) => (
    <button
      onClick={() => setFilter(f)}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #ddd",
        fontWeight: filter === f ? 700 : 400,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {btn("all", "All")}
        {btn("active", "Active")}
        {btn("done", "Done")}
      </div>
      <div style={{ opacity: 0.7 }}>
        {remaining} remaining / {total} total
      </div>
    </div>
  );
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  // Load once
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Todo[];
      setTodos(parsed);
    } catch {
      // ignore bad storage
    }
  }, []);

  // Save whenever todos changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  function addTodo(title: string) {
    const newTodo: Todo = {
      id: uid(),
      title,
      done: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]); // new array (immutable)
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) // new array + new object
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id)); // new array
  }

  function clearDone() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 6 }}>TaskFlow ✅</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>React + TypeScript mini project (state, props, lists, effects).</p>

      <div style={{ display: "grid", gap: 14 }}>
        <TodoForm onAdd={addTodo} />

        <FilterBar filter={filter} setFilter={setFilter} remaining={remaining} total={todos.length} />

        <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={deleteTodo} />

        {todos.some((t) => t.done) && (
          <button
            onClick={clearDone}
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd" }}
          >
            Clear done tasks
          </button>
        )}
      </div>
    </div>
  );
}
