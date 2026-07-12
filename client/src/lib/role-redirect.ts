/**
 * Devuelve la ruta del panel al que debe redirigirse un usuario según su rol.
 *
 * Centraliza la lógica de redirección post-login/registro que antes estaba
 * duplicada e incompleta (solo cubría certifier/admin, dejando notary, lawyer,
 * supervisor, seller y partner cayendo en /user-dashboard).
 */
export function redirectPathForRole(role?: string | null): string {
  switch (role) {
    case "admin":
      return "/admin-dashboard";
    case "certifier":
      return "/certifier-dashboard";
    case "notary":
      return "/notary-dashboard";
    case "lawyer":
      return "/lawyer-dashboard";
    case "supervisor":
      return "/supervisor/dashboard";
    case "seller":
      return "/seller/dashboard";
    case "partner":
      return "/partners/pos-integration";
    default:
      return "/user-dashboard";
  }
}
