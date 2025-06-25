import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./css/styles.css";
import { WelcomePage } from "./components/WelcomePage";
import { LoginPage } from "./components/LoginPage";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { StudentBioData } from "./components/StudentBioData";
import QuestionPage  from "./components/QuestionPage";
import AdminPage from "./pages/admin-page";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/student-bio-data/*" element={<StudentBioData />} />
          <Route path="/question-page" element={<QuestionPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
