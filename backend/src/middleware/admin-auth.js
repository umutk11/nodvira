export function requireAdmin(request, response, next) {
  if (!request.session?.admin?.id) {
    return response.status(401).json({
      error: "authentication_required",
      message: "Bu işlem için yönetici girişi gerekiyor.",
    });
  }

  return next();
}

