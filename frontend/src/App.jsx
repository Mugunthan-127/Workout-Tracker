import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddWorkout from "./pages/AddWorkout";
import History from "./pages/History";

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/add-workout" element={<AddWorkout/>}/>
        <Route path="/history" element={<History/>}/>
      </Routes>
    </BrowserRouter>
  );
}
export default App;