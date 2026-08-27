// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";
import Commandes from "./pages/dashboard/Commandes";
import CommandeDetail from "./pages/dashboard/CommandeDetail";
import NouvelleCommande from "./pages/dashboard/NouvelleCommande";
import Livraisons from "./pages/dashboard/Livraisons";
import Notifications from "./pages/dashboard/Notifications";
import Parametres from "./pages/dashboard/Parametres";

import LivreurLogin from "./pages/livreur/LivreurLogin";
import Missions from "./pages/livreur/Missions";
import MissionDetail from "./pages/livreur/MissionDetail";
import Confirmation from "./pages/livreur/Confirmation";
import Profil from "./pages/livreur/Profil";

import SuiviCommande from "./pages/public/SuiviCommande";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/livreur/login" element={<LivreurLogin />} />

          {/* Public — suivi client, pas d'authentification */}
          <Route path="/suivi/:numero" element={<SuiviCommande />} />

          {/* Commerçant / Admin */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["COMMERCANT", "ADMIN"]}><Dashboard /></ProtectedRoute>
          } />
          <Route path="/commandes" element={
            <ProtectedRoute allowedRoles={["COMMERCANT", "ADMIN"]}><Commandes /></ProtectedRoute>
          } />
          <Route path="/commandes/nouvelle" element={
            <ProtectedRoute allowedRoles={["COMMERCANT", "ADMIN"]}><NouvelleCommande /></ProtectedRoute>
          } />
          <Route path="/commandes/:id" element={
            <ProtectedRoute allowedRoles={["COMMERCANT", "ADMIN"]}><CommandeDetail /></ProtectedRoute>
          } />
          <Route path="/livraisons" element={
            <ProtectedRoute allowedRoles={["COMMERCANT", "ADMIN"]}><Livraisons /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={["COMMERCANT", "ADMIN", "LIVREUR"]}><Notifications /></ProtectedRoute>
          } />
          <Route path="/parametres" element={
            <ProtectedRoute allowedRoles={["COMMERCANT", "ADMIN"]}><Parametres /></ProtectedRoute>
          } />

          {/* Livreur */}
          <Route path="/livreur/missions" element={
            <ProtectedRoute allowedRoles={["LIVREUR"]}><Missions /></ProtectedRoute>
          } />
          <Route path="/livreur/missions/:id" element={
            <ProtectedRoute allowedRoles={["LIVREUR"]}><MissionDetail /></ProtectedRoute>
          } />
          <Route path="/livreur/missions/:id/confirmer" element={
            <ProtectedRoute allowedRoles={["LIVREUR"]}><Confirmation /></ProtectedRoute>
          } />
          <Route path="/livreur/profil" element={
            <ProtectedRoute allowedRoles={["LIVREUR"]}><Profil /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}