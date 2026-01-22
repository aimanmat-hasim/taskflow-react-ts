import { useEffect, useMemo, useState } from "react";
import logo from "./assets/Logo_1-removebg-preview.png";
import LiquidEther from "./LiquidEther";

type Filter = "all"|"active"|"done";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number; 
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const STORAGE_KEY = "taskflow.todos.v1";

type TodoFormProps = {
  onAdd: (title: string) => void;
};

function TodoForm({onAdd}: TodoFormProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    const trimmed = title.trim();
    if(!trimmed) return;
    onAdd(trimmed);
    setTitle("");
  }
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, justifyContent:"center", marginBottom:18 }}>
      <div style={{width: "min(760px, 92vw)", display: "flex", alignItems: "center", gap: 12, padding:"7px 10px", borderRadius: 999, margin:"0 auto",
        background: "rgba(118, 118, 123, 0.2)", border: "1px solid rgba(255, 255, 255, 0.00)", boxShadow: "0 10px 30px rgba(0,0,0,0.35)", backdropFilter: "blur(30px)" 
      }}>
        {/* optional left icon holder*/}
        <div
        style={{width: 80, height: 80, borderRadius: 0,fontWeight: 700, background:"rgba(255,255,255,0.00)" ,display: "grid", 
        placeItems: "center", overflow: "hidden"}}>
        <img
          src={logo}
          alt="logo"
          style={{width:"270%",height:"270%",objectFit: "cover", filter:`drop-shadow(0 0 1px white)`,position:"relative"}}/>
        </div>
        
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value) }
          placeholder="Type your task here Sire..."
          style={{ flex: 1, background:"transparent", border: "none", outline: "none", color:"white", fontSize:16}}
        />
      
        <button
          type="submit"
          style={{ padding: "18px 38px", borderRadius: 999, color:"white", border: "1px solid rgba(255, 255, 255, 0.00)", background:"rgba(113, 112, 120, 0.15)",
          fontWeight: 800,fontSize:17, letterSpacing:1, cursor: "pointer",position:"relative"}}
        >
          ADD
      </button>
    </div>
  </form>
  );
}

type TaskRowsProps = {
  todos: Todo[];
  onToggle: (id:string) => void;
  onDelete: (id:string) => void;
};

function TaskRows({ todos, onToggle, onDelete}:TaskRowsProps) {
  if (todos.length === 0) {
    return <div style={{ color:"rgba(255,255,255,0.6)"}}>No task yet. Add one above </div>;
  }

  return (
    <div style={{display:"grid", gap:12}}>
      {todos.map((t, idx) => (
        <div 
          key={t.id}
          style={{
            display: "grid",
            gridTemplateColumns:"90px 1fr 180px",
            alignItems:"center",
            padding:"14px 10px",
            borderRadius: 18,
            border:"1px solid rgba(255,255,255,0.12)",
            background:"rgba(255,255,255,0.04)"
          }}
        >
          {/*#column*/}
          <div style={{ textAlign:"center", color:"rgba(255,255,255,0.75)", fontWeight: 800}}>
            {String(idx+1).padStart(2,"0")}
          </div>

          {/*Description Column*/}
          <div
            style={{
              textAlign:"center",
              color:"rgba(255,255,255,0.92)",
              textDecoration: t.done? "line-through":"none",
              opacity: t.done? 0.55:1
            }}
          >
            {t.title}
          </div>
          {/* Status Column */}
          <div style={{ display:"flex", justifyContent: "center", gap: 10}}>
            <button
              onClick={() => onToggle(t.id)}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border:"1px solid rgba(255,255,255,0.14)",
                background:t.done ?"rgba(34,197,94,0.20)":"rgba(255,255,255,0.06)",
                color:"white",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {t.done ? "DONE": "ACTIVE"}
            </button>

            <button
            onClick={() => onDelete(t.id)}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(239,68,68,0.18)",
              color: "white",
              fontWeight: 800,
              cursor: "pointer"
            }}
            >
              DEL
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

useEffect(() => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as Todo[];
    setTodos(parsed);
  } catch {
    // Ignore storage errors
  }
}, []);

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
  setTodos((prev) => [newTodo, ...prev]); 
}

function toggleTodo(id: string) {
  setTodos((prev) =>
    prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) 
  );
}

function deleteTodo(id: string) {
  setTodos((prev) => prev.filter((t) => t.id !== id)); 
}

const visibleTodos = useMemo(() => {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "done") return todos.filter((t) => t.done);
  return todos;
}, [todos, filter]);
return (
  <div 
    style={{ 
      position: "relative", zIndex: 0, minHeight: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
    {/*BACKGROUND + LAYOUT*/}
    <div style={{position:"fixed", inset: 0, zIndex: 0, pointerEvents :"none"}}>
      <LiquidEther 
      colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
      mouseForce={20}
      cursorSize={100}
      isViscous
      viscous={30}
      iterationsViscous={32}
      iterationsPoisson={32}
      resolution={0.5}
      isBounce={false}
      autoDemo
      autoSpeed={0.5}
      autoIntensity={2.2}
      takeoverDuration={0.25}
      autoResumeDelay={3000}
      autoRampDuration={0.6} />
    </div>
      <div style={{maxWidth: 1100, padding: "40px 20px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", transform:"translateX(23vw)"}}>
      {/*TITLE*/}
      <div> 
        <h1 style={{fontFamily:"'Press Start 2P', monospace", fontSize:36, color: "#ffffff"}}> Life Mission Task</h1>
        <p style={{fontSize:16,letterSpacing:2, opacity: 0.5, transform: "translateX(7vw)"}}>
          Organize the Conquest Here Sire 
        </p>
      </div>

      {/* INPUT BAR */}
      <div style={{ display: "grid", gap: 22, position: "relative"}}> 
        <TodoForm onAdd={addTodo} />
        {/* TASK PANEL + FILTERS */}
        <div 
        style={{marginTop:22, display:"grid", gridTemplateColumns:"900px 140px", gap:24, alignItems:"start"}}
        >
          {/* LEFT:THE BIG TASK CONTAINER */}
          <div
            style={{borderRadius: 26, padding: 26, minHeight: 390, background: "rgba(10,12,20,0.55)", border:"1px solid rgba(255,255,255,0.16)",boxShadow:"0 18px 50px rgba(0,0,0,0.45)", 
              backdropFilter:"blur(10px)", width:"100%"}}
          >
            {/*Header Row*/}
            <div
              style={{display:"grid", gridTemplateColumns:"90px 1fr 180px", padding:"10px 8px" ,color:"rgba(255,255,255,0.85)",fontWeight: 700, letterSpacing:0.6}}
            >
              <div style={{ textAlign: "center"}}>#</div>
              <div style={{ textAlign: "center"}}>Description</div>
              <div style={{ textAlign: "center"}}>Status</div>
            </div>
            
            <div
              style={{height: 1,background: "rgba(255,255,255,0.12)", margin: "10px 0 18px"}}
            />
            
            {/* TASK LIST GOES HERE (next step)*/}
            <TaskRows todos={visibleTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
          </div>
          
          {/* Filter Buttons */}
          <div style={{display: "grid", gap: 14, position: "relative", transform: "translate(50px, 130px)"}}>
            {(["all","active","done"] as const).map((f)=>(
              <button
                key={f}
                onClick={()=>setFilter(f)}
                style={{padding:"14px 0", borderRadius: 999, border:"1px solid rgba(255,255,255,0.14)",
                  background:filter === f ? "rgba(86,78,155,0.55)":"rgba(86,78,155,0.28)", color:"white", fontWeight: 800,
                  letterSpacing: 1, cursor:"pointer"}}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}