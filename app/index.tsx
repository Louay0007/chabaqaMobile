import { Redirect } from "expo-router";

export default function Index() {
  // Redirection simple sans vérification d'auth pour éviter les boucles
  // L'authentification est gérée par chaque route protégée individuellement
  return <Redirect href="/(communities)" />;
}
